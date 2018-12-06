import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {
  ScrollView,
  Text,
  View,
  Alert,
  AsyncStorage,
  StyleSheet,
  TouchableOpacity,
  // NativeModules,
  StatusBar,
  Animated,
  Easing,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import keyHolder from '../constants/keys.js'
import Spinner from 'react-native-loading-spinner-overlay'
import EntypoIcon from 'react-native-vector-icons/Entypo'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import ImagePicker from 'react-native-image-picker'
import { material, systemWeights } from 'react-native-typography'
import schemas from '../constants/schemas.js'
import colorConstants from '../constants/colors.js'
import globalState from '../constants/state.js'
import { NavigationActions } from 'react-navigation'
import ImageResizer from 'react-native-image-resizer'
import RNFS from 'react-native-fs'
import Dialog from 'react-native-dialog'
import { Button, Card } from 'react-native-elements'
import axios from 'axios'
// import CameraRollExtended from 'react-native-store-photos-album'
// var RCTCameraRollManager = NativeModules.CameraRollExtendedManager;


const AnimatedIcon = Animated.createAnimatedComponent(EntypoIcon)
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);


class UploadButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      uploading: 0, // 0 = Not uploading, 1 = pre-process, 2 = uploading, 3 = save, 4 = all done
      expandUpload: false,
      uploadProgress: undefined
    }
  }

  toggleUploadDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({ expandUpload: !this.state.expandUpload })
  }

  clickUploadImage = () => {
    ImagePicker.launchImageLibrary({}, (response) => {
      if (response.didCancel) console.log('User cancelled image picker');
      else if (response.error) console.log('ImagePicker Error: ', response.error);
      else if (response.customButton) console.log('User tapped custom button: ', response.customButton);
      else {
        this.setState({ uploading: 1 })
        setTimeout(() => this.upload(response), 250)
      }
    })
    
  }

  clickUploadCamera = () => {
    const options = {
      storageOptions: {
        skipBackup: true,
        path: 'Argus',
      }
    }

    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) console.log('User cancelled image picker')
      else if (response.error) console.log('ImagePicker Error: ', response.error);
      else if (response.customButton) console.log('User tapped custom button: ', response.customButton);
      else {
        this.setState({ uploading: 1 })
        setTimeout(() => this.upload(response), 250)
      }
    })
  }

  _onUploadProgress = progressEvent => {
    if (!progressEvent.lengthComputable) return
    const percentComplete = progressEvent.loaded / progressEvent.total
    console.log(`${(percentComplete * 100).toFixed(2)}%`)
    
    if (percentComplete < 1) this.setState({ uploadProgress : `${(percentComplete * 100).toFixed(2)}%` })
    else this.setState({ uploadProgress: `100.00%`, uploading: 3 })
  }

  upload = async imageResponse => {
    // this.setState({ uploading: 1 })
    const tempArr = imageResponse.path.split('/')
    tempArr.pop()
    const newPath = tempArr.join('/')
    let newHeight
    let newWidth
    if (imageResponse.width > imageResponse.height) {
      newHeight = 720
      newWidth = imageResponse.width * newHeight / imageResponse.height
    } else {
      newWidth = 720
      newHeight = newWidth * imageResponse.height / imageResponse.width
    }

    if (!imageResponse.timestamp) imageResponse.timestamp = new Date() // timestamp is only available when a photo is taken (in android)
    let response
    let resizedImageResponse

    try {
      // Open the database
      const realm = await Realm.open({ schema: schemas.all })

      // Remove any failed matches if they exist
      // const failedMatches = realm.objects(schemas.FailedIdentifiedItemSchema.name).filtered('id == $0', imageResponse.fileName)
      const failedMatches = realm.objects(schemas.ClassifiedResultSchema.name).filtered('id == $0', imageResponse.fileName)
      if (failedMatches.length > 0) realm.write(() => realm.delete(failedMatches))

      // If there's already a success, open the details page
      // const successMatches = realm.objects(schemas.IdentifiedItemSchema.name).filtered('id == $0', imageResponse.fileName)
      const successMatches = realm.objects(schemas.ClassifiedResultSchema.name).filtered('id == $0', imageResponse.fileName)
      const successVals = successMatches.values()
      if (successMatches.length > 0) {
        // There should never be more than 1 success match, but do this anyways
        for (const item of successVals) {
          const copy = { ...item }
          copy.image.base64 = imageResponse.data
          this.setState({ uploading: 0 })
          this.props.navigation.navigate('DetailsScreen', copy)
        }
        return
      }

      resizedImageResponse = await ImageResizer.createResizedImage(imageResponse.uri, newWidth, newHeight, 'JPEG', 100, 0, newPath)
      // const newUri = await RCTCameraRollManager.saveToCameraRoll({ uri: resizedImageResponse.path, album: 'Argus' }, 'photo')

      // Get the host
      const host = await AsyncStorage.getItem('host')
      console.log('uploading to', host)


      // Send the request
      const formData = new FormData()
      console.log(this.props.email)
      console.log(this.props.password)
      console.log(resizedImageResponse.path)
      formData.append('username', this.props.email) // you can append anyone.
      formData.append('password', this.props.password)
      formData.append('photo', {
          uri: resizedImageResponse.uri,
          type: 'image/jpeg', // or photo.type
          name: 'testPhotoName'
      })
      console.log('fetching///', host + '/classify')
      this.setState({ uploading: 2 })
      response = await axios.post(host + '/classify', formData, { onUploadProgress: this._onUploadProgress })
      // If this is sent to a python flask server, then receive the POST(! not GET!) request as such:
      // file = request.files['photo']
      // file.save('./test.jpg')

      // Status code must be 200
      if (response.status !== 200) throw new Error(`Non-200 status code (${response.status})`)
      const classifications = response.data // jsonBody should be an array of objects with the keys specified in js/constants/schemas.ClassificationSchema.properties

      if (Object.keys(classifications).length === 0) {
        Alert.alert('Aw man!', 'No matches found!')
        this.setState({ uploading: 4 })
        setTimeout(() => {
          this.setState({ uploading: 0 })
        })
        if (resizedImageResponse) RNFS.unlink(resizedImageResponse.path).catch(err => console.log('Failed to unlink downsized photo', err))
      } else {
        const formatted = {
          id: imageResponse.fileName,
          successful: true,
          response: JSON.stringify(response, null, 2),
          image: {
            path: imageResponse.path,
            width: imageResponse.width,
            height: imageResponse.height,
            sizeMB: (imageResponse.fileSize / 1000000).toFixed(2)
          },
          date: imageResponse.timestamp,
          classifications
        }
        realm.write(() => {
          realm.create(schemas.ClassifiedResultSchema.name, formatted, true)
          // realm.create(schemas.IdentifiedItemSchema.name, formatted, true)
        })
        formatted.image.base64 = imageResponse.data

        this.dispatchToHistoryScreen('classifiedResults', [ formatted ])

        // Then navigate to the details
        if (resizedImageResponse) {
          RNFS.unlink(resizedImageResponse.path)
          .then(() => {
            this.setState({ uploading: 4 })
            setTimeout(() => { // Let the user see that it's finished
              this.setState({ uploading: 0 })
              setTimeout(() => {  // Wait for the animation to hide the progress box to finish
                this.props.navigation.navigate('DetailsScreen', formatted)
              }, 250)
            }, 250)
          })
          .catch(err => {
            console.log(err)
            this.setState({ uploading: 0 })
            Alert.alert('Unlink Error', err.message)
          })
        } else {
          this.setState({ uploading: 4 })
          setTimeout(() => {  // Let the user see that it's finished
            this.setState({ uploading: 0 })
            setTimeout(() => {  // Wait for the animation to hide the progress box to finish
              this.props.navigation.navigate('DetailsScreen', formatted)
            }, 250)
          }, 250)
        }
      }
    } catch (err) {
      console.log(err)
      if (resizedImageResponse) RNFS.unlink(resizedImageResponse.path).catch(err => console.log('Failed to unlink downsized photo', err))
      const formatted = {
        id: imageResponse.fileName,
        successful: false,
        response: JSON.stringify(response, null, 2) || 'No response available',
        error: err.message,
        image: {
            path: imageResponse.uri,
            width: imageResponse.width,
            height: imageResponse.height,
            sizeMB: (imageResponse.fileSize / 1000000).toFixed(2)
        },
        date: imageResponse.timestamp
      }
      Realm.open({ schema: schemas.all })
      .then(realm => {
        realm.write(() => {
            realm.create(schemas.ClassifiedResultSchema.name, formatted, true)
        })
        formatted.image.base64 = imageResponse.data
        this.dispatchToHistoryScreen('classifiedResults', [ formatted ])

        console.log('saved to failures')
        this.setState({ uploading: 0 })
        Alert.alert('Saved to Failures', err.message)
      })
      .catch(err => {
        formatted.image.base64 = imageResponse.data
        this.dispatchToHistoryScreen('classifiedResults', [ formatted ])
        Alert.alert('Error', err.message)
        this.setState({ uploading: 0 })
        console.log('realm pipeline err',  err)
          
      })
    }
    this.setState({ uploadProgress: undefined })
  }

  dispatchToHistoryScreen = (key, value) => {
        // Update history screen
        const setParamsAction = NavigationActions.setParams({
          params: { [key]: value },
          key: keyHolder.get('HistoryScreen'),
        })
        // Since the params persist, remove it after it dispatches one time
        const setParamsActionClear = NavigationActions.setParams({
          params: { [key]: undefined },
          key: keyHolder.get('HistoryScreen'),
        })
        this.props.navigation.dispatch(setParamsAction)
        this.props.navigation.dispatch(setParamsActionClear)

  }

  render () {
    const uploadDropdownViewStyle = this.state.expandUpload ? {  } : { height: 0, opacity: 0 }
    const uploadDropdownItemsStyle = this.state.expandUpload ? { overflow: 'hidden' } : { overflow: 'hidden', height: 0 }
    
    const stepOne = this.state.uploading === 1 ? (<View style={styles.cardStepContainer}><MaterialIcon name='check' size={25} style={styles.cardStepIconCurrent} /><Text style={styles.cardStepTextCurrent}>Preprocessing...</Text></View>) : 
                    this.state.uploading > 1 ? (<View style={styles.cardStepContainer}><MaterialIcon name='check' size={25} style={styles.cardStepIconPrevious} /><Text style={styles.cardStepTextCurrent}>Preprocessed</Text></View>) : 
                    (<View style={styles.cardStepContainer}><MaterialIcon name='check' size={25} style={styles.cardStepIconNext} /><Text style={styles.cardStepTextNext}>Preprocess</Text></View>)

    const stepTwo = this.state.uploading === 2 ? (<View style={styles.cardStepContainer}><MaterialIcon name='check' size={25} style={styles.cardStepIconCurrent} /><View style={styles.uploadTextContainer}><Text style={styles.cardStepTextCurrent}>Uploading...</Text><Text style={styles.cardStepTextNext}>{this.state.uploadProgress || ''}</Text></View></View>) : 
                    this.state.uploading > 2 ? (<View style={styles.cardStepContainer}><MaterialIcon name='check' size={25} style={styles.cardStepIconPrevious} /><View style={styles.uploadTextContainer}><Text style={styles.cardStepTextCurrent}>Uploaded</Text><Text style={styles.cardStepTextNext}>100.00%</Text></View></View>) : 
                    (<View style={styles.cardStepContainer}><MaterialIcon name='check' size={25} style={styles.cardStepIconNext} /><Text style={styles.cardStepTextNext}>Upload</Text></View>)

    const stepThree = this.state.uploading === 3 ? (<View style={styles.cardStepContainer}><MaterialIcon name='check' size={25} style={styles.cardStepIconCurrent} /><Text style={styles.cardStepTextCurrent}>Saving...</Text></View>) : 
                      this.state.uploading > 3 ? (<View style={styles.cardStepContainer}><MaterialIcon name='check' size={25} style={styles.cardStepIconPrevious} /><Text style={styles.cardStepTextCurrent}>Saved</Text></View>) :
                    (<View style={styles.cardStepContainer}><MaterialIcon name='check' size={25} style={styles.cardStepIconNext} /><Text style={styles.cardStepTextNext}>Save</Text></View>)


    const progressBox = (
      <Card title='Progress' containerStyle={styles.cardContainer} titleStyle={styles.cardTitle}>
        {stepOne}
        {stepTwo}
        {stepThree}
        {/* <Button onPress={() => this.setState({hide: true})} title='Hide' backgroundColor={colorConstants.headerBackgroundColorVeryLight} containerViewStyle={styles.cardHideButtonContainer} ></Button> */}
      </Card>
    )

    return (
      <View>
        <Spinner
          overlayColor='rgba(0,0,0,0.75)'
          visible={this.state.uploading > 0}
          cancelable
          animation='slide'
          customIndicator={progressBox}
        />
        {/* <Spinner
          visible={this.state.uploading}
          textContent={'Uploading...'}
          textStyle={{ color: '#FFF' }}
          overlayColor='rgba(0, 0, 0, 0.75)'
          animation='fade'
          color={colorConstants.headerBackgroundColor}
        /> */}
        <TouchableOpacity style={styles.navItem} onPress={ () => /*this.navigate('CameraScreen', 1)*/ this.toggleUploadDropdown() }>
          <MaterialIcon name='cloud-upload' size={26} style={styles.navIcon}/>
          <View style={styles.navItemDropdownView}>
            <Text style={this.state.current === 1 ? { ...styles.navItemText, ...styles.navItemDropdownText, fontWeight: 'bold', alignSelf: 'center' } : { ...styles.navItemText, ...styles.navItemDropdownText, alignSelf: 'center' } }>Upload</Text>
            <MaterialIcon name={this.state.expandUpload ? 'arrow-drop-up' : 'arrow-drop-down'} size={26} style={styles.navItemDropdownIcon}/>
          </View>

        </TouchableOpacity>
        

        <View style={uploadDropdownViewStyle}>
          <TouchableOpacity style={{...styles.subNavItem, ...uploadDropdownItemsStyle}} onPress={ this.clickUploadImage }>
            <MaterialIcon name='image' size={26} style={styles.navIcon}/><Text style={ this.state.current === 1 ? { ...styles.navItemText, ...styles.navItemText, fontWeight: 'bold' } : { ...styles.navItemText, ...styles.navItemText }}>Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{...styles.subNavItem, ...uploadDropdownItemsStyle}} onPress={ this.clickUploadCamera }>
            <MaterialIcon name='photo-camera' size={26} style={styles.navIcon}/><Text style={ this.state.current === 1 ? { ...styles.navItemText, fontWeight: 'bold' } : styles.navItemText }>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    )

  }
}

export default class SideMenu extends Component {
  static getDerivedStateFromProps(nextProps, state) {
    const params = nextProps.navigation.state.params
    if (!params || !params.email || !params.password) return null
    if (state.email !== params.email || state.password !== params.password) {
      return {
        email: params.email,
        password: params.password
      }
    }
    else return null
  }

  constructor(props) {
    super(props)
    this.state = {
      scaleAnim: new Animated.Value(1),
      current: 0,
      email: '',
      password: ''
    }

    AsyncStorage.getItem('login').then(login => {
      if (!login) return
      const acc = JSON.parse(login)
      globalState.email = acc.email
      globalState.password = acc.password
      this.setState({ email: acc.email, password: acc.password })
    })
    
  }

  componentDidMount = function () {
    const navState = this.props.navigation.state
    if (!keyHolder.has(navState.routeName)) keyHolder.set(navState.routeName, navState.key)
  }

  bounceVisibility = () => {
    Animated.sequence([
      Animated.timing(this.state.scaleAnim, {toValue: 0.8, duration: 100, easing: Easing.elastic()}),
      Animated.timing(this.state.scaleAnim, {toValue: 1.15, duration: 200, easing: Easing.elastic()}),
      Animated.timing(this.state.scaleAnim, {toValue: 1, duration: 200})
    ]).start()
  }

  navigate = (screenName, current) => {
    this.props.navigation.navigate(screenName)
    this.setState({ current })
  }

  accountAction = () => {
    if (!this.state.email) this.props.navigation.navigate('Login')
    else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => {
          AsyncStorage.removeItem('login').then(() => {
            const setParamsAction = NavigationActions.setParams({
              params: { logout: true },
              key: keyHolder.get('HistoryScreen'),
            })
            const setParamsActionReset = NavigationActions.setParams({
              params: { email: undefined },
              key: this.props.navigation.state.key,
            });
            this.props.navigation.dispatch(setParamsActionReset)
            this.props.navigation.dispatch(setParamsAction)
            globalState.email = undefined
            globalState.password = undefined
            this.setState({ email: undefined })
          })
        }}
      ])
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor='black' />
        <ScrollView>
            <View style={{ ...styles.logoContainer}}>
                <Text style={ { ...material.headlineWhite, ...systemWeights.light }}>ARGUS</Text>
                <AnimatedIcon onPress={ this.bounceVisibility } style={{
                  transform: [
                    { scaleX: this.state.scaleAnim },
                    { scaleY: this.state.scaleAnim }
                    ]}} name="eye" size={140} color='white'/>
            </View>
            <TouchableOpacity style={styles.navItem} onPress={this.accountAction}>
              <MaterialCommunityIcon name={this.state.email ? 'logout' : 'login'} size={26} style={styles.navIcon}/><Text style={styles.navItemText}>{ this.state.email ? this.state.email : 'Login' }</Text>
            </TouchableOpacity>
            <View style={styles.border}></View>

            <TouchableOpacity style={styles.navItem} onPress={ () => this.navigate('DashboardScreen', 0) }>
              <MaterialIcon name='dashboard' size={26} style={styles.navIcon}/><Text style={ this.state.current === 0 ? { ...styles.navItemText, fontWeight: 'bold' } : styles.navItemText }>Dashboard</Text>
            </TouchableOpacity>

            <UploadButton navigation={this.props.navigation} email={this.state.email} password={this.state.password} />

            <TouchableOpacity style={styles.navItem} onPress={ () => this.navigate('HistoryScreen', 3) }>
              <MaterialIcon name='history' size={26} style={styles.navIcon}/><Text style={ this.state.current === 3 ? { ...styles.navItemText, fontWeight: 'bold' } : styles.navItemText }>History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={ () => this.navigate('SettingsScreen', 4) }>
              <MaterialIcon name='settings' size={26} style={styles.navIcon}/><Text style={ this.state.current === 4 ? { ...styles.navItemText, fontWeight: 'bold' } : styles.navItemText }>Settings</Text>
            </TouchableOpacity>

            <View style={styles.border}></View>
            <TouchableOpacity style={ {...styles.navItem, marginBottom: 20} } onPress={ () => {} }>
              <MaterialIcon name='feedback' size={26} style={styles.navIcon}/><Text style={styles.navItemText}>Send Feedback</Text>
            </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}

SideMenu.propTypes = {
  navigation: PropTypes.object
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colorConstants.headerBackgroundColorLight,
    borderColor: colorConstants.headerBackgroundColorLight,
    width: 300,
  },
  cardTitle: {
      color: colorConstants.textPrimary
  },
  cardHideButtonContainer: {
    width: '100%',
    marginLeft: 0,
    marginTop: 15
  },
  cardStepContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: 'center'
  },
  cardStepTextCurrent: {
    color: colorConstants.textPrimary
  },
  cardStepTextNext: {
    color: colorConstants.textDisabled
  },
  cardStepIconNext: {
    color: colorConstants.textDisabled,
    marginRight: 10
  },
  cardStepIconPrevious: {
    color: colorConstants.success,
    marginRight: 10
  },
  cardStepIconCurrent: {
    color: colorConstants.textPrimary,
    marginRight: 10
  },
  uploadTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  logoContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 15,
      backgroundColor: colorConstants.headerBackgroundColorLight,
      marginBottom: 5,
      // transform: [
      //   {
      //     scaleX: .5
      //   }, {scaleY: .5}
      // ]
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: colorConstants.divider,
    marginVertical: 7
  },
  logoText: {
      fontSize: 20,
      color: 'white'
  }, 
  container: {
      flex: 1
  },
  navIcon: {
      marginRight: 20,
      color: 'white'
  },
  navItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
  },
  navItemText: {
    color: 'white'
  },
  navItemDropdownView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  navItemDropdownText: {
    alignSelf: 'center'
  },
  navItemDropdownIcon: {
    color: 'white',
    marginRight: 5
  },
  subNavItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 10,
    paddingLeft: 50
  }
})