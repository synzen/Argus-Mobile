import React, { Component } from 'react'
import Dialog from "react-native-dialog";
import {
    Text,
    TouchableOpacity,
    View,
    TextInput,
    StyleSheet,
  } from 'react-native';

export default class HomeScreen extends Component {
    static navigationOptions = {
      title: 'ARGUS',
    };

    constructor(props) {
        super(props)
        this.state = {
            showDialog: false,
            unsavedText: '',
            host: ''
        }
    }

    render() {
      const { navigate } = this.props.navigation;
      return (
        <View style={ styles.container }>
            <Dialog.Container visible={ this.state.showDialog }>
            <Dialog.Title>Change Host</Dialog.Title>
            <Dialog.Description>Enter the full URI, including protocol (http://), IP and port.</Dialog.Description>
            <Dialog.Input 
              autoCapitalize='none'
              autoCorrect={ false }
              underlineColorAndroid={'black'}
              onChangeText={ text => this.setState({ unsavedText: text }) }
            >{ this.state.host }</Dialog.Input>
            <Dialog.Button label="Close" onPress={ this.closeDialog.bind(this) } />
            <Dialog.Button label="OK" onPress={ this.submitDialog.bind(this) } />
          </Dialog.Container>
            <View style={ styles.subcontainer}>
                <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Host</Text>
                <TextInput style={ styles.textAlignCenter } editable={ false } value={ this.state.host ? this.state.host : 'Specify host' } />
                <TouchableOpacity
                    onPress={this.showDialog.bind(this)}
                    style={styles.button}
                ><Text>Change Host</Text></TouchableOpacity>
                <TouchableOpacity
                    onPress={() =>
                        this.props.navigation.navigate('Camera', { host: this.state.host })
                    }
                    style={styles.button}
                ><Text>Camera</Text></TouchableOpacity>
            </View>
        </View>
      );
    }

    closeDialog = function () {
        this.setState({ showDialog: false })
    }

    showDialog = function () {
        this.setState({ showDialog: true })
    }

    submitDialog = function () {
        this.closeDialog()
        this.setState({ host: this.state.unsavedText })
    }
  }

  
const styles = StyleSheet.create({
    textAlignCenter: { textAlign: 'center' },
    button: {
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        padding: 10,
        margin: 10
    }, 
    container: {
      flex: 1,
      flexDirection: 'column'
    },
    subcontainer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    //   aspectRatio: 1,
    //   width: 100,
    //   alignItems: 'center',
      marginRight: 50,
      marginLeft: 50
    //   width: .8
    },
    capture: {
      flex: 0,
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 15,
      paddingHorizontal: 20,
      alignSelf: 'center',
      margin: 20
    }
  });
  