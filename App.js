import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import HomeScreen from './js/components/Home.js'
import Camera from './js/components/Camera.js'
import SideMenu from './js/components/SideMenu.js'
import History from './js/components/History'
import Settings from './js/components/Settings.js'
import Details from './js/components/Details.js'
import Login from './js/components/Login.js'
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet } from 'react-native'
import React, { Component } from 'react';
import { fromLeft, zoomIn } from 'react-navigation-transitions'

const homeNavigator = createStackNavigator({
  HomeScreen: {
    screen: HomeScreen,
    navigationOptions: ({ navigation }) => { 
      return {
        headerLeft: (<Icon name="ios-menu" size={30} onPress={() => navigation.toggleDrawer()} color="gray" style={styles.headerLeftButton} />)
      }
  }}
})

const cameraNavigator = createStackNavigator({
  CameraScreen: {
    screen: Camera,
    navigationOptions: ({ navigation }) => { 
      return {
        headerLeft: (<Icon name="ios-menu" size={30} onPress={() => navigation.toggleDrawer()} color="white" style={styles.headerLeftButton} />)
      }
  }}
})

const historyNavigator = createStackNavigator({
  HistoryScreen: {
    screen: History,
    navigationOptions: ({ navigation }) => { 
      return {
        headerLeft: (<Icon name="ios-menu" size={30} onPress={() => navigation.toggleDrawer()} color="gray" style={styles.headerLeftButton} />)
      }
  }},
  DetailsScreen: {
    screen: Details
  }
})

const settingsNavigator = createStackNavigator({
  SettingsScreen: {
    screen: Settings,
    navigationOptions: ({ navigation }) => { 
      return {
        headerLeft: (<Icon name="ios-menu" size={30} onPress={() => navigation.toggleDrawer()} color="gray" style={styles.headerLeftButton} />)
      }
  }}
})

const drawerScreens = createDrawerNavigator({
  Home: homeNavigator,
  Camera: cameraNavigator,
  History: historyNavigator,
  Settings: settingsNavigator
}, {
  contentComponent: SideMenu,
  initialRouteName: 'Home'
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
    navigationOptions: {
      gesturesEnabled: true,
      gestureDirection: 'inverted',
      gestureResponseDistance: 50
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
  }
})
