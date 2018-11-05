import React, { Component } from 'react'
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Linking,
    AsyncStorage,
    LayoutAnimation,
    UIManager,
    Text
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { Button } from 'react-native-elements';
import keyHolder from '../constants/keys.js'
import generalConstants from '../constants/general.js'
import schemas from '../constants/schemas.js'
import RNFS from 'react-native-fs'
import Realm from 'realm'
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

const STATUS = {
    READY: 0,
    UPLOADING: 1,
    UPLOADED: 2
}

export default class Upload extends Component {
    static navigationOptions = {
        title: 'Upload'
    }

    static getDerivedStateFromProps(nextProps, state) {
        const navState = nextProps.navigation.state
        if (navState.params && navState.params.imageBase64 && state.selectedImageBase64 !== navState.params.imageBase64) {
            return { 
                selectedImageBase64: navState.params.imageBase64,
                selectedImageWidth: navState.params.imageWidth,
                selectedImageHeight: navState.params.imageHeight
            }
        }
        else return null

    }


    constructor (props) {
        super(props)

        this._lastId = ''
        this.state = {
            selectedImageBase64: '',
            selectedImageName: '',
            selectedImageWidth: 0,
            selectedImageHeight: 0,
            status: STATUS.READY
        }
    }

    componentDidMount = function () {
        const navState = this.props.navigation.state
        keyHolder.set(navState.routeName, navState.key)
    }

    _generateId = () => {
        const S4 = () => (((1+Math.random())*0x10000)|0).toString(16).substring(1)
        return 'photo.' + (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4())
    }

    openSelector = () => {
        ImagePicker.launchImageLibrary({}, res => {            
            if (res.didCancel) {
              console.log('User cancelled image picker');
            } else if (res.error) {
              console.log('ImagePicker Error: ', res.error);
            } else {          
                this.setState({ selectedImageBase64: res.data, selectedImageHeight: res.height, selectedImageWidth: res.width })

            }
        });
    }

    openCamera = () => this.props.navigation.navigate('CameraScreen')

    upload = async () => {
        try {
            // Get the host
            this.setState({ status: STATUS.UPLOADING })
            const host = await AsyncStorage.getItem('host')
            console.log('uploading to', host)

            // Send the request
            this._lastId = this._generateId()
            const response = await fetch(host, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([ this.state.selectedImageBase64 ])
            })

            // If this is sent to a python flask server, then receive the POST(! not GET!) request as such:
            // file = request.files['photo']
            // file.save('./test.jpg')

            // Status code must be 200. res.ok is a boolean which checks this
            if (!response.ok) throw new Error(`Non-200 status code (${response.status})`)

            const jsonBody = await response.json() // jsonBody should be an array of objects with the keys specified in js/constants/schemas.ClassificationSchema.properties

            // The response is handed off to IdentifiedScreen to decide whether to save the base64 as an image file or not
            this.props.navigation.navigate('IdentifiedScreen', {
                id: this._lastId, response,
                base64: this.state.selectedImageBase64,
                imageWidth: this.state.selectedImageWidth,
                imageHeight: this.state.selectedImageHeight,
                classifications: jsonBody
            })
        } catch (err) {
            console.log(err)
            console.log(this._lastId)
            const path = `${generalConstants.photoDirectory}/${this._lastId}.jpg`
            RNFS.mkdir(generalConstants.photoDirectory)
            .then(() => RNFS.writeFile(path, this.state.selectedImageBase64, 'base64'))
            .then(() => Realm.open({ schema: schemas.all }))
            .then(realm => {
                realm.write(() => {
                    realm.create(schemas.FailedIdentifiedItemSchema.name, {
                        id: this._lastId,
                        response: this.state.response,
                        error: err.message,
                        image: {
                            path: path,
                            width: this.state.selectedImageWidth,
                            height: this.state.selectedImageHeight
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
        this.setState({ status: STATUS.READY })
    }

    onImageBoxPress = () => {
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        // this.setState({ status: this.state.status === STATUS.UPLOADED ? STATUS.READY : STATUS.UPLOADED })
        if (!this.state.selectedImageBase64) return console.log('no base64')
        this.props.navigation.navigate('ViewImageFromUploadScreen', { base64: this.state.selectedImageBase64, width: this.state.selectedImageWidth, height: this.state.selectedImageHeight })
    }

    render () {
        const containerDuringReady =  this.state.status === STATUS.UPLOADED ?  {  ...styles.container, justifyContent: 'cemter'} : {  ...styles.container, justifyContent: 'center' }

        return (
            <View style={containerDuringReady}>
                <TouchableOpacity style={styles.imageSelectionContainer} onPress={this.onImageBoxPress}>
                    <Text>{ this.state.selectedImageBase64 ? 'Image attached\nClick to preview' : 'No image attached' }</Text>
                </TouchableOpacity>
                <View style={styles.buttonColumnGroup}>
                    <View style={styles.buttonRowGroup}>
                        <Button
                            containerViewStyle={styles.buttonContainer}
                            buttonStyle={ {... styles.button }}
                            onPress={this.openSelector}
                            icon={{
                                name: 'insert-drive-file',
                                size: 25,
                                color: 'white'
                            }}
                            title='Select Photo'
                        />
                        
                        <Button
                            containerViewStyle={styles.buttonContainer}
                            buttonStyle={ {... styles.button }}
                            onPress={this.openCamera}
                            icon={{
                                name: 'camera-alt',
                                size: 25,
                                color: 'white'
                            }}
                            title='New Photo'
                        />

                    </View>
                    <Button
                        containerViewStyle={ { ...styles.buttonContainer, marginTop: 10 } }
                        buttonStyle={styles.button}
                        onPress={this.upload}
                        disabled={ !this.state.selectedImageBase64 || this.state.status !== STATUS.READY ? true : false }
                        icon={{
                            name: 'search',
                            size: 25,
                            color: 'white'
                        }}
                        title='Identify'
                    />
                    {/* <Button
                        containerViewStyle={ { ...styles.buttonContainer, marginTop: 10 } }
                        buttonStyle={styles.button}
                        onPress={() => this.props.navigation.navigate('IdentifiedScreen', { base64: this.state.selectedImageBase64, imageWidth: this.state.selectedImageWidth, imageHeight: this.state.selectedImageHeight })}
                        icon={{
                            name: 'search',
                            size: 25,
                            color: 'white'
                        }}
                        title='Test'
                    /> */}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 10,
        flex: 1,
        flexDirection: 'column',
    },
    imageSelectionContainer: {
        marginHorizontal: 15,
        marginVertical: 20,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: 'gray',
        borderRadius: 0.5,
        height: 100,
        justifyContent: 'center'
    },
    buttonColumnGroup: {
        flexDirection: 'column'
    },
    buttonRowGroup: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 0,
        padding: 0
    },
    buttonContainer: {
        backgroundColor: 'green'
    },
    button: {
        backgroundColor: '#607D8B',
        height: 45
    }
})