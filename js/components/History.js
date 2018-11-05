import React, { Component } from 'react'
import generalConstants from '../constants/general.js'
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
import schemas from '../constants/schemas.js'
import colorConstants from '../constants/colors.js'
import { Button, Card } from 'react-native-elements'
import Realm from 'realm'

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
    return (
      <TouchableOpacity style={styles.historyItem} onPress={this.props.onPress}>
        <FastImage style={styles.historyImage} source={{ uri: `data:image/jpg;base64,${this.props.image.base64}` }}/>
        <Text style={styles.historyText}>{ this._boolToElem(this.props.success) } {`\n\n${this.props.date}`}</Text>
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
          items: [],
          realm: undefined
        }

        
        Realm.open({ schema: schemas.all })
        .then(realm => {
          const aggregated = []
          const succeeded = realm.objects(schemas.IdentifiedItemSchema.name).sorted('date', true).values()
          const failed = realm.objects(schemas.FailedIdentifiedItemSchema.name).sorted('date', true).values()
          for (s of succeeded) aggregated.push({ ...s, success: true })
          for (f of failed) aggregated.push(f)     
          const stateItems = []
          let c = 0
          for (item of aggregated) {
            const localItem = item // Specifically define it here so when the item is referred to in the process, the localItem is referred to rather than the changing item in the for loop (closures)
            RNFS.readFile(item.image.path, 'base64')
            .then(data => {
              const stateItem = { ...localItem }
              stateItem.image.base64 = data
              stateItems.push(stateItem)
              if (++c === aggregated.length) this.setState({ items: stateItems, realm })
            })
            .catch(err => {
              console.log(err)
              if (++c === aggregated.length) this.setState({ items: stateItems, realm })
            })
          }
        }).catch(console.log)
    }
    
    showDetails = item => {
      this.props.navigation.navigate('DetailsScreen', item)
    }

    deleteItems = () => {
      RNFS.unlink(generalConstants.photoDirectory)
      .then(() => {
        Realm.deleteFile({ schema: schemas.all })
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.state.realm.close()
        this.setState({ items: [] })
      })
      .catch(err => {
        console.log(err)
        Alert.alert(err.message)
      })
      
    }

    render() {
      return this.state.items.length > 0 ? 
            <FlatList
              style={styles.container}
              data={this.state.items}
              renderItem={ ( {item} ) => 
                <View style={{marginBottom: 40}}><HistoryItem onPress={ () => this.showDetails(item) } key={item.id} { ...item} ></HistoryItem></View>
              }
              keyExtractor={ item => item.id }
              ListFooterComponent= { () => <Button raised title='PURGE' backgroundColor={styles.dangerColor.color} onPress={this.deleteItems}></Button> }
            />
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
  