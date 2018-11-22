import React, { Component } from 'react'
import CameraDefaults from '../constants/camera.js'
import { Alert, AsyncStorage, Picker } from 'react-native'
// import Dialog from "react-native-dialog";
import { material } from 'react-native-typography'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Dialog, { ScaleAnimation } from 'react-native-popup-dialog';
import { NavigationActions, StackActions } from 'react-navigation'
import {
    Text,
    TouchableHighlight,
    View,
    ScrollView,
    StyleSheet,
} from 'react-native';

class SettingsItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  _click () {
  }

  render () {
    // Each must have an onPress function for the highlight effect to appear
    return (
      <TouchableHighlight style={styles.settingsItem} onPress={ () => this.props.onPress ? this.props.onPress() : undefined } underlayColor='#E0E0E0' activeOpacity={1}>
        <View style={styles.settingsItemContainer}>
          <Icon name={ this.props.icon } size={30} style={styles.settingsItemTextContainer}/>
          <View style={styles.settingsItemTextContainer}>
              <Text style={styles.settingsItemTitle}>{ this.props.title }</Text>
              <Text style={styles.settingsItemValue}>{ this.props.value }</Text>
              {this.props.children}
          </View>
          { this.props.children }
        </View>
      </TouchableHighlight>

    )
  }
}

function List (props) {
  return (
    <View>
      {
        props.items.map(item => {
          return (
            <TouchableHighlight key={item.text} underlayColor='#E0E0E0' activeOpacity={1} style={styles.dialogOption} onPress={item.onPress ? item.onPress : () => {}}><Text>{item.text}</Text></TouchableHighlight>
          )
        })
      }
    </View>
  )
}

export default class Settings extends Component {
    static navigationOptions = {
      title: 'Settings'
    };

    constructor(props) {
        super(props)
        this.state = {
        }
        // AsyncStorage.getItem('login').then(login => {
        //     const setParamsAction = NavigationActions.setParams({
        //         params: { logout: true },
        //         key: keyHolder.get('HistoryScreen'),
        //     })
        //     const setParamsActionReset = NavigationActions.setParams({
        //     params: { email: undefined },
        //     key: this.props.navigation.state.key,
        //     });
        //     this.props.navigation.dispatch(setParamsActionReset)
        //     this.props.navigation.dispatch(setParamsAction)
        // }).catch(console.log)

        setTimeout(() => {
            const actionToDispatch = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'SideMenu' })]
              })
            this.props.navigation.dispatch(actionToDispatch)
        }, 4000)

    }

    render() {
      const { navigate } = this.props.navigation

      return (
        <View >

        </View>
      );
    }
  }

  
const styles = StyleSheet.create({
});
  