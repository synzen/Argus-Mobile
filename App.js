// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow
//  */

import React, { Component } from 'react';
import {
  ActivityIndicator,
  TextInput,
  StyleSheet, // CSS-like styles
  Text,
  TouchableOpacity,
  View,
  Alert,
  Linking // Open a URL with the default browser app
} from 'react-native';
import { RNCamera } from 'react-native-camera'; // https://github.com/react-native-community/react-native-camera
import Dialog from "react-native-dialog";

export default class BadInstagramCloneApp extends Component {
  constructor(props) {
    super(props)
    this.SPECIFY_HOST_DESCRIPTION = 'http:// is automatically added at the beginning. Only enter the ip and port.'
    this.state = {
      host: '',
      showDialog: false,
      showInput: true,
      dialogDescription: this.SPECIFY_HOST_DESCRIPTION,
      dialogTitle: 'Specify Host',

    }
  }

  render() {
    return (
      // All this just creates the camera view and button, taken from https://github.com/react-native-community/react-native-camera/blob/master/docs/RNCamera.md
      <View style={styles.container}>
        <Dialog.Container visible={ this.state.showDialog }>
          <Dialog.Title>{ this.state.dialogTitle }</Dialog.Title>
          <Dialog.Description>{ this.state.dialogDescription }</Dialog.Description>
          { this.state.showInput ? <Dialog.Input 
            autoCapitalize='none'
            autoCorrect={ false }
            // keyboardType='numeric'
            underlineColorAndroid={'black'} 
            onChangeText={ text => this.setState({ host: text }) }>{ this.state.host }</Dialog.Input> : undefined }
          <Dialog.Button label="Close" onPress={ this.closeDialog.bind(this) } />
          { this.state.showInput ? <Dialog.Button label="Upload" onPress={ this.submitDialog.bind(this) } /> : undefined }
        </Dialog.Container>
        <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style = {styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
            onGoogleVisionBarcodesDetected={({ barcodes }) => {
              console.log(barcodes)
            }}
        />
        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center',}}>
        <TouchableOpacity
            onPress={ this.cameraClick.bind(this) }
            style = {styles.capture}
        >
            <Text style={{fontSize: 14}}> SNAP </Text>        
        </TouchableOpacity>
        </View>
      </View>
    );
  }

  cameraClick = function () {
    this.setState({ dialogTitle: 'Specify Host', showDialog: true, showInput: true, dialogDescription: this.SPECIFY_HOST_DESCRIPTION })
  }

  showError = function (message) {
    this.setState({ dialogTitle: 'Error', showDialog: true, showInput: false, dialogDescription: message })
  }

  closeDialog = function () {
    this.setState({ showDialog: false })
  }

  submitDialog = function () {
    this.closeDialog()
    this.takePicture()
  }

  takePicture = async function() {
    console.log('Picture taken')
    if (!this.camera) return console.log(new Error('Unable to take picture because this.camera is undefined'))
    const options = { quality: 0.5, base64: true };
    try {
      // Take the picture
      const data = await this.camera.takePictureAsync(options)
      console.log('Picture saved to cache at', data.uri)

      // Upload it
      const response = await this.uploadImage(data.uri)

      // Prompt the user for action with the response
      await this.handleLinkResponse('https://www.google.com')
    } catch (err) {
      console.error(err)
      this.showError('Unable to upload image:' + err.message)
    }
  }

  uploadImage = async function(dataURI) { // dataURI is the file:// path to the image in the app's cache
    console.log('Uploading image to server at ' + this.state.host)
    const formData = new FormData()
    formData.append('photo', { uri: dataURI, type: 'image/jpeg', name: 'testPhotoName' })
    const res = await fetch('http://' + this.state.host.trim(), { method: 'POST', body: formData })
    // If this is sent to a python flask server, then receive the POST(! not GET!) request as such:
    //       file = request.files['photo']
    //       file.save('./test.jpg')

    // Status code must be 200. res.ok is a boolean which checks this
    if (!res.ok) throw new Error(`Non-200 status code (${res.status})`)
    return res
  }

  handleLinkResponse = async function (url) { // Should be the wikipedia link
    Alert.alert('Successfully Uploaded', 'Select an option', [
      { text: 'Open Wikipedia', onPress: () => Linking.canOpenURL(url).then(able => able ? Linking.openURL(url) : Promise.reject()).catch(console.log) },
      { text: 'Cancel', style: 'cancel' }
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
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20
  }
});

