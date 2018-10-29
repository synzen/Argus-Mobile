import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {ScrollView, Text, View, StyleSheet, TouchableOpacity, Animated, Easing} from 'react-native';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { material, systemWeights } from 'react-native-typography'
const AnimatedIcon = Animated.createAnimatedComponent(EntypoIcon)

export default class SideMenu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fadeAnim: new Animated.Value(1)
    }
  }

  componentDidMount = function () {
    // Animated.timing(
    //   this.state.fadeAnim,
    //   { toValue: 1 }
    // ).start();
  }

  bounceVisibility = function () {
    // console.log('bbb')
    Animated.sequence([
      Animated.timing(this.state.fadeAnim, {toValue: 0.8, duration: 150, easing: Easing.elastic()}),
      Animated.timing(this.state.fadeAnim, {toValue: 1.15, duration: 200, easing: Easing.elastic()}),
      Animated.timing(this.state.fadeAnim, {toValue: 1, duration: 200})
    ]).start()
  }

  render () {
    return (
      <View style={styles.container}>
        <ScrollView>
            <View style={{ ...styles.logoContainer}}>
                <Text style={ { ...material.headlineWhite, ...systemWeights.light }}>ARGUS</Text>
                <AnimatedIcon onPress={ this.bounceVisibility.bind(this) } style={{
                  transform: [
                    { scaleX: this.state.fadeAnim },
                    { scaleY: this.state.fadeAnim }
                    ]}} name="eye" size={140} color='white'/>
            </View>
            <TouchableOpacity style={styles.navItem} onPress={ () => { this.props.navigation.navigate('Login') } }>
              <MaterialCommunityIcon name='login' size={30} style={styles.navIcon}/><Text>Login</Text>
            </TouchableOpacity>
            <View style={styles.border}></View>

             <TouchableOpacity style={styles.navItem} onPress={ () => this.props.navigation.navigate('HomeScreen') }>
              <MaterialIcon name='home' size={30} style={styles.navIcon}/><Text>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={ () => this.props.navigation.navigate('CameraScreen') }>
              <MaterialIcon name='linked-camera' size={30} style={styles.navIcon}/><Text>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={ () => this.props.navigation.navigate('HistoryScreen') }>
              <MaterialIcon name='history' size={30} style={styles.navIcon}/><Text>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={ () => this.props.navigation.navigate('SettingsScreen') }>
              <MaterialIcon name='settings' size={30} style={styles.navIcon}/><Text>Settings</Text>
            </TouchableOpacity>
            <View style={styles.border}></View>
            <TouchableOpacity style={styles.navItem} onPress={ () => {} }>
              <MaterialIcon name='feedback' size={30} style={styles.navIcon}/><Text>Send Feedback</Text>
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
        paddingVertical: 15,
        backgroundColor: 'gray',
        marginBottom: 5,
        // transform: [
        //   {
        //     scaleX: .5
        //   }, {scaleY: .5}
        // ]
    },
    border: {
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
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
        marginRight: 25
    },
    navItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10
    }
})