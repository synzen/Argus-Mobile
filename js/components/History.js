import React, { Component } from 'react'
import { Image } from 'react-native'
import Dialog from "react-native-dialog";
import FastImage from 'react-native-fast-image'
import RNFS from 'react-native-fs'

import {
    Text,
    TouchableOpacity,
    View,
    TextInput,
    ScrollView,
    StyleSheet,
  } from 'react-native';

class HistoryItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showDialog: false
    }
  }

  render () {
    return (
      <TouchableOpacity style={styles.historyItem} onPress={() => this.setState({ showDialog: true })}>
          <Dialog.Container visible={ this.state.showDialog }>
          <Dialog.Title>Details</Dialog.Title>
          <Dialog.Description>{`\nFile: ${this.props.name}\n\nLast Modified: ${this.props.mtime}\n\nSize: ${this.props.size}\n\nPath: ${this.props.path}`}</Dialog.Description>
          <Dialog.Button label="OK" onPress={ () => this.setState({ showDialog: false }) } />
        </Dialog.Container>
        <FastImage style={styles.historyImage} source={{ uri: 'https://cdn.dribbble.com/users/904380/screenshots/2233565/revised-google-logo.gif' }}/>
        <Text style={styles.historyText}>{`${this.props.name}\n${this.props.mtime}`}</Text>
      </TouchableOpacity>

    )
  }
}

export default class History extends Component {
    static navigationOptions = {
      title: 'History'
    };

    constructor(props) {
        super(props)
        this.state = {
          items: []
        }
        RNFS.readDir(RNFS.CachesDirectoryPath)
        .then(arr => RNFS.readDir(arr[0].path)) // Path to the directory containing cached images, usually path = "com.argus/cache/Camera"
        .then(arr => {
          // Each item keys are ctime, mtime, name, path, size, isFile, isDirectory
          const items = arr.map(item => {
            return { mtime: item.mtime, name: item.name, path: item.path, size: item.size }
          })
          this.setState({ items })
        })
    }

    render() {
      const { navigate } = this.props.navigation;
      return (
        <ScrollView style={ styles.container }>
          {
            this.state.items.map(item => <HistoryItem key={item.name} uri={item.path} mtime={ item.mtime } name={ item.name } path={ item.path } size={ item.size }></HistoryItem>)
          }
        </ScrollView>
      );
    }

  }

  
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column'
    },
    historyImage: {
      width: 75,
      height: 75,
      margin: 15
    },
    historyText: {
      flex: 1,
      margin: 15,
    },
    historyItem: {
      flex: 1,
      flexDirection: 'row',
      minHeight: 100,
      margin: 20,
      backgroundColor: '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 1,
      borderRadius: 2,
      borderColor: '#ddd',
      borderBottomWidth: 0,
    }
  });
  