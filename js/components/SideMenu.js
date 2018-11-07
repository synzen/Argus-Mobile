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
      scaleAnim: new Animated.Value(1),
      current: 0
    }
  }

  componentDidMount = function () {
    // Animated.timing(
    //   this.state.scaleAnim,
    //   { toValue: 1 }
    // ).start();
  }

  bounceVisibility = () => {
    // console.log('bbb')
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

  render () {
    return (
      <View style={styles.container}>
        <ScrollView>
            <View style={{ ...styles.logoContainer}}>
                <Text style={ { ...material.headlineWhite, ...systemWeights.light }}>ARGUS</Text>
                <AnimatedIcon onPress={ this.bounceVisibility } style={{
                  transform: [
                    { scaleX: this.state.scaleAnim },
                    { scaleY: this.state.scaleAnim }
                    ]}} name="eye" size={140} color='white'/>
            </View>
            <TouchableOpacity style={styles.navItem} onPress={ () => { this.props.navigation.navigate('Login') } }>
              <MaterialCommunityIcon name='login' size={30} style={styles.navIcon}/><Text>Login</Text>
            </TouchableOpacity>
            <View style={styles.border}></View>

            <TouchableOpacity style={styles.navItem} onPress={ () => this.navigate('HomeScreen', 0) }>
              <MaterialIcon name='home' size={30} style={styles.navIcon}/><Text style={ this.state.current === 0 ? { fontWeight: 'bold' } : {} }>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={ () => this.navigate('CameraScreen', 1) }>
              <MaterialIcon name='cloud-upload' size={30} style={styles.navIcon}/><Text style={ this.state.current === 1 ? { fontWeight: 'bold' } : {} }>Upload</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.navItem} onPress={ () => this.navigate('CameraScreen', 2) }>
              <MaterialIcon name='linked-camera' size={30} style={styles.navIcon}/><Text style={ this.state.current === 2 ? { fontWeight: 'bold' } : {} }>Camera</Text>
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.navItem} onPress={ () => this.navigate('HistoryScreen', 3) }>
              <MaterialIcon name='history' size={30} style={styles.navIcon}/><Text style={ this.state.current === 3 ? { fontWeight: 'bold' } : {} }>History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={ () => this.navigate('SettingsScreen', 4) }>
              <MaterialIcon name='settings' size={30} style={styles.navIcon}/><Text style={ this.state.current === 4 ? { fontWeight: 'bold' } : {} }>Settings</Text>
            </TouchableOpacity>

            <View style={styles.border}></View>
            <TouchableOpacity style={styles.navItem} onPress={ () => {} }>
              <MaterialIcon name='feedback' size={30} style={styles.navIcon}/><Text>Send Feedback</Text>
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
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: '#546E7A',
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
        marginRight: 25,
        color: '#546E7A'
    },
    navItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    }
})