import React, { Component, useState, useEffect } from 'react'
import keyHolder from '../constants/keys.js'
import {
    Text,
    TouchableOpacity,
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    AsyncStorage,
    Alert
} from 'react-native';
import { Card, Icon, Button } from 'react-native-elements'
import generalState from '../constants/state.js'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import AntIcon from 'react-native-vector-icons/AntDesign'
import colorConstants from '../constants/colors.js'
import { PieChart } from 'react-native-svg-charts'

class ServerStatusCard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            serverStatus: 0, // 0 = pending, 1 = success, 2 = warning, 3 = failed
            serverStatusMessage: '',
            host: ''
        }
    }

    componentWillUnmount = function () {
        this.unmounted = true // This must be changed to be non-antipattern
    }

    componentDidMount = function () {
        this.tryConnection()
    }

    tryConnection = () => {
        this.setState({ serverStatus: 0 })

        AsyncStorage.getItem('host')
        .then(host => {
            if (!host) {
                if (!this.unmounted) {
                    this.setState({ serverStatus: 2})
                    generalState.serverStatus = 2
                }
            }
            if (host === this.state.host) {
                const origWs = generalState.getWebsocket()
                if (origWs && origWs.readyState === 1) return this.setState({ serverStatus: 1 })
                else if (origWs)  origWs.close()
            }
            const newWs = new WebSocket(`ws://${host.replace('http://', '')}/ws`)
            console.log(`ws://${host.replace('http://')}/ws`)
            newWs.onopen = () => {
                console.log('websocket open')
                newWs.send('a message')
                generalState.serverStatus = 1
                generalState.setWebsocket(newWs)
                if (!this.unmounted) {
                    // const interval = setInterval(() => {
                    //     newWs.send('ping')
                    // })
                    this.setState({ serverStatus: 1 })
                }
            }

            newWs.onmessage = event => {
                console.log(event.data)
                Alert.alert('A message from your god', event.data)
            }
    
            newWs.onerror = e => {
                console.log('websocket error')
                if (!this.unmounted) this.setState({ serverStatus: 3, serverStatusMessage: `Websocket Error` })
                generalState.serverStatus = 3
            }

        })
        .catch(err => {
            console.log(err)
            Alert.alert('Error', err.message)
            if (!this.unmounted) {
                this.setState({ serverStatus: 2})
                generalState.serverStatus = 2
            }
        })
    }

    render () {
        const serverStatusIcon = this.state.serverStatus === 0 ? <AntIcon name='ellipsis1' size={70} color='white'/> : this.state.serverStatus === 1 ? <MaterialIcon name='check-circle' size={70} color={colorConstants.success}/> : this.state.serverStatus === 2 ? <MaterialIcon name='warning' size={70} color={colorConstants.warning}/> : <MaterialIcon name='error' size={70} color={colorConstants.danger}/>
        const serverStatusHeaderText = this.state.serverStatus === 0 ? 'Testing connection...' : this.state.serverStatus === 1 ? 'Online' : this.state.serverStatus === 2 ? 'No Host' : 'Offline'
        const serverStatusDescriptionText = this.state.serverStatus === 0 ? 'Please wait for connection results.' : this.state.serverStatus === 1 ? 'All functions fully operational.' : this.state.serverStatus === 2 ? 'No host has been specified in settings.' : 'Our monkeys have been dispatched fix this ASAP!'

        return (
            <Card title='Server Status' containerStyle={styles.cardContainer} titleStyle={{color:'white'}}>
                <View style={styles.statusContainer}>
                    { serverStatusIcon }
                    <View style={styles.statusTextContainer}>
                        <Text style={styles.statusHeaderText}>{serverStatusHeaderText}</Text>
                        <Text style={styles.statusDescriptionText}>{serverStatusDescriptionText}</Text>
                    </View>
                </View>
                { this.state.serverStatus > 1 ? <Button title='Retry' onPress={this.tryConnection} backgroundColor={colorConstants.headerBackgroundColorVeryLight} containerViewStyle={styles.refreshButtonContainer} /> : undefined }
            </Card>
        )
    }
}

class PhotoStorageCard extends Component {
    constructor(props) {
        super(props)

        this.state = {

        }
    }

    render () {

        return (
            <Card title='Photos Stored' containerStyle={{ ...styles.cardContainer, marginBottom: 20 }} titleStyle={{color: 'white'}}>
                <PieChart startAngle={Math.PI * 2} endAngle={0} data={[ { value: .1, key: '1', svg: { fill: colorConstants.blue } }, { value: .9, key: '2', svg: { fill: colorConstants.headerBackgroundColorVeryLight } } ]} style={{ height: 125 }} />
            </Card>
        )
    }
}

export default class DashboardScreen extends Component {
    static navigationOptions = {
      title: 'Dashboard'
    };

    constructor(props) {
        super(props)
    }

    componentDidMount = function () {
        const navState = this.props.navigation.state
        keyHolder.set(navState.routeName, navState.key)
    }

    render() {
        const { navigate } = this.props.navigation

      return (
        <ScrollView style={ styles.container }>
            <ServerStatusCard />
            <Card title='Tokens Available' containerStyle={styles.cardContainer} titleStyle={{color: 'white'}}>
                <View style={styles.tokensContainer}>
                    <Text style={styles.tokensText}>1000</Text>
                    <TouchableOpacity style={styles.tokensButtonTouchable} onPress={() => Alert.alert('', 'no', [{text: ':('}])}>
                        <Icon raised name='add' size={20} containerStyle={{backgroundColor: colorConstants.headerBackgroundColorVeryLight}} color='white' />
                    </TouchableOpacity>
                </View>
            </Card>
            <PhotoStorageCard />

            
        </ScrollView>
      );
    }
  }

  
const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: colorConstants.headerBackgroundColorLight,
        padding: 10,
        margin: 10
    },
    container: {

    },
    cardContainer: {
        backgroundColor: colorConstants.headerBackgroundColorLight,
        borderColor: colorConstants.headerBackgroundColorLight
    },
    refreshButtonContainer: {
        width: '100%',
        marginLeft: 0,
        marginTop: 15
    },
    tokensContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tokensText: {
        color: colorConstants.textPrimary,
        alignSelf: 'center',
        fontSize: 50
    },
    tokensButtonTouchable: {
        position: 'absolute',
        right: 0
    },
    statusContainer: {
        flexDirection: 'row'
    },
    statusTextContainer: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-evenly'
    },
    statusHeaderText: {
        color: colorConstants.textSecondary,
        fontWeight: 'bold'
    },
    statusDescriptionText: {
        color: colorConstants.textDisabled,
        // marginTop: 15
    },
    photoStorageCenterText: {
        position: 'absolute',
        justifyContent: 'center'
    }
  });
  