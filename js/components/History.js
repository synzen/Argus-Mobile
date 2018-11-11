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
  Dimensions,
  Alert,
  FlatList,
  ScrollView,
  LayoutAnimation,
  Image
} from 'react-native';
import schemas from '../constants/schemas.js'
import colorConstants from '../constants/colors.js'
import { Button, Card } from 'react-native-elements'
import { material } from 'react-native-typography'
import Realm from 'realm'
const windowDimensions = Dimensions.get('window')

// class HistoryItem extends Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       showDialog: false,
//       bestMatchedDescription: ''
//     }

//     const classifications = this.props.classifications
//     if (!classifications) return

//     let maxScore = 0
//     classifications.forEach(item => {
//       if (item.score > maxScore) {
//         maxScore = item.score
//         this.state.bestMatchedDescription = item.description
//       }
//     })
//   }

//   _showErr = function () {
//     Alert.alert('Failed to Process', this.props.error || 'Unknown Error')
//   }

//   _boolToElem = b => b === true ? <Text style={styles.successColor}>{ this.state.bestMatchedDescription || 'Unknown Item' }</Text> : <Text style={styles.dangerColor}>Failed to Process</Text>

//   render () {
//     return (
//       <TouchableOpacity style={styles.historyItem} onPress={this.props.onPress}>
//         <FastImage style={styles.historyImage} source={{ uri: `data:image/jpg;base64,${this.props.image.base64}` }}/>
//         <Text style={styles.historyText}>{ this._boolToElem(this.props.success) } {`\n\n${this.props.date}`}</Text>
//       </TouchableOpacity>

//     )
//   }
// }
function HistoryTile (props) {
  return (
    <TouchableOpacity onPress={ () => props.navigate('DetailsScreen', props.data) }><FastImage source={{ uri: `data:image/jpg;base64,${props.data.image.base64}` }} style={{ ...styles.historyTile, height: props.length, width: props.length, margin: props.margin / 2 }}/></TouchableOpacity>
  )
}

class HistoryTileRow extends Component {
  constructor(props) {
    super(props)
    this.tileMargin = 2
    const centerHorizontalMargins = 2 * this.tileMargin * (this.props.tileCount - 1) 
    const outsideHorizontalMargins = this.tileMargin * 2
    this.tileLength = (windowDimensions.width - centerHorizontalMargins + outsideHorizontalMargins) / this.props.tileCount
    this.state = {

    }
  }

  render () {
    return (
      <View style={styles.historyTileRow}>
        {this.props.items.map(item => <HistoryTile key={item.id} length={this.tileLength} margin={this.tileMargin} data={item} navigate={this.props.navigate}/>)}
      </View>
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
          successfulItems: [],
          failedItems: [],
          realm: undefined
        }

        
        Realm.open({ schema: schemas.all })
        .then(realm => {
          const aggregated = []
          const succeeded = realm.objects(schemas.IdentifiedItemSchema.name).sorted('date', true).values()
          const failed = realm.objects(schemas.FailedIdentifiedItemSchema.name).sorted('date', true).values()
          for (s of succeeded) aggregated.push({ ...s, success: true })
          for (f of failed) aggregated.push({ ...f, success: false })     
          const succeededStateItems = []
          const stateItems = []
          const failedStateItems = []
          let c = 0
          for (item of aggregated) {
            const localItem = item // Specifically define it here so when the item is referred to in the process, the localItem is referred to rather than the changing item in the for loop (closures)
            RNFS.readFile(item.image.path, 'base64')
            .then(data => {
              const stateItem = { ...localItem }
              stateItem.image.base64 = data
              // if (localItem.success) succeededStateItems.push(stateItem)
              // else failedStateItems.push(stateItem)
              stateItems.push(stateItem)
              if (++c === aggregated.length) this.setState({ items: stateItems, realm})
            })
            .catch(err => {
              console.log(err)
              if (++c === aggregated.length) this.setState({ items: stateItems, realm })
            })
          }
        }).catch(console.log)
    }

    componentDidMount = () => {
      this.props.navigation.setParams({ purge: this.deleteItems })
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
      const succeeded = []
      let tempSuccess = []

      const failed = []
      let tempFailed = []

      for (item of this.state.items) {
        if (item.success) {
          if (tempSuccess.length < 4) {
            tempSuccess.push(item)
          } else {
            succeeded.push(tempSuccess)
            tempSuccess = []
            tempSuccess.push(item)
          }
        } else {
          if (tempFailed.length < 4) {
            tempFailed.push(item)
          } else {
            failed.push(tempFailed)
            tempFailed = []
            tempFailed.push(item)
          }
        }
      }
      if (tempSuccess.length > 0) succeeded.push(tempSuccess)
      if (tempFailed.length > 0) failed.push(tempFailed)


      return this.state.items.length > 0 ? 
            // <FlatList
            //   style={styles.container}
            //   data={rows}
            //   // renderItem={ ( {item} ) => 
            //   //   <View style={{marginBottom: 40}}><HistoryItem onPress={ () => this.showDetails(item) } key={item.id} { ...item} ></HistoryItem></View>
            //   // }
            //   // renderItem={ ( {item} ) => 
            //   //   <HistoryTile onPress={ () => this.showDetails(item) } key={item.id} { ...item} height={100} width={100} base64={item.image.base64} margin={2} ></HistoryTile>
            //   // }
            //   renderItem={ ( {item} ) => {
            //     return (<HistoryTileRow key={Math.random() + 'row'} items={item} tileCount={4}></HistoryTileRow>)
            //   }}
            //   keyExtractor={item => {
            //     const i = Math.random().toString()
            //     console.log(i)
            //     return item[0].id
            //   }}
            //   // ListFooterComponent= { () => <Button raised title='PURGE' backgroundColor={styles.dangerColor.color} onPress={this.deleteItems}></Button> }
            // />
            <ScrollView style={styles.container}>
              <Text style={ { ...material.subheading, ...styles.heading } }>Identified</Text>
              { succeeded.map(item => <HistoryTileRow key={item[0].id + 'row'} items={item} tileCount={4} navigate={this.props.navigation.navigate}></HistoryTileRow> ) }
              <Text style={ { ...material.subheading, ...styles.heading } }>Failed</Text>
              { failed.map(item => <HistoryTileRow key={item[0].id + 'roww'} items={item} tileCount={4} navigate={this.props.navigation.navigate}></HistoryTileRow> ) }

            </ScrollView>
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
    marginBottom: 50,
    marginTop: 10,
    overflow: 'scroll'
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
  historyTile: {
    
  },
  historyTileRow: {
    flex: 1,
    flexDirection: 'row'
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
  },
  heading: {
    margin: 10
  }
});
  