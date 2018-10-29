import React, { Component } from 'react'
import { Alert, AsyncStorage } from 'react-native'
import Dialog from "react-native-dialog";
import FastImage from 'react-native-fast-image'
import RNFS from 'react-native-fs'

import {
    Text,
    TouchableOpacity,
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

  _showErr = function () {
    Alert.alert('Failed to Process', this.props.error || 'Unknown Error')
  }

  _boolToElem = b => b === true ? <Text style={styles.successColor}>Successfully Processed</Text> : b === false ? <Text style={styles.dangerColor}>Failed to Process</Text> : <Text>Unknown</Text>

  render () {
    // console.log(this.props)
    return (
      <TouchableOpacity style={styles.historyItem} onPress={this.props.onPress}>
          <Dialog.Container visible={ this.state.showDialog }>
          <Dialog.Title>Details</Dialog.Title>
          <Dialog.Description>{`\nFile: ${this.props.name}\n\nLast Modified: ${this.props.mtime}\n\nSize: ${this.props.size}\n\nPath: ${this.props.path}`}</Dialog.Description>
          <Dialog.Button label="OK" onPress={ () => this.setState({ showDialog: false }) } />
        </Dialog.Container>
        <FastImage style={styles.historyImage} source={{ uri: `data:image/jpg;base64,${this.props.base64}` }}/>
        <Text style={styles.historyText}>{ this._boolToElem(this.props.success) } {`\n\n${this.props.mtime}`}</Text>
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
        .then(arr => {
          if (arr.length === 0) return
          return RNFS.readDir(arr[0].path) // Path to the directory containing cached images, usually path = "com.argus/cache/Camera"
        }).then(arr => {
          if (arr.length === 0) return
          // Each item keys are ctime, mtime, name, path, size, isFile, isDirectory
          const resolvedItems = []
          const items = arr.reverse().map(item => {
            // Read the image and convert it to base64
            RNFS.readFile(item.path, 'base64').then(data => {
              // Get the app's object/response/classification for the image
              AsyncStorage.getItem('file://' + item.path).then(appObjectStr => {
                resolvedItems.push({ mtime: item.mtime, name: item.name, path: item.path, size: item.size, base64: data, ...JSON.parse(appObjectStr) })
                // console.log({ mtime: item.mtime, name: item.name, path: item.path, size: item.size, base64: data, status: JSON.parse(appObjectStr) })
                if (resolvedItems.length === arr.length) this.setState({ items: resolvedItems })
              }).catch(err => {
                // No status of the image is available the app's storage
                resolvedItems.push({ mtime: item.mtime, name: item.name, path: item.path, size: item.size, base64: data })
                if (resolvedItems.length === arr.length) this.setState({ items: resolvedItems })
              })

            }).catch(console.log)
          })
        }).catch(console.log)
    }
    
    onPress = function (item) {
      this.props.navigation.navigate('DetailsScreen', item)
    }

    render() {
      return (
        <ScrollView style={ styles.container }>
          {
            this.state.items.length > 0 ? 
            this.state.items.map(item => <HistoryItem onPress={ () => this.onPress(item) } key={item.name} { ...item} ></HistoryItem>) 
            :
            <Text style={styles.emptyText}>You have no recent history.</Text>

          }
        </ScrollView>
      );
    }

  }

  
const styles = StyleSheet.create({
  dangerColor: {
    color: '#b00020'
  },
  successColor: {
    color: '#007E33'
  },  
  container: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 20,
    marginBottom: 20
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
    marginVertical: 7,
    marginHorizontal: 20,
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
  },
  emptyText: {
    alignSelf: 'center',
    margin: 30
  }
});
  