import React, { Component } from 'react'
import CameraDefaults from '../constants/camera.js'
import { material } from 'react-native-typography'
import colorConstants from '../constants/colors'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Dialog from "react-native-dialog"
import {
  Alert,
  AsyncStorage,
  Text,
  TouchableHighlight,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native'

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
      <TouchableHighlight style={styles.settingsItem} onPress={ () => this.props.onPress ? this.props.onPress() : undefined } underlayColor={colorConstants.headerBackgroundColorVeryLight} activeOpacity={1}>
        <View style={styles.settingsItemContainer}>
          <Icon name={ this.props.icon } size={30} style={styles.settingsItemTextContainer} color='white'/>
          <View style={styles.settingsItemTextContainer}>
              <Text style={styles.settingsItemTitle}>{ this.props.title }</Text>
              <Text style={styles.settingsItemValue}>{ this.props.value }</Text>
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
            host: '',
            flash: CameraDefaults.flash,
            focus: CameraDefaults.focus,
            camera: CameraDefaults.camera,
            dialog: false,
            hostDialog: false
        }
        AsyncStorage.multiGet(['camera.flash', 'camera.focus', 'camera.camera', 'host']).then(vals => {
          vals.map(item => {
            if (!item[1]) return
            if (item[0] === 'camera.flash') this.setState({ flash: item[1] })
            else if (item[0] === 'camera.focus') this.setState({ focus: item[1] })
            else if (item[0] === 'camera.camera') this.setState({ focus: item[1] })
            else if (item[0] === 'host') this.setState({ host: item[1] })
          })
        })
    }

    setHost = () => {
      this.setState({ hostDialog: false })
      AsyncStorage.setItem('host', this.state.host).catch(err => {
          Alert.alert('Failed to save host to storage', err.message, [ { text: 'OK' }])
      })
    }
    
    render() {
      const { navigate } = this.props.navigation

      return (
        <ScrollView style={ styles.container }>
            <Text style={ { ...styles.category, borderTopWidth: 0 } }>General</Text>

            <SettingsItem icon='server' title='Domain URI' value={this.state.host} onPress={() => this.setState({ hostDialog: true })}>
              <Dialog.Container visible={ this.state.hostDialog } onBackdropPress={() => this.setState({ hostDialog: false })}>
                <Dialog.Title>Change Domain</Dialog.Title>
                <Dialog.Description>Enter the base URI, including protocol (http://), IP and port. Do not include the routes - the routes automatically used are /classify, /register, /login and /feedback.</Dialog.Description>
                <Dialog.Input 
                  autoCapitalize='none'
                  autoCorrect={ false }
                  underlineColorAndroid={'black'}
                  onChangeText={ host => this.setState({ host }) }
                >{ this.state.host }</Dialog.Input>
                <Dialog.Button label="Close" onPress={() => this.setState({ hostDialog: false })} />
                <Dialog.Button label="OK" onPress={this.setHost} />
              </Dialog.Container>
            </SettingsItem>

            {/* <SettingsItem title='Flash' value={'on'}></SettingsItem> */}
            <Text style={ styles.category }>Miscellaneous</Text>

            <SettingsItem icon='information-outline' title='About' value='v0.0.1' onPress={() => Alert.alert('nigga plz')}>
            
            </SettingsItem>


        </ScrollView>
      );
    }
  }

  
const styles = StyleSheet.create({
  shadow: {
    width: 300,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1
  },
  dialogOption: {
    padding: 20,
  },
    container: {
      flex: 1,
    },
    category: {
      paddingHorizontal: 25,
      paddingTop: 20,
      fontWeight: 'bold',
      borderTopWidth: 1,
      borderTopColor: '#bdbdbd',
      color: colorConstants.textPrimary
    }, 
    settingsItem: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      // alignItems: 'center',
      height: 75,
      // paddingVertical: 15,
      paddingHorizontal: 25,

  },
    settingsItemContainer: {
      flex: 1,
      flexDirection: 'row',
      alignContent: 'center',
      // backgroundColor: 'gray'
    },
    settingsItemTextContainer: {
      alignSelf: 'center',
      // paddingHorizontal: 7
    },

    settingsItemTitle: {
        // fontWeight: 'bold',
        // color: 'black',
        ...material.subheading,
        color: colorConstants.textSecondary,
        marginBottom: 2,
        paddingHorizontal: 10,
        
    },
    settingsItemValue: {
      paddingHorizontal: 10,
      color: colorConstants.textDisabled,
    }
  });
  