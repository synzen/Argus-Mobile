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
        // console.log('derived')
        // console.log(nextProps.navigation.state.params.title)
        // console.log(state)
        const navState = nextProps.navigation.state
        if (navState.params && navState.params.imageBase64 && state.selectedImageBase64 !== navState.params.imageBase64) return { selectedImageBase64: navState.params.imageBase64 }
        else return null

    }


    constructor (props) {
        super(props)

        this._lastId = ''
        this.state = {
            selectedImageBase64: '',
            selectedImageName: '',
            status: STATUS.READY
        }
    }

    componentDidMount = function () {
        const navState = this.props.navigation.state
        keyHolder.set(navState.routeName, navState.key)
    }

    // static options = {
    //     storageOptions: {
    //       skipBackup: true,
    //       path: 'argus'
    //     },
    //   };

    // componentWillReceiveProps = () => {
    //     console.log('got it')
    // }

    _generateId = () => {
        const S4 = () => {
          return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        const id = 'photo.' + (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        return id
      }

    openSelector = () => {
        ImagePicker.launchImageLibrary({}, res => {
            console.log('Response = ', res);
            console.log(res)
          
            if (res.didCancel) {
              console.log('User cancelled image picker');
            } else if (res.error) {
              console.log('ImagePicker Error: ', res.error);
            } else {          
                this.setState({ selectedImageBase64: res.data })

            }
        });
    }

    openCamera = () => {
        this.props.navigation.navigate('CameraScreen')
        // ImagePicker.launchCamera({ storageOptions: { path: 'argus', skipBackup: true } }, res => {
        //     console.log(res)
        // });
    }

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
            // Status code must be 200. res.ok is a boolean which checks this
            if (!response.ok) throw new Error(`Non-200 status code (${response.status})`)

            const jsonBody = await response.json() // jsonBody should be an array of objects with keys "description" and "score"
            console.log('successful response', jsonBody)

            // Successful operation, save the results to persistent storage
            await AsyncStorage.setItem(this._lastId, JSON.stringify({ response, success: true, base64: this.state.selectedImageBase64, date: new Date().toString(), classifications: jsonBody }))

            console.log('done!')
            const url = 'https://www.google.com'
            Alert.alert('Successfully Uploaded', `Response: ${JSON.stringify(jsonBody, null, 2)}\n\nSelect an option`, [
                { text: 'Close', style: 'cancel' },
                { text: 'Open Google', onPress: () => Linking.canOpenURL(url).then(able => able ? Linking.openURL(url) : Promise.reject()).catch(console.log) }
            ])

        } catch (err) {
            AsyncStorage.setItem(this._lastId, JSON.stringify({ success: false, error: err.message, base64: this.state.selectedImageBase64, date: new Date().toString() }))
            // Alert.alert('Failed to upload', err.message)
            console.error(err)
        }
        this.setState({ status: STATUS.READY })
    }

    onImageBoxPress = () => {
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        // this.setState({ status: this.state.status === STATUS.UPLOADED ? STATUS.READY : STATUS.UPLOADED })
        if (!this.state.selectedImageBase64) return console.log('no base64')
        Image.getSize(`data:image/jpg;base64,${this.state.selectedImageBase64}`, (w, h) => {
            this.props.navigation.navigate('ViewImageFromUploadScreen', { base64: this.state.selectedImageBase64, width: w, height: h })
        }, err => {
            console.log(err)
        })

        if (this.state.selectedImageBase64) this.props.navigation.navigate('UploadScreen', { base64: this.state.selectedImageBase64 })
    }

    render () {
        const containerDuringReady =  this.state.status === STATUS.UPLOADED ?  {  ...styles.container, justifyContent: 'cemter'} : {  ...styles.container, justifyContent: 'center' }

        return (
            <View style={containerDuringReady}>
                <TouchableOpacity style={styles.imageSelectionContainer} onPress={this.onImageBoxPress}>
                    <Text>{ this.state.selectedImageBase64 ? 'Image attached' : 'No image attached' }</Text>
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
                            // disabled={ Platform.OS === 'android' ? true : true }
                            icon={{
                                name: 'camera-alt',
                                size: 25,
                                color: 'white'
                            }}
                            title='New Photo'
                        />

                        {/* <ButtonGroup buttons={ buttonGroup } containerStyle={{ paddingHorizontal: 0, backgroundColor: 'transparent', borderWidth: 0 }} ></ButtonGroup> */}
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
        // alignContent: 'center',
        // justifyContent: 'center'
        // justifyContent: 'center'

    },
    imageSelectionContainer: {
        // padding: 30,
        // flex: 0,
        // flexDirection: 'row',
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
        // backgroundColor: 'orange',
        margin: 0,
        padding: 0
    },
    buttonContainer: {
        // marginVertical: 5,
        // backgroundColor: 'green'
        // marginHorizontal: 10
        backgroundColor: 'green'
    },
    button: {
        // alignItems: 'center',
        backgroundColor: '#607D8B',
        height: 45
        // margin: 0,
        // padding: 10,
        // marginVertical: 5,
        // marginHorizontal: 10
    }
})