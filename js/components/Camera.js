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
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import keyHolder from '../constants/keys.js'
import generalConstants from '../constants/general.js'
import colorConstants from '../constants/colors.js'
import CameraDefaults from '../constants/camera.js'
import schemas from '../constants/schemas.js'
import RNFS from 'react-native-fs'
import ImagePicker from 'react-native-image-picker';
import { NavigationActions } from 'react-navigation';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

class Camera extends Component {
  static navigationOptions = ({navigation}) => { 
    return { 
      headerTransparent: true, 
      headerStyle: { borderBottomWidth: 0, } } }

  constructor(props) {
    super(props)

    this.state = {
      processing: false,
      eyeScale: new Animated.Value(1),
      flash: RNCamera.Constants.FlashMode[CameraDefaults.flash],
      focus: RNCamera.Constants.AutoFocus[CameraDefaults.focus],
      camera: RNCamera.Constants.Type[CameraDefaults.camera],
      mounted: false,
      selectedImageBase64: '',
      selectedImageHeight: -1,
      selectedImageWidth: -1
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
    setTimeout(() => this.setState({ mounted: true }), 500) // Wait for the screen to finish its animation
  }

  selectImage = () => {
    ImagePicker.launchImageLibrary({}, res => {
      if (res.didCancel) {
        console.log('User cancelled image picker')
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error)
      } else {          
        this.props.navigation.navigate('ConfirmImageScreen', { width: res.width, height: res.height, base64: res.data })
      }
    })
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
            skipProcessing={true}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
            onGoogleVisionBarcodesDetected={({ barcodes }) => {
              console.log(barcodes)
            }}
            
        >

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.select} >
            <MaterialIcon name='image' size={30} color='white' onPress={ this.selectImage } />
          </TouchableOpacity>
          <AnimatedTouchableOpacity style={ { ...styles.capture, 
            transform: [
              { scaleX: this.state.eyeScale },
              { scaleY: this.state.eyeScale }
            ]}} >
            <Icon name="eye" size={65} onPress={ this.takePicture.bind(this) } color='white'/>
          </AnimatedTouchableOpacity>
        </View>

        <View style={styles.bottomBackground} />

        </RNCamera> : undefined }

        <Spinner
          visible={this.state.processing}
          textContent={'Processing...'}
          textStyle={{ color: '#FFF' }}
          overlayColor='rgba(0, 0, 0, 0.25)'
          animation='fade'
          color={colorConstants.headerBackgroundColor}
        />

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
    const options = { quality: 0.5, base64: true, doNotSave: true, fixOrientation: true, pauseAfterCapture: true };
    let data
    try {
      console.log('about to take picture')
      // this.setState({ processing: true })
      data = await this.camera.takePictureAsync(options)
      this.props.navigation.navigate('ConfirmImageScreen', {
        width: data.width,
        height: data.height,
        base64: data.base64
      })

    } catch (err) {
      Alert.alert('Error', err.message)
      console.error(err)
    }
    // this.setState({ processing: false })
    // this.camera.resumePreview()
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
      alignItems: 'center'
    },
    capture: {
      position: 'absolute',
      alignSelf: 'center',
    },
    select: {
      marginRight: 175
    },
    bottomBackground: {
      flex: 0,
      bottom: 0,
      position: 'absolute',
      opacity: .5,
      backgroundColor: 'black',
      right: 0, 
      left: 0,
      height: 75,
      zIndex: 100
    },
    bottomContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      bottom: 0,
      justifyContent: 'center',
      position: 'absolute',
      right: 0,
      left: 0,
      height: 75,
      zIndex: -1
    }
})

export default Camera



