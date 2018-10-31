import React, { Component } from 'react'
import Dialog from "react-native-dialog";
import FastImage from 'react-native-fast-image'
import RNFS from 'react-native-fs'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AsyncStorage,
  Alert,
  FlatList,
  LayoutAnimation,
  Image
} from 'react-native';
import colorConstants from '../constants/colors.js'
import { Button, Card } from 'react-native-elements'

class HistoryItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showDialog: false,
      bestMatchedDescription: ''
    }

    const classifications = this.props.classifications
    if (!classifications) return

    let maxScore = 0
    classifications.forEach(item => {
      if (item.score > maxScore) {
        maxScore = item.score
        this.state.bestMatchedDescription = item.description
      }
    })
  }

  _showErr = function () {
    Alert.alert('Failed to Process', this.props.error || 'Unknown Error')
  }

  _boolToElem = b => b === true ? <Text style={styles.successColor}>{ this.state.bestMatchedDescription || 'Unknown Item' }</Text> : <Text style={styles.dangerColor}>Failed to Process</Text>

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
    }

    getImageSize = (path, callback) => {
      Image.getSize(path, (w, h) => callback(null, w, h), err => callback(err))
    }

    constructor(props) {
        super(props)
        this.state = {
          items: []
        }

        // console.log(RNFS.ExternalStorageDirectoryPath)
        AsyncStorage.getAllKeys()
        .then(keys => AsyncStorage.multiGet(keys.filter(word => word.startsWith('photo.')).reverse()))
        .then(results => {
          const resolvedItems = []
          let invalidItems = 0
          results.forEach(item => {
            const key = item[0]
            if (!item[1]) {
              AsyncStorage.removeItem(key).then(() => console.log('Removed broken key', key)).catch(err => console.log(`Unable to remove broken key`, key, err))
              return (++invalidItems + resolvedItems.length === results.length) ? this.setState({ items: resolvedItems }) : null
            }
            const jsonValue = JSON.parse(item[1])

            const itemObj = { name: key, base64: jsonValue.base64, mtime: jsonValue.date, ...jsonValue }
            this.getImageSize(`data:image/jpg;base64,${jsonValue.base64}`, (err, w, h) => {
              if (err) console.log(err)
              else {
                itemObj.width = w
                itemObj.height = h
              }
              resolvedItems.push(itemObj)
              if (resolvedItems.length === results.length) this.setState({ items: resolvedItems })
            })
          })
        }).catch(console.log)

        // RNFS.readDir(RNFS.CachesDirectoryPath)
        // .then(arr => {
        //   if (arr.length === 0) return
        //   return RNFS.readDir(arr[0].path) // Path to the directory containing cached images, usually path = "com.argus/cache/Camera"
        // }).then(arr => {
        //   if (arr.length === 0) return
        //   // Each item keys are ctime, mtime, name, path, size, isFile, isDirectory
        //   const resolvedItems = []
        //   const items = arr.reverse().map(item => {
        //     // Read the image and convert it to base64
        //     RNFS.readFile(item.path, 'base64').then(data => {

        //       // Get the app's object/response/classification for the image
        //       AsyncStorage.getItem('file://' + item.path).then(appObjectStr => {
        //         const returnObj = { mtime: item.mtime, name: item.name, path: item.path, size: item.size, base64: data, ...JSON.parse(appObjectStr) }
        //         this.getImageSize(`data:image/jpg;base64,${data}`, (err, w, h) => {
        //           if (err) console.log(err)
        //           else {
        //             returnObj.width = w
        //             returnObj.height = h
        //           }
        //           resolvedItems.push(returnObj)
        //           if (resolvedItems.length === arr.length) this.setState({ items: resolvedItems })
        //         })
        //       }).catch(err => {
        //         // No status of the image is available the app's storage
        //         const returnObj = { mtime: item.mtime, name: item.name, path: item.path, size: item.size, base64: data }
        //         this.getImageSize(`data:image/jpg;base64,${data}`, (err, w, h) => {
        //           if (err) console.log(err)
        //           else {
        //             returnObj.width = w
        //             returnObj.height = h
        //           }
        //           resolvedItems.push(returnObj)
        //           if (resolvedItems.length === arr.length) this.setState({ items: resolvedItems })
        //         })
        //       })

        //     }).catch(console.log)
        //   })
        // }).catch(console.log)
    }
    
    showDetails = function (item) {
      this.props.navigation.navigate('DetailsScreen', item)
    }

    deleteItems = () => {
      AsyncStorage.getAllKeys()
      .then(keys => AsyncStorage.multiRemove(keys.filter(word => word.startsWith('photo.'))))
      .then(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ items: [] })
      })
      .catch(console.log)
    }

    render() {
      return this.state.items.length > 0 ? 
            <FlatList
              style={styles.container}
              data={this.state.items}
              renderItem={ ( {item} ) => 
                <View style={{marginBottom: 40}}><HistoryItem onPress={ () => this.showDetails(item) } key={item.name} { ...item} ></HistoryItem></View>
              }
              keyExtractor={ item => item.name }
              ListFooterComponent= { () => <Button raised title='PURGE' backgroundColor={styles.dangerColor.color} onPress={this.deleteItems}></Button> }
            />
            // this.state.items.map(item => <HistoryItem onPress={ () => this.onPress(item) } key={item.name} { ...item} ></HistoryItem>) 
            :
            (<View styles={styles.container}>
              <Text style={styles.emptyText}>You have no recent history.</Text>
            </View>)

      
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
    // flexDirection: 'column',
    paddingTop: 20,
    paddingBottom: 50
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
    marginVertical: 0,
    marginHorizontal: 20,
    backgroundColor: colorConstants.headerBackgroundColorVeryVeryLight,
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
  