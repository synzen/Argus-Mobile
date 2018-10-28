import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {ScrollView, Text, View, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { material, systemWeights } from 'react-native-typography'

export default class SideMenu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fadeAnim: new Animated.Value(0)
    }
  }

  componentDidMount = function () {
    Animated.timing(
      // Uses easing functions
      this.state.fadeAnim, // The value to drive
      { toValue: 1 } // Configuration
    ).start(); // Don't forget start!
  }

  bounceVisibility = function () {
    // console.log('bbb')
    // Animated.sequence([
    //   Animated.timing(this.state.fadeAnim, {toValue: 0}),
    //   Animated.timing(this.state.fadeAnim, {toValue: 1})
    // ]).start()
  }

  render () {
    return (
      <View style={styles.container}>
        <ScrollView>
            <Animated.View  style={{ ...styles.logoContainer, opacity: this.state.fadeAnim }}>
                <Text style={ { ...material.headlineWhite, ...systemWeights.light }}>ARGUS</Text>
                <EntypoIcon onPress={ this.bounceVisibility.bind(this) } name="eye" size={140} color='white'/>
            </Animated.View>
             <TouchableOpacity style={styles.navItem} onPress={() => this.props.navigation.navigate('HomeScreen') }>
                <MaterialIcon name='home' size={25} style={styles.navIcon}/><Text>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => this.props.navigation.navigate('CameraScreen') }>
                <MaterialIcon name='linked-camera' size={25} style={styles.navIcon}/><Text>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => this.props.navigation.navigate('HistoryScreen') }>
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