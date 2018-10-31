import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import HomeScreen from './js/components/Home.js'
import Camera from './js/components/Camera.js'
import SideMenu from './js/components/SideMenu.js'
import History from './js/components/History'
import Settings from './js/components/Settings.js'
import Details from './js/components/Details.js'
import Login from './js/components/Login.js'
import Upload from './js/components/Upload.js'
import ViewImage from './js/components/ViewImage.js'
import Icon from 'react-native-vector-icons/Ionicons';
import colorConstants from './js/constants/colors'
import { StyleSheet } from 'react-native'
import React, { Component } from 'react';
import { fromLeft, zoomIn } from 'react-navigation-transitions'

const homeNavigator = createStackNavigator({
  HomeScreen: {
    screen: HomeScreen,
    navigationOptions: ({ navigation }) => { 
      return {
        headerLeft: (<Icon name="ios-menu" size={30} onPress={() => navigation.toggleDrawer()} color={colorConstants.headerTextColor} style={styles.headerLeftButton} />),
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
  }}
}, {
  cardStyle: { backgroundColor: colorConstants.headerBackgroundColorVeryLight }
})

// const cameraNavigator = createStackNavigator({
//   CameraScreen: {
//     screen: Camera,
//     navigationOptions: ({ navigation }) => { 
//       return {
//         headerLeft: (<Icon name="ios-menu" size={30} onPress={() => navigation.toggleDrawer()} color={colorConstants.headerTextColor} style={styles.headerLeftButton} />),
//         headerStyle: styles.headerStyle,
//         headerTintColor: colorConstants.headerTextColor
//       }
//   }}
// })

const uploadNavigator = createStackNavigator({
  UploadScreen: {
    screen: Upload,
    navigationOptions: ({ navigation }) => {
      return {
        headerLeft: (<Icon name="ios-menu" size={30} onPress={() => navigation.toggleDrawer()} color={colorConstants.headerTextColor} style={styles.headerLeftButton} />),
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
  }},
    CameraScreen: {
    screen: Camera,
    navigationOptions: ({ navigation }) => { 
      return {
        // headerLeft: (<Icon name="ios-menu" size={30} onPress={() => navigation.toggleDrawer()} color={colorConstants.headerTextColor} style={styles.headerLeftButton} />),
        // headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
  }},
  ViewImageFromUploadScreen: {
    screen: ViewImage,
    navigationOptions: ({ navigation }) => { 
      return {
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
  }}
}, {
  cardStyle: { backgroundColor: colorConstants.headerBackgroundColorVeryLight }
})

const historyNavigator = createStackNavigator({
  HistoryScreen: {
    screen: History,
    navigationOptions: ({ navigation }) => { 
      return {
        headerLeft: (<Icon name="ios-menu" size={30} onPress={() => navigation.toggleDrawer()} color={colorConstants.headerTextColor} style={styles.headerLeftButton} />),
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
  }},
  DetailsScreen: {
    screen: Details,
    navigationOptions: ({ navigation }) => { 
      return {
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
  }},
  ViewImageScreen: {
    screen: ViewImage,
    navigationOptions: ({ navigation }) => { 
      return {
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
  }}
}, {
  cardStyle: { backgroundColor: colorConstants.headerBackgroundColorVeryLight }
})

const settingsNavigator = createStackNavigator({
  SettingsScreen: {
    screen: Settings,
    navigationOptions: ({ navigation }) => { 
      return {
        headerLeft: (<Icon name="ios-menu" size={30} onPress={() => navigation.toggleDrawer()} color={colorConstants.headerTextColor} style={styles.headerLeftButton} />),
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
  }}
}, {
  cardStyle: { backgroundColor: colorConstants.headerBackgroundColorVeryLight }
})

const drawerScreens = createDrawerNavigator({
  Home: homeNavigator,
  Upload: uploadNavigator,
  // Camera: cameraNavigator,
  History: historyNavigator,
  Settings: settingsNavigator
}, {
  contentComponent: SideMenu,
  initialRouteName: 'Upload'
})


export default createStackNavigator({
  Drawer: {
    screen: drawerScreens,
    navigationOptions: {
      header: null
    }
  },
  Login: {
    screen: Login,
    navigationOptions: () => {
      return {
        gesturesEnabled: true,
        gestureDirection: 'inverted',
        gestureResponseDistance: 50,
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
    }
  }
}, {
  transitionConfig: () => fromLeft(),
  initialRouteName: 'Drawer'
})

const styles = StyleSheet.create({
  headerLeftButton: {
    paddingLeft: 20,
    flex: 1,
    paddingVertical: 12
  },
  headerStyle: {
    backgroundColor: colorConstants.headerBackgroundColor,
  },
  cardStyle: {
    backgroundColor: colorConstants.headerBackgroundColorVeryLight
  }
})
