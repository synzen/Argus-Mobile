import React, { Component } from 'react'
import generalConstants from '../constants/general.js'
import Dialog from "react-native-dialog";
import keyHolder from '../constants/keys.js'
import FastImage from 'react-native-fast-image'
import RNFS from 'react-native-fs'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  FlatList,
  SectionList,
  ScrollView,
  UIManager,
  LayoutAnimation
} from 'react-native';
import schemas from '../constants/schemas.js'
import colorConstants from '../constants/colors.js'
import { Button, Card, Icon } from 'react-native-elements'
import { material } from 'react-native-typography'
import Realm from 'realm'
import colors from '../constants/colors.js';
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
const windowDimensions = Dimensions.get('window')
const NUMBER_OF_TILES_PER_ROW = 3


function HistoryTile (props) {
  return (
    <TouchableOpacity onPress={ () => props.navigate('DetailsScreen', props.data) } style={styles.historyTile}>
      { props.data.success ? 
        undefined :
        <View style={styles.historyTileOverlay}>
          <Icon name='error' color={colorConstants.danger} style={styles.historyTileIcon}/>
        </View> 
      }
      <FastImage source={{ uri: `data:image/jpg;base64,${props.data.image.base64}` }} style={{ ...styles.historyTile, height: props.length, width: props.length, margin: props.margin / 2 }}/>
    </TouchableOpacity>
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
        {this.props.items.map(item => {
        return (<HistoryTile key={item.id} length={this.tileLength} margin={this.tileMargin} data={item} navigate={this.props.navigate}/>)
      })}
      </View>
    )
  }
}

export default class History extends Component {
    static navigationOptions = {
      title: 'History'
    }

    static getDerivedStateFromProps(nextProps, state) {
      const params = nextProps.navigation.state.params
      if (!params || !params.classifiedResults) return null
      const newItems = []
      for (const item of params.classifiedResults) {
        let exists = false
        for (const existingItem of state.items) {
          if (existingItem.id === item.id) exists = true
        }
        if (exists === false) {
          item.success = true
          newItems.push(item)
        }
      }
      if (newItems) {
        return {
          items: [ ...newItems, ...state.items ]
        }
      } else return null
    }

    constructor(props) {
        super(props)
        this.state = {
          items: [],
          successfulItems: [],
          failedItems: [],
          realm: undefined,
          loading: true
        }

        // Add a 0 timeout to make this asynchronous for faster page load
        setTimeout(() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
          // Realm.deleteFile({ schema: schemas.all })
          Realm.open({ schema: schemas.all })
          .then(realm => {
            this.setState({ realm })
            const aggregated = []
            const succeeded = realm.objects(schemas.IdentifiedItemSchema.name).sorted('date', true).values()
            const failed = realm.objects(schemas.FailedIdentifiedItemSchema.name).sorted('date', true).values()
            for (s of succeeded) aggregated.push({ ...s, success: true })
            for (f of failed) aggregated.push({ ...f, success: false })
            const succeededStateItems = []
            const stateItems = []
            const failedStateItems = []
            let c = 0
            if (aggregated.length === 0) return this.setState({ loading: false })
            for (item of aggregated) {
              const localItem = item // Specifically define it here so when the item is referred to in the process, the localItem is referred to rather than the changing item in the for loop (closures)
              RNFS.readFile(item.image.path, 'base64')
              .then(data => {
                const stateItem = { ...localItem }
                stateItem.image.base64 = data
                stateItems.push(stateItem)
                // this.setState({ items: [ ...this.state.items, stateItem ], loading: false })
                if (++c === aggregated.length) this.setState({ items: stateItems, realm, loading: false })
              })
              .catch(err => {
                console.log(err)
                // if (this.state.loading) this.setState({ loading: false })
                if (++c === aggregated.length) this.setState({ items: stateItems, realm, loading: false })
              })
            }
          })
          .catch(console.log)
        }, 0)
    }

    componentDidMount = () => {
      const navState = this.props.navigation.state
      if (!keyHolder.has(navState.routeName)) keyHolder.set(navState.routeName, navState.key)
      this.props.navigation.setParams({ purge: this.deleteItems })
    }

    deleteItems = () => {
      Realm.deleteFile({ schema: schemas.all })
      this.state.realm.close()
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      this.setState({ items: [] })
      
    }

    render() {
      const succeeded = []
      let tempSuccess = []

      // const failed = []
      // let tempFailed = []
      for (item of this.state.items) {
        // if (item.success) {
          if (tempSuccess.length < NUMBER_OF_TILES_PER_ROW) {
            tempSuccess.push(item)
          } else {
            succeeded.push(tempSuccess)
            tempSuccess = []
            tempSuccess.push(item)
          }
        // } else {
        //   if (tempFailed.length < 4) {
        //     tempFailed.push(item)
        //   } else {
        //     failed.push(tempFailed)
        //     tempFailed = []
        //     tempFailed.push(item)
        //   }
        // }
      }
      if (tempSuccess.length > 0) succeeded.push(tempSuccess)
      // if (tempFailed.length > 0) failed.push(tempFailed)

      return this.state.loading ?
        <View style={styles.loadingView}><ActivityIndicator size='large' color={colorConstants.blue}/></View>
        :
        this.state.items.length > 0 ? 
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
            // <ScrollView style={styles.container}>
            //   <Text style={ { ...material.subheading, ...styles.heading } }>Identified</Text>
            //   { succeeded.map(item => <HistoryTileRow key={item[0].id + 'row'} items={item} tileCount={4} navigate={this.props.navigation.navigate}></HistoryTileRow> ) }
            //   <Text style={ { ...material.subheading, ...styles.heading } }>Failed</Text>
            //   { failed.map(item => <HistoryTileRow key={item[0].id + 'roww'} items={item} tileCount={4} navigate={this.props.navigation.navigate}></HistoryTileRow> ) }

            // </ScrollView>
            <SectionList
              renderItem={ ({ item }) =>  <HistoryTileRow items={item} tileCount={NUMBER_OF_TILES_PER_ROW} navigate={this.props.navigation.navigate}></HistoryTileRow>}
              // renderSectionHeader={ ({ section }) => <Text style={ { ...material.subheading, ...styles.heading } }>{ section.key }</Text> }
              sections={[
                { data: succeeded, key: 'Identified' },
                // { data: failed, key: 'Failed' }
              ]}
              keyExtractor={ (item, index) => item[0].id + 'row'}
            />
            :
            (<View styles={styles.container}>
              <Text style={styles.emptyText}>You have no recent history.</Text>
            </View>)
    }

  }

  
const styles = StyleSheet.create({
  loadingView: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center'
  },
  dangerColor: {
    color: colors.gray
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
    position: 'relative'
  },
  historyTileOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 100
  },
  historyTileIcon: {
    padding: 20
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
    color: colorConstants.textPrimary,
    margin: 30
  },
  heading: {
    margin: 10,
    color: colorConstants.headerTextColor
  }
});
  