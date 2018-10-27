import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {NavigationActions} from 'react-navigation';
import {ScrollView, Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default class SideMenu extends Component {
  navigateToScreen = (route) => () => {
    const navigateAction = NavigationActions.navigate({
      routeName: route
    });
    this.props.navigation.dispatch(navigateAction);
  }

  navigateMe = function (route) {
    this.props.navigation.closeDrawer()
    this.props.navigation.navigate(route)
  }

  render () {
    return (
      <View style={styles.container}>
        <ScrollView>
            <View style={styles.logoContainer}>
                {/* <Text style={styles.logoText}>ARGUS</Text> */}
                <EntypoIcon name="eye" size={140} color='white'/>
            </View>
             <TouchableOpacity style={styles.navItem} onPress={ this.navigateToScreen('HomeScreen') }>
                <MaterialIcon name='home' size={25} style={styles.navIcon}/><Text>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => this.navigateMe('CameraScreen') }>
                <MaterialIcon name='linked-camera' size={25} style={styles.navIcon}/><Text>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={ this.navigateToScreen('HistoryScreen') }>
                <MaterialIcon name='history' size={25} style={styles.navIcon}/><Text>History</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem}>
                <MaterialIcon name='settings' size={25} style={styles.navIcon}/><Text>Settings</Text>
              </TouchableOpacity>
        </ScrollView>
        {/* <View>
          <Text>This is my fixed footer</Text>
        </View> */}
      </View>
    );
  }
}

SideMenu.propTypes = {
  navigation: PropTypes.object
};

const styles = StyleSheet.create({
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'gray',
        marginBottom: 10
    }, 
    logoText: {
        fontSize: 20,
        color: 'white'
    }, 
    container: {
        flex: 1
    },
    navIcon: {
        marginRight: 20
    },
    navItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingVertical: 15
    }
})