import React, { Component } from 'react'
import Dialog from "react-native-dialog";
import {
    Text,
    TouchableOpacity,
    View,
    TextInput,
    StyleSheet,
  } from 'react-native';

export default class History extends Component {
    static navigationOptions = {
      title: 'History'
    };

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render() {
      const { navigate } = this.props.navigation;
      return (
        <View style={ styles.container }>

        </View>
      );
    }

  }

  
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column'
    }
  });
  