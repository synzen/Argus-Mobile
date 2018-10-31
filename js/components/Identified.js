import React, { Component } from 'react'
import {
    Text,
    Alert,
    View,
    ScrollView,
    StyleSheet,
    AsyncStorage,
    Image,
    Dimensions,
    UIManager,
    LayoutAnimation
} from 'react-native'
import FastImage from 'react-native-fast-image'
import colorConstants from '../constants/colors.js'
import { Button, Divider } from 'react-native-elements'
import { material } from 'react-native-typography'
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

const windowDimensions = Dimensions.get('window')

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
            buttonGroupBottom: -100,
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
            console.log(1)
            desiredWidth = desiredHeight * params.imageWidth / params.imageHeight
        } else if (params.imageHeight > desiredHeight) { // Then use desired width
            console.log(2)
            desiredHeight = desiredWidth * params.imageHeight / params.imageWidth
        } else {
            console.log(3)
            console.log(params.imageHeight)
            desiredWidth = params.imageWidth
            desiredHeight = params.imageHeight
        }

        this.state.imageWidth = desiredWidth
        this.state.imageHeight = desiredHeight
    }

    componentDidMount() {
        setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            this.setState({ buttonGroupBottom: 0 })
        }, 150)
    }

    save = () => {
        AsyncStorage.setItem(this.state.id, JSON.stringify({ response: this.state.response, success: true, base64: this.state.base64, date: new Date().toString(), classifications: this.state.classifications }))
        .then(() => {
            Alert.alert('Saved!')
            this.props.navigation.goBack()
        })
        .catch(err => {
            console.log(err)
            Alert.alert('Error', err.message)
        })
    }

    discard = () => {
        this.props.navigation.goBack()
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