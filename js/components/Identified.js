import React, { Component } from 'react'
import {
    Text,
    Alert,
    View,
    ScrollView,
    StyleSheet,
    AsyncStorage,
    Image,
    Animated,
    Dimensions,
    UIManager,
    LayoutAnimation
} from 'react-native'
import FastImage from 'react-native-fast-image'
import generalConstants from '../constants/general.js'
import colorConstants from '../constants/colors.js'
import { Button, Divider } from 'react-native-elements'
import { material } from 'react-native-typography'
import schemas from '../constants/schemas.js'
import RNFS from 'react-native-fs'
import Realm from 'realm'
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

const windowDimensions = Dimensions.get('window')

const isCloseToBottom = e => {
    const {layoutMeasurement, contentOffset, contentSize} = e.nativeEvent
    console.log(e)
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  }

export default class Identified extends Component {
    static navigationOptions = {
        title: 'Results'
    }

    constructor(props) {
        super(props)
        const params = this.props.navigation.state.params
        const classifications = params.classifications
        const base64 = params.base64

        this.state = {
            id: params.id,
            base64: base64,
            response: params.response,
            imageWidth: 0,
            imageHeight: 0,
            originalImageWidth: params.imageWidth,
            originalImageHeight: params.imageHeight,
            buttonGroupBottom: 0,
            classifications: classifications,
            bestItemName: '',
            bestItemScore: 0
        }

        let max = 0
        classifications.forEach(item => {
            if (item.score < max) return
            this.state.bestItemScore = item.score
            this.state.bestItemName = item.description
        })

        // Image should be downscaled, not upscaled
        let desiredWidth = windowDimensions.width * .9
        let desiredHeight = windowDimensions.height * .9
        if (params.imageWidth < desiredWidth) { // Then use the desired height
            desiredWidth = desiredHeight * params.imageWidth / params.imageHeight
        } else if (params.imageHeight > desiredHeight) { // Then use desired width
            desiredHeight = desiredWidth * params.imageHeight / params.imageWidth
        } else {
            desiredWidth = params.imageWidth
            desiredHeight = params.imageHeight
        }

        this.state.imageWidth = desiredWidth
        this.state.imageHeight = desiredHeight
    }

    componentDidMount() {
        // setTimeout(() => {
        //     LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        //     this.setState({ buttonGroupBottom: 0 })
        // }, 150)
    }

    save = async () => {
        // AsyncStorage.setItem(this.state.id, JSON.stringify({ response: this.state.response, success: true, base64: this.state.base64, date: new Date().toString(), classifications: this.state.classifications }))
        const path = `${generalConstants.photoDirectory}/${this.state.id}.jpg`
        try {
            await RNFS.mkdir(generalConstants.photoDirectory)
            await RNFS.writeFile(path, this.state.base64, 'base64')
            const realm = await Realm.open({ schema: schemas.all })
            // This write method might throw an exception
            realm.write(() => {
                realm.create(schemas.IdentifiedItemSchema.name, {
                    id: this.state.id,
                    image: {
                        path: path,
                        width: this.state.originalImageWidth,
                        height: this.state.originalImageHeight
                    },
                    response: this.state.response.toString(),
                    classifications: this.state.classifications
                })
            })

            console.log('saved success')
            Alert.alert('Saved!')
            this.props.navigation.goBack()
        } catch (err) {
            Alert.alert('Error', err.message)
            RNFS.unlink(path).catch(err => console.log(`Cannot delete ${path}:`, err))
            console.log(err)
        }
        // .then(() => {
        //     Alert.alert('Saved!')
        //     this.props.navigation.goBack()
        // })
        // .catch(err => {
        //     console.log(err)
        //     Alert.alert('Error', err.message)
        // })
    }

    discard = () => {
        this.props.navigation.goBack()
    }

    scrollEvent = e => {
        console.log(e)
        if (!isCloseToBottom(e)) return
        console.log('here')
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        this.setState({ buttonGroupBottom: 0 })
    }

    render () {
        const navProps = this.props.navigation.state.params
        return (
        <View style={{flex: 1}}>
            <ScrollView>
                <FastImage source={{uri: `data:image/jpg;base64,${navProps.base64}`}} style={ { ...styles.image, height: this.state.imageHeight, width: this.state.imageWidth } } resizeMode={FastImage.resizeMode.stretch}/>
                <Text style={{ ...material.headline, alignSelf: 'center'}}>Best Guess:</Text>
                <Text style={{ ...material.display1, alignSelf: 'center', fontWeight: 'bold', marginBottom: 100 }}>{ this.state.bestItemName }</Text>

                {/* <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View>
                <View style={styles.subcontainer}></View> */}
            
            </ScrollView>

            <View style={ {...styles.buttonGroup, bottom: this.state.buttonGroupBottom } }>
                <Button style={styles.absoluteButtonLeft} title='Trash' icon={{name: 'delete'}} raised onPress={this.discard} backgroundColor={colorConstants.danger}></Button>
                <Button style={styles.absoluteButtonRight} title='Save' icon={{name: 'save'}} raised onPress={this.save} backgroundColor={colorConstants.success}></Button>
            </View>

        </View>
        )
    }
}

const styles = StyleSheet.create({
    subcontainer: {
        height: 100,
        width: 100,
        borderWidth: 5,
        borderColor: 'green'
    },
    image: {
        marginVertical: 20,
        alignSelf: 'center'
    },
    buttonGroup: {
        width: windowDimensions.width,
        position: 'absolute',
        // bottom: -50,
        // backgroundColor: 'green',
        flexDirection: 'row',
        // alignContent: 'space-around',
        justifyContent: 'space-evenly',
        // padding: 15
        marginBottom: 15    
    },
    absoluteButtonLeft: {
        // position: 'absolute',
        // left: 0
    },
    absoluteButtonRight: {
        // position: 'absolute',
        // right: 0
    }
})