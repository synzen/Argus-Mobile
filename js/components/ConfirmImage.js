import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    AsyncStorage,
    Alert,
    ScrollView,
    Dimensions,
    LayoutAnimation,
    UIManager,
    Image
} from 'react-native';
import FastImage from 'react-native-fast-image'
import generalConstants from '../constants/general.js'
import colorConstants from '../constants/colors.js'
import Realm from 'realm'
import schemas from '../constants/schemas.js'
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Spinner from 'react-native-loading-spinner-overlay'
import { material } from 'react-native-typography'
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

const windowDimensions = Dimensions.get('window')

const STATUS = {
    WAITING: 0,
    UPLOADING: 1,
    UPLOADED: 2
}


export default class ConfirmImage extends Component {

    constructor(props) {
        super(props)
        const params = this.props.navigation.state.params

        this._lastId = undefined


        let desiredWidth = windowDimensions.width * .9
        let desiredHeight = windowDimensions.height * .9
        if (params.width < desiredWidth && params.height < desiredHeight) {
            console.log('case 1')
            desiredWidth = params.width
            desiredHeight = params.height
        } else if (params.width < desiredWidth) { // Then use the desired height
            console.log('case 2')
            desiredWidth = desiredHeight * params.width / params.height
        } else if (params.height > desiredHeight) { // Then use desired width
            console.log('case 3')
            desiredHeight = desiredWidth * params.height / params.width
        } else {
            desiredWidth = params.width
            desiredHeight = params.height
        }

        this.state = {
            base64: params.base64,
            width: params.width,
            height: params.height,
            fullPreviewWidth: desiredWidth / .9,
            fullPreviewHeight: desiredHeight / .9,
            scaledWidth: desiredWidth,
            scaledHeight: desiredHeight,
            bestItemScore: 0,
            bestItemName: '',
            status: STATUS.WAITING
        }

    }

    _generateId = () => {
        const S4 = () => (((1+Math.random())*0x10000)|0).toString(16).substring(1)
        return 'photo.' + (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4())
    }

    upload = async () => {
        let response
        try {
            this._lastId = this._generateId()
            // Get the host
            const host = await AsyncStorage.getItem('host')
            console.log('uploading to', host)

            // Send the request
            response = await fetch(host, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([ this.state.base64 ])
            })

            // If this is sent to a python flask server, then receive the POST(! not GET!) request as such:
            // file = request.files['photo']
            // file.save('./test.jpg')

            // Status code must be 200. res.ok is a boolean which checks this
            if (!response.ok) throw new Error(`Non-200 status code (${response.status})`)

            const classifications = await response.json() // jsonBody should be an array of objects with the keys specified in js/constants/schemas.ClassificationSchema.properties

            // The response is handed off to IdentifiedScreen to decide whether to save the base64 as an image file or not
            // this.props.navigation.navigate('IdentifiedScreen', {
            //     id: this._lastId,
            //     response,
            //     base64: this.state.base64,
            //     imageWidth: this.state.width,
            //     imageHeight: this.state.height,
            //     classifications: jsonBody
            // })

            let bestItemScore = 0
            let bestItemName = ''
            classifications.forEach(item => {
                if (item.score < bestItemScore) return
                bestItemScore = item.score
                bestItemName = item.description
            })

            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            this.setState({ bestItemScore, bestItemName, response, classifications })

        } catch (err) {
            console.log(err)
            console.log(this._lastId)
            const path = `${generalConstants.photoDirectory}/${this._lastId}.jpg`
            RNFS.mkdir(generalConstants.photoDirectory)
            .then(() => RNFS.writeFile(path, this.state.base64, 'base64'))
            .then(() => Realm.open({ schema: schemas.all }))
            .then(realm => {
                realm.write(() => {
                    realm.create(schemas.FailedIdentifiedItemSchema.name, {
                        id: this._lastId,
                        response: response || 'No response available',
                        error: err.message,
                        image: {
                            path: path,
                            width: this.state.width,
                            height: this.state.height
                        }
                        // base64: this.state.base64,
                    })
                })
                console.log('saved to failures')
                Alert.alert('Saved to Failures')
            })
            .catch(err => {
                Alert.alert('Error', err.message)
                console.log('realm pipeline err',  err)
            })
            // AsyncStorage.setItem(this._lastId, JSON.stringify({ success: false, error: err.message, base64: this.state.selectedImageBase64, date: new Date().toString() }))
            // Alert.alert('Failed to upload', err.message)
        }
        this.setState({ status: STATUS.UPLOADED })

    }

    clickPositive = async () => {
        if (this.state.status === STATUS.WAITING) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            this.setState({ status: STATUS.UPLOADING })
            this.upload()
        } else if (this.state.status === STATUS.UPLOADED) {
            const path = `${generalConstants.photoDirectory}/${this._lastId}.jpg`
            try {
                await RNFS.mkdir(generalConstants.photoDirectory)
                await RNFS.writeFile(path, this.state.base64, 'base64')
                const realm = await Realm.open({ schema: schemas.all })
                // This write method might throw an exception
                realm.write(() => {
                    realm.create(schemas.IdentifiedItemSchema.name, {
                        id: this._lastId,
                        image: {
                            path: path,
                            width: this.state.width,
                            height: this.state.height
                        },
                        response: this.state.response.toString(),
                        classifications: this.state.classifications
                    })
                })
    
                console.log('saved success')
                // Alert.alert('Saved!')
                this.props.navigation.goBack()
            } catch (err) {
                Alert.alert('Error', err.message)
                RNFS.unlink(path).catch(err => console.log(`Cannot delete ${path}:`, err))
                console.log(err)
            }
        }
    }

    clickNegative = () => {
        if (this.state.status === STATUS.WAITING) {
            this.setState({ status: STATUS.WAITING })
        } else {

        }
        this.props.navigation.goBack()

    }

    render () {
        // const origResults = super.render()
        const navProps = this.props.navigation.state.params
        const imageStyle = this.state.status === STATUS.UPLOADED ? { width: this.state.scaledWidth, height: this.state.scaledHeight, ...styles.image } : { width: this.state.fullPreviewWidth, height: this.state.fullPreviewHeight, ...styles.image }
        const buttonStyleBottom = this.state.status === STATUS.UPLOADING ? -100 : 25

        return (
            <View style={{flex: 1}}>
                <ScrollView>
                    <FastImage source={{uri: `data:image/jpg;base64,${navProps.base64}`}} style={ imageStyle } resizeMode={FastImage.resizeMode.stretch}/>
                    { this.state.status === STATUS.UPLOADED ?
                        <View>
                            <Text style={{ ...material.headline, alignSelf: 'center'}}>Best Guess:</Text>
                            <Text style={{ ...material.display1, alignSelf: 'center', fontWeight: 'bold', marginBottom: 100 }}>{ this.state.bestItemName }</Text>
                        </View>
                        :
                        undefined
                    }

                </ScrollView>
                <Spinner visible={ this.state.status === STATUS.UPLOADING } overlayColor='rgba(0,0,0,.5)' textContent='Uploading' textStyle={{color: 'white'}} />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', bottom: buttonStyleBottom, position: 'absolute', right: 0, left: 0 }}>
                    <TouchableOpacity style={styles.negativeButtonCircle} onPress={this.clickNegative}><Icon name={ this.state.status === STATUS.UPLOADED ? 'delete' : 'close' } size={35} color='white'/></TouchableOpacity>
                    <TouchableOpacity style={styles.positiveButtonCircle} onPress={this.clickPositive}><Icon name={ this.state.status === STATUS.UPLOADED ? 'save' : 'check' } size={35} color='white'/></TouchableOpacity>
                </View>
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    },
    image: {
        margin: 20,
        alignSelf: 'center'
    },
    negativeButtonCircle: {
        backgroundColor: colorConstants.danger,
        height: 55,
        width: 55,
        borderRadius: 55 / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    positiveButtonCircle: {
        backgroundColor: colorConstants.success,
        height: 55,
        width: 55,
        borderRadius: 55 / 2,
        alignItems: 'center',
        justifyContent: 'center',
    }
})