// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow
//  */

import React, { Component } from 'react';
import { createStackNavigator } from 'react-navigation';
import HomeScreen from './components/Home.js'
import {
  ActivityIndicator,
  TextInput,
  Button,
  StyleSheet, // CSS-like styles
  Text,
  TouchableOpacity,
  View,
  Alert,
  Linking // Open a URL with the default browser app
} from 'react-native';
import { RNCamera } from 'react-native-camera'; // https://github.com/react-native-community/react-native-camera
import Spinner from 'react-native-loading-spinner-overlay'


class BadInstagramCloneApp extends Component {
  static navigationOptions = ({navigation}) => { 
    return { 
      // headerTitle: <Text style={{color: 'white', fontSize: 18}}>Test</Text>, 
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
        <Text style={{fontSize: 14}}> SNAP </Text>        
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
    const host = this.props.navigation.state.params.host.trim()
    console.log('Uploading image to server at ' + host)
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
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20
  }
});

export default createStackNavigator({
  Home: { screen: HomeScreen },
  Camera: { screen: BadInstagramCloneApp },
});





// import React from 'react';
// import { Button, Image, View, Text } from 'react-native';
// import { StackNavigator } from 'react-navigation'; // 1.0.0-beta.27

// class LogoTitle extends React.Component {
//   render() {
//     return (
//       <Text>Logo</Text>
//       // <Image
//       //   source={require('./spiro.png')}
//       //   style={{ width: 30, height: 30 }}
//       // />
//     );
//   }
// }

// class HomeScreen extends React.Component {
//   static navigationOptions = ({ navigation }) => {
//     const params = navigation.state.params || {};

//     return {
//       headerTitle: <LogoTitle />,
//       headerLeft: (
//         <Button
//           onPress={() => navigation.navigate('MyModal')}
//           title="Info"
//           color="#fbb"
//         />
//       ),
//       headerRight: (
//         <Button onPress={params.increaseCount} title="+1" color="#fff" />
//       ),
//     };
//   };

//   componentWillMount() {
//     this.props.navigation.setParams({ increaseCount: this._increaseCount });
//   }

//   state = {
//     count: 0,
//   };

//   _increaseCount = () => {
//     this.setState({ count: this.state.count + 1 });
//   };

//   render() {
//     return (
//       <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//         <Text>Home Screen</Text>
//         <Text>Count: {this.state.count}</Text>
//         <Button
//           title="Go to Details"
//           onPress={() => {
//             /* 1. Navigate to the Details route with params */
//             this.props.navigation.navigate('Details', {
//               itemId: 86,
//               otherParam: 'First Details',
//             });
//           }}
//         />
//       </View>
//     );
//   }
// }

// class DetailsScreen extends React.Component {
//   static navigationOptions = ({ navigation, navigationOptions }) => {
//     const { params } = navigation.state;

//     return {
//       title: params ? params.otherParam : 'A Nested Details Screen',
//       /* These values are used instead of the shared configuration! */
//       headerStyle: {
//         backgroundColor: navigationOptions.headerTintColor,
//       },
//       headerTintColor: navigationOptions.headerStyle.backgroundColor,
//     };
//   };

//   render() {
//     /* 2. Read the params from the navigation state */
//     const { params } = this.props.navigation.state;
//     const itemId = params ? params.itemId : null;
//     const otherParam = params ? params.otherParam : null;

//     return (
//       <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//         <Text>Details Screen</Text>
//         <Text>itemId: {JSON.stringify(itemId)}</Text>
//         <Text>otherParam: {JSON.stringify(otherParam)}</Text>
//         <Button
//           title="Update the title"
//           onPress={() =>
//             this.props.navigation.setParams({ otherParam: 'Updated!' })}
//         />
//         <Button
//           title="Go to Details... again"
//           onPress={() => this.props.navigation.navigate('Details')}
//         />
//         <Button
//           title="Go back"
//           onPress={() => this.props.navigation.goBack()}
//         />
//       </View>
//     );
//   }
// }

// class ModalScreen extends React.Component {
//   render() {
//     return (
//       <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//         <Text style={{ fontSize: 30 }}>This is a modal!</Text>
//         <Button
//           onPress={() => this.props.navigation.goBack()}
//           title="Dismiss"
//         />
//       </View>
//     );
//   }
// }

// const MainStack = StackNavigator(
//   {
//     Home: {
//       screen: HomeScreen,
//     },
//     Details: {
//       screen: DetailsScreen,
//     },
//   },
//   {
//     initialRouteName: 'Home',
//     navigationOptions: {
//       headerStyle: {
//         backgroundColor: '#f4511e',
//       },
//       headerTintColor: '#fff',
//       headerTitleStyle: {
//         fontWeight: 'bold',
//       },
//     },
//   }
// );

// const RootStack = StackNavigator(
//   {
//     Main: {
//       screen: MainStack,
//     },
//     MyModal: {
//       screen: ModalScreen,
//     },
//   },
//   {
//     mode: 'modal',
//     headerMode: 'none',
//   }
// );

// export default class App extends React.Component {
//   render() {
//     return <RootStack />;
//   }
// }
