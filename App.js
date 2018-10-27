import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import HomeScreen from './js/components/Home.js'
import Camera from './js/components/Camera.js'
import SideMenu from './js/components/SideMenu.js'
import History from './js/components/History'
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet } from 'react-native'
import React, { Component } from 'react';


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
        headerLeft: (<Icon name="ios-menu" size={30} onPress={() => navigation.toggleDrawer()} color="gray" style={styles.headerLeftButton} />)
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
  }}
})

const drawerScreens = createDrawerNavigator({
  Home: homeNavigator,
  Camera: cameraNavigator,
  History: historyNavigator
}, {
  contentComponent: SideMenu,
  initialRouteName: 'Home'
})


export default createStackNavigator({
  drawer: { screen: drawerScreens, navigationOptions: { header: null } }
}, {initialRouteName: 'drawer'})

const styles = StyleSheet.create({
  headerLeftButton: {
    marginLeft: 20
  }
})

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
