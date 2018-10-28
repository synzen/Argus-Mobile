import React, { Component } from 'react';
import {
  StyleSheet, // CSS-like styles
  Text,
  TouchableOpacity,
  View,
  Alert,
  AsyncStorage,
  Linking // Open a URL with the default browser app
} from 'react-native';
import { RNCamera } from 'react-native-camera'; // https://github.com/react-native-community/react-native-camera
import Spinner from 'react-native-loading-spinner-overlay'
import RNFS from 'react-native-fs'

class Camera extends Component {
  static navigationOptions = ({navigation}) => { 
    return { 
      headerTransparent: true, 
      headerStyle: { borderBottomWidth: 0, } } }

  constructor(props) {
    super(props)
    this.state = {
      processing: false
    }
  }

  render() {
    return (
      // All this just creates the camera view and button, taken from https://github.com/react-native-community/react-native-camera/blob/master/docs/RNCamera.md
      <View style={styles.container}>
        <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style = {styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.auto}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
            onGoogleVisionBarcodesDetected={({ barcodes }) => {
              console.log(barcodes)
            }}
        />
        <Spinner
          visible={this.state.processing}
          textContent={'Uploading...'}
          textStyle={{ color: '#FFF' }}
        />
        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center',}}>
        <TouchableOpacity
            onPress={ this.takePicture.bind(this) /*this.cameraClick.bind(this)*/ }
            style = {styles.capture}
        >
        {/* <Text style={{fontSize: 14}}> SNAP </Text>         */}
        </TouchableOpacity>

        </View>
      </View>
    );
  }

  takePicture = async function() {
    if (!this.camera) return console.log(new Error('Unable to take picture because this.camera is undefined'))
    const options = { quality: 0.5, base64: true };
    try {
      // Take the picture
      const data = await this.camera.takePictureAsync(options)
      console.log('Picture taken')
      console.log('Picture saved to cache at', data.uri)

      // Upload it
      this.setState({ processing: true })
      const response = await this.uploadImage(data.uri)

      // Prompt the user for action with the response
      await this.handleLinkResponse(response)
    } catch (err) {
      console.error(err)
    }
    this.setState({ processing: false })
  }

  uploadImage = async function(dataURI) { // dataURI is the file:// path to the image in the app's cache
    const host = await AsyncStorage.getItem('host')
    const formData = new FormData()
    formData.append('photo', { uri: dataURI, type: 'image/jpeg', name: 'testPhotoName' })
    const res = await fetch(host, { method: 'POST', body: formData })
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
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    capture: {
      flex: 0,
      backgroundColor: 'white',
      // borderRadius: 5,
      // padding: 15,
      height: 50,
      width: 50,
      borderRadius: 25,
      opacity: .5,

      // paddingHorizontal: 20,
      alignSelf: 'center',
      margin: 20
    }
})

export default Camera



