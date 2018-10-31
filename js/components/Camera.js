import React, { Component } from 'react'
import {
  StyleSheet, // CSS-like styles
  Easing,
  Animated,
  TouchableOpacity,
  View,
  Alert,
  AsyncStorage,
  Linking // Open a URL with the default browser app
} from 'react-native';
import { RNCamera } from 'react-native-camera'
import Spinner from 'react-native-loading-spinner-overlay'
import Icon from 'react-native-vector-icons/Entypo'
import keyHolder from '../constants/keys.js'
import colorConstants from '../constants/colors.js'
import CameraDefaults from '../constants/camera.js'
import { NavigationActions } from 'react-navigation';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

class Camera extends Component {
  static navigationOptions = ({navigation}) => { 
    return { 
      headerTransparent: true, 
      headerStyle: { borderBottomWidth: 0, } } }

  constructor(props) {
    super(props)
    this._lastId = ''

    this.state = {
      processing: false,
      eyeScale: new Animated.Value(1),
      flash: RNCamera.Constants.FlashMode[CameraDefaults.flash],
      focus: RNCamera.Constants.AutoFocus[CameraDefaults.focus],
      camera: RNCamera.Constants.Type[CameraDefaults.camera],
      mounted: false
    }
    AsyncStorage.multiGet(['camera.flash', 'camera.focus', 'camera.camera']).then(vals => {
      vals.map(item => {
        if (!item[1]) return
        if (item[0] === 'camera.flash') this.setState({ flash: RNCamera.Constants.FlashMode[item[1].toLowerCase()] })
        if (item[0] === 'camera.focus') this.setState({ focus: RNCamera.Constants.AutoFocus[item[1].toLowerCase()] })
        if (item[0] === 'camera.camera') this.setState({ focus: RNCamera.Constants.Type[item[1].toLowerCase()] })
      })
    })
  }

  componentDidMount = function () {
    const navState = this.props.navigation.state
    if (!keyHolder.has(navState.routeName)) keyHolder.set(navState.routeName, navState.key)
    setTimeout(() => this.setState({ mounted: true }), 200) // Wait for the screen to finish its animation
  }

  _generateId = () => {
    const S4 = () => {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    const id = 'photo.' + (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    return id
  }

  render() {
    return (
      <View style={styles.container}>
        { this.state.mounted ? <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style = {styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={this.state.flash}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
            onGoogleVisionBarcodesDetected={({ barcodes }) => {
              console.log(barcodes)
            }}
            
        >
                <AnimatedTouchableOpacity style={ { ...styles.capture, 
          transform: [
            { scaleX: this.state.eyeScale },
            { scaleY: this.state.eyeScale }
          ]}} >
          <Icon name="eye" size={65} onPress={ this.takePicture.bind(this) } color='white'/>
        </AnimatedTouchableOpacity>
        <View style={{flex: 0, bottom: 0, position: 'absolute', opacity: .5, backgroundColor: 'black', right: 0, left: 0, height: 100}} />

        </RNCamera> : undefined }

        <Spinner
          visible={this.state.processing}
          textContent={'Processing...'}
          textStyle={{ color: '#FFF' }}
          overlayColor='rgba(0, 0, 0, 1)'
          animation='fade'
          color={colorConstants.headerBackgroundColor}
        />
        {/* <Spinner
          visible={this.state.processing}
          textContent={'Processing...'}
          textStyle={{ color: '#FFF' }}
        />
        <View style={{flex: 0, opacity: 1, flexDirection: 'row', justifyContent: 'center'}}>
        <TouchableOpacity><Icon name="eye" size={55} style={ styles.capture } onPress={ this.takePicture.bind(this) } color='white'/></TouchableOpacity>

        </View> */}
      </View>
    );
  }

  bounceIcon = function () {
    Animated.sequence([
      Animated.timing(this.state.eyeScale, {toValue: 0.8, duration: 150, easing: Easing.elastic()}),
      Animated.timing(this.state.eyeScale, {toValue: 1, duration: 200})
    ]).start()
  }

  takePicture = async function() {
    this.bounceIcon()
    if (!this.state.mounted) return console.log(new Error('Unable to take picture because this.camera is undefined'))
    const options = { quality: 0.5, base64: true, doNotSave: true };
    let data
    try {
      // Take the picture
      console.log('about to take picture')
      this.setState({ processing: true })
      data = await this.camera.takePictureAsync(options)
      this.camera.pausePreview()

      console.log('took picture')

      const setParamsAction = NavigationActions.setParams({
        params: { imageBase64: data.base64 },
        key: keyHolder.get('UploadScreen'),
      });
      this.props.navigation.dispatch(setParamsAction);
      console.log('dispatched')
      this.props.navigation.goBack()
      console.log('go back')

    //   return
    //   // Upload it
    //   this.setState({ processing: true })
    //   this._lastId = this._generateId()

    //   const response = await this.uploadImage(data.base64)

    //   // Prompt the user for action with the response
    //   await this.handleLinkResponse(response)
    //   await AsyncStorage.setItem(this._lastId, JSON.stringify({ response, success: true, base64: data.base64, date: new Date().toString() }))
    } catch (err) {
    //   console.log('here')
    //   if (data) {
    //     console.log('setting now for', this._lastId)
    //     AsyncStorage.setItem(this._lastId, JSON.stringify({ success: false, error: err.message, base64: data.base64, date: new Date().toString() }))
    //   }
      Alert.alert('Error', err.message)
      console.error(err)
    }
    // this.setState({ processing: false })
    this.setState({ processing: false })
    this.camera.resumePreview()
  }

  uploadImage = async function(base64) { // dataURI is the file:// path to the image in the app's cache
    const host = await AsyncStorage.getItem('host')
    console.log('uploading to', host)
    // const formData = new FormData()
    // formData.append('photo', { uri: base64, data: base64, type: 'image/jpeg', name: 'testPhotoName' })
    const res = await fetch(host, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ base64 })
    })
    // If this is sent to a python flask server, then receive the POST(! not GET!) request as such:
    //       file = request.files['photo']
    //       file.save('./test.jpg')

    // Status code must be 200. res.ok is a boolean which checks this
    if (!res.ok) throw new Error(`Non-200 status code (${res.status})`)
    return res
  }

  handleLinkResponse = async function (response) { // Should be the wikipedia link
    const url = 'https://www.google.com'
    Alert.alert('Successfully Uploaded', `Response: ${JSON.stringify(response, null, 2)}\n\nSelect an option`, [
      { text: 'Close', style: 'cancel' },
      { text: 'Open Google', onPress: () => Linking.canOpenURL(url).then(able => able ? Linking.openURL(url) : Promise.reject()).catch(console.log) }
    ])
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: 'black'
    },
    preview: {
      flex: 1,
      // justifyContent: 'flex-end',
      alignItems: 'center'
    },
    capture: {
      position: 'absolute',
      bottom: 0,
      // backgroundColor: 'green',
      // flex: 0,
      // backgroundColor: 'white',
      // borderRadius: 5,
      // padding: 15,
      // height: 50,
      // width: 50,
      // borderRadius: 25,
      // opacity: .5,

      // paddingHorizontal: 20,
      alignSelf: 'center',
      margin: 18,
    }
})

export default Camera



