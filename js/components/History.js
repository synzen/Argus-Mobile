import React, { Component } from 'react'
import generalConstants from '../constants/general.js'
import Dialog from "react-native-dialog";
import keyHolder from '../constants/keys.js'
import FastImage from 'react-native-fast-image'
import RNFS from 'react-native-fs'
import {
  View,
  Text,
  AsyncStorage,
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
import axios from 'axios'
import schemas from '../constants/schemas.js'
import colorConstants from '../constants/colors.js'
import parseResponse from '../util/formatClassifyResponse.js'
import { Button, Card, Icon } from 'react-native-elements'
import ProgressBox from './UtilProgressBox.js'
import { material } from 'react-native-typography'
import Realm from 'realm'
import colors from '../constants/colors.js';
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
const windowDimensions = Dimensions.get('window')
const NUMBER_OF_TILES_PER_ROW = 3


function HistoryTile (props) {
  const imageSrc = props.data.image.base64 ? `data:image/jpg;base64,${props.data.image.base64}` : props.data.image.url

  return (
    <TouchableOpacity onPress={ () => props.navigate('DetailsScreen', props.data) } style={styles.historyTile}>
      { props.data.successful ? 
        undefined :
        <View style={styles.historyTileOverlay}>
          <Icon name='error' color={colorConstants.danger} style={styles.historyTileIcon}/>
        </View> 
      }
      <FastImage source={{ uri: imageSrc }} style={{ ...styles.historyTile, height: props.length, width: props.length, margin: props.margin / 2 }}/>
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
      if (!params) return null
      if (params.loggedOut === true) {
        console.log('logged out param true')
        return { items: [] }
      }
      if (!params.classifiedResults) return null
      const newItems = []
      for (const item of params.classifiedResults) {
        const exists = state.items.filter(existing => existing.id === item.id).length > 0
        if (exists === false) newItems.push(item)
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
          host: '',
          login: undefined,
          items: [],
          successfulItems: [],
          failedItems: [],
          realm: undefined,
          loading: true,
          showProgressBox: false,
          updating: false
        }

        // Add a 0 timeout to make this asynchronous for faster page load
        setTimeout(() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
          // Realm.deleteFile({ schema: schemas.all })
          AsyncStorage.multiGet(['login', 'host'])
          .then(items => {
            const loginStr = items[0][1]
            const host = items[1][1]
            if (!loginStr || !host) throw new Error('No login or host details')
            const login = JSON.parse(loginStr)
            this.setState({ login, host })
            return Realm.open({ schema: schemas.all })
          })
          .then(realm => {
            this.setState({ realm })
            // const aggregated = []
            const allObjects = realm.objects(schemas.ClassifiedResultSchema.name).filtered('user == $0', this.state.login.email).sorted('date')
            // const succeeded = allObjects.filtered('successful = true').sorted('date', true).values()
            // const failed = allObjects.filtered('successful = false').sorted('date', true).values()
            const allValues = allObjects.values()
            const stateItems = []
            let c = 0
            if (allObjects.length === 0) return this.setState({ loading: false })
            for (item of allValues) {
              const localItem = item // Specifically define it here so when the item is referred to in the process, the localItem is referred to rather than the changing item in the for loop (closures)
              if (!item.image.path) {
                const stateItem = { ...item }
                stateItems.push(stateItem)
                this.setState({ items: [ ...this.state.items, stateItem ], loading: false })
                continue
              }
              RNFS.readFile(item.image.path, 'base64')
              .then(data => {
                const stateItem = { ...localItem }
                stateItem.image.base64 = data
                stateItems.push(stateItem)
                this.setState({ items: [ ...this.state.items, stateItem ], loading: false })
              })
              .catch(err => {
                console.log(err)
                const stateItem = { ...localItem }
                stateItems.push(stateItem)
                this.setState({ items: [ ...this.state.items, stateItem ], loading: false })
              })
            }
          })
          .catch(err => {
            console.log(err)
            this.setState({ loading: false })
          })
        }, 0)
    }

    componentDidMount = () => {
      const navState = this.props.navigation.state
      if (!keyHolder.has(navState.routeName)) keyHolder.set(navState.routeName, navState.key)
      this.props.navigation.setParams({ purge: this.deleteItems, refresh: this.refreshItems })
    }
    
    componentDidUpdate = () => {
      const deleteItemId = this.props.navigation.state.params.deleteItemId
      if (!deleteItemId) return
      this.props.navigation.setParams({ deleteItemId: undefined })
      const realm = this.state.realm
      if (!this.state.realm) return
      this.setState({ updating: true })
      console.log('got delete request')
      axios.post(this.state.host + '/login', { username: this.state.login.email, password: this.state.login.password })
      .then(res => axios.post(this.state.host + '/delete', { id: deleteItemId }))
      .then(res => {
        const items = [ ...this.state.items ]
        realm.write(() => {
          realm.delete(realm.objects(schemas.ClassifiedResultSchema.name).filtered('id = $0', deleteItemId))
        })
        this.setState({ items: items.filter(item => item.id !== deleteItemId), updating: false })
      })
      .catch(err => {
        Alert.alert('Unable to Delete', err.response ? (err.response.data.msg || err.message) : err.message)
        this.setState({ updating: false })
      })
    }
    
    refreshItems = () => {
      if (!this.state.host || !this.state.login) return
      this.setState({ updating: true })
      axios.post(this.state.host + '/login', { username: this.state.login.email, password: this.state.login.password })
      .then(res => {
        const history = res.data.history
        const existingItems = this.state.items
        const newItems = []
        if (history.length === 0) this.deleteItems()
        else {
          for (const item of history) {
            const newItem = existingItems.filter(existing => existing.id === item.id).length === 0
            if (!newItem) continue
            item.image.sizeMB = (item.image.size / 1000).toFixed(2)
            item.image.url = this.state.host + '/' + item.image.url
            const formattedItem = {
              user: this.state.login.email,
              id: item.id,
              image: item.image,
              successful: true,
              date: parseResponse.parseDateString(item.dateCreated),
              classifications: item.predictions
            }
            newItems.push(formattedItem)
            const realm = this.state.realm
            realm.write(() => {
              realm.create(schemas.ClassifiedResultSchema.name, formattedItem)
            })
          }
        }
        this.setState({ updating: false })
        if (newItems.length > 0) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
          this.setState({ items: [ ...newItems,  ...this.state.items ] })
        }
      })
      .catch(err => {
        this.setState({ updating: false })
        Alert.alert('Unable to refresh', err.response ? err.response.data.msg : err.message)
        console.log(err)
      })
    }

    deleteItems = () => {
      if (!this.state.host || !this.state.login || this.state.items.length === 0) return
      const realm = this.state.realm
      const items = this.state.items
      if (!this.state.updating) this.setState({ updating: true })
      let completed = 0
      for (item of items) {
        const localItem = item
        axios.post(this.state.host + '/delete', { id: item.id })
        .then(res => {
          realm.write(() => {
            realm.delete(realm.objects(schemas.ClassifiedResultSchema.name).filtered('id = $0', localItem.id))
          })
          const currentItems = [ ...this.state.items ]
          this.setState({ items: currentItems.filter(item => item.id !== localItem.id) })
          if (++completed < items.length) return
          this.setState({ updating: false })
        })
        .catch(err => {
          if (err.response && err.response.status === 400) {
            realm.write(() => {
              realm.delete(realm.objects(schemas.ClassifiedResultSchema.name).filtered('id = $0', localItem.id))
            })
            const currentItems = [ ...this.state.items ]
            this.setState({ items: currentItems.filter(item => item.id !== localItem.id) })
          }
          if (++completed < items.length) return
          this.setState({ updating: false })
        })
      }
      // realm.write(() => {
      //   realm.delete(realm.objects(schemas.ClassifiedResultSchema.name))
      // })
    
      // Realm.deleteFile({ schema: schemas.all })
      // this.state.realm.close()
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      // this.setState({ items: [] })
    }

    render() {
      const succeeded = []
      let tempSuccess = []

      for (item of this.state.items) {
          if (tempSuccess.length < NUMBER_OF_TILES_PER_ROW) {
            tempSuccess.push(item)
          } else {
            succeeded.push(tempSuccess)
            tempSuccess = []
            tempSuccess.push(item)
          }
      }
      if (tempSuccess.length > 0) succeeded.push(tempSuccess)
      const progressBox = <ProgressBox animation='fade' shown={this.state.updating}>
        <Text style={styles.progressBoxText}>Updating...</Text>
      </ProgressBox>

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
            <View>
              {progressBox}
              <SectionList
                renderItem={ ({ item }) =>  <HistoryTileRow items={item} tileCount={NUMBER_OF_TILES_PER_ROW} navigate={this.props.navigation.navigate}></HistoryTileRow>}
                // renderSectionHeader={ ({ section }) => <Text style={ { ...material.subheading, ...styles.heading } }>{ section.key }</Text> }
                sections={[
                  { data: succeeded, key: 'Identified' },
                  // { data: failed, key: 'Failed' }
                ]}
                keyExtractor={ (item, index) => item[0].id + 'row'}
              />
            </View>
            :
            (<View styles={styles.container}>
              <Text style={styles.emptyText}>You have no history.</Text>
              {progressBox}
            </View>)
    }

  }

  
const styles = StyleSheet.create({
  progressBoxText: {
    ...material.subheading,
    color: colorConstants.textPrimary,
    alignSelf: 'center',
  },
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
  