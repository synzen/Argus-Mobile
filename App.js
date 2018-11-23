import { createStackNavigator, createDrawerNavigator } from 'react-navigation'
import Dashboard from './js/components/Dashboard.js'
import SideMenu from './js/components/SideMenu.js'
import History from './js/components/History'
import Settings from './js/components/Settings.js'
import Details from './js/components/Details.js'
import Login from './js/components/Login.js'
// import Loading from './js/components/Loading.js'
import ViewImage from './js/components/ViewImage.js'
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import colorConstants from './js/constants/colors'
import { StyleSheet } from 'react-native'
import React from 'react'
import { fromLeft } from 'react-navigation-transitions'

const dashboardNavigator = createStackNavigator({
  DashboardScreen: {
    screen: Dashboard,
    navigationOptions: ({ navigation }) => {
      return {
        headerLeft: (<Icon name='ios-menu' size={30} onPress={() => navigation.toggleDrawer()} color={colorConstants.headerTextColor} style={{ ...styles.headerLeftButton }} />),
        headerStyle: styles.headerStyle,
        // headerTransparent: true,
        // headerTintColor: 'black'
        headerTintColor: colorConstants.headerTextColor

      }
    }
  }
}, {
  cardStyle: { backgroundColor: colorConstants.headerBackgroundColor }
})

const historyNavigator = createStackNavigator({
  HistoryScreen: {
    screen: History,
    navigationOptions: ({ navigation }) => {
      return {
        headerLeft: (<Icon name='ios-menu' size={30} onPress={() => navigation.toggleDrawer()} color={colorConstants.headerTextColor} style={styles.headerLeftButton} />),
        headerRight: (<MaterialIcon name='delete' size={30} onPress={navigation.getParam('purge')} color={colorConstants.gray} style={styles.headerRightButton}/>),
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
    }
  },
  DetailsScreen: {
    screen: Details,
    navigationOptions: ({ navigation }) => {
      return {
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
    }
  },
  ViewImageScreen: {
    screen: ViewImage,
    navigationOptions: ({ navigation }) => {
      return {
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
    }
  }
}, {
  cardStyle: { backgroundColor: colorConstants.headerBackgroundColor }
})

const settingsNavigator = createStackNavigator({
  SettingsScreen: {
    screen: Settings,
    navigationOptions: ({ navigation }) => {
      return {
        headerLeft: (<Icon name='ios-menu' size={30} onPress={() => navigation.toggleDrawer()} color={colorConstants.headerTextColor} style={styles.headerLeftButton} />),
        headerStyle: styles.headerStyle,
        headerTintColor: colorConstants.headerTextColor
      }
    }}
}, {
  cardStyle: { backgroundColor: colorConstants.headerBackgroundColor }
})

const drawerScreens = createDrawerNavigator({
  Home: dashboardNavigator,
  History: historyNavigator,
  Settings: settingsNavigator,
}, {
  contentComponent: SideMenu,
  drawerBackgroundColor: colorConstants.headerBackgroundColor,
  initialRouteName: 'Home'
})

export default createStackNavigator({
  // LoadingScreen: {
  //   screen: Loading,
  //   navigationOptions: {
  //     header: null
  //   }
  // },
  SideMenu: {
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
  cardStyle: { backgroundColor: colorConstants.headerBackgroundColor },
  transitionConfig: () => fromLeft(),
  initialRouteName: 'SideMenu'
})


const styles = StyleSheet.create({
  headerLeftButton: {
    paddingLeft: 20,
    flex: 1,
    paddingVertical: 12
  },
  headerRightButton: {
    paddingRight: 20,
    flex: 1,
    paddingVertical: 12
  },
  headerStyle: {
    backgroundColor: colorConstants.headerBackgroundColorLight
  },
  cardStyle: {
    backgroundColor: colorConstants.headerBackgroundColor
  }
})
