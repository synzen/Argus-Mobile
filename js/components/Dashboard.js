import React, { Component, useState, useEffect } from 'react'
import keyHolder from '../constants/keys.js'
import {
    Text,
    TouchableOpacity,
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    AsyncStorage,
    UIManager,
    StatusBar,
    LayoutAnimation,
    Alert
} from 'react-native';
import { Card, Icon, Button } from 'react-native-elements'
import generalState from '../constants/state.js'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import AntIcon from 'react-native-vector-icons/AntDesign'
import colorConstants from '../constants/colors.js'
import { PieChart } from 'react-native-svg-charts'
import schemas from '../constants/schemas.js'
import axios from 'axios'
import Realm from 'realm'
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

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
        this.tryConnection(true)
    }

    tryConnection = skipInitialLayoutAnim => {
        if (this.state.serverStatus !== 0) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            this.setState({ serverStatus: 0 })
        }

        AsyncStorage.getItem('host')
        .then(host => {
            if (!host) {
                if (!this.unmounted) {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                    this.setState({ serverStatus: 2})
                    generalState.serverStatus = 2
                }
                return
            }
            if (host === this.state.host) {
                const origWs = generalState.getWebsocket()
                if (origWs && origWs.readyState === 1) {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                    return this.setState({ serverStatus: 1 })
                } else if (origWs)  origWs.close() 
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
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                    this.setState({ serverStatus: 1 })
                }
            }

            newWs.onmessage = event => {
                console.log(event.data)
                // Alert.alert('A message from your god', event.data)
            }
    
            newWs.onerror = e => {
                console.log('websocket error')
                if (!this.unmounted) {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                    this.setState({ serverStatus: 3, serverStatusMessage: `Websocket Error` })
                }
                generalState.serverStatus = 3
            }

        })
        .catch(err => {
            console.log(err)
            Alert.alert('Error', err.message)
            if (!this.unmounted) {
                // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                this.setState({ serverStatus: 2})
                generalState.serverStatus = 2
            }
        })
    }

    render () {
        const serverStatusIcon = this.state.serverStatus === 0 ? <AntIcon name='ellipsis1' size={70} color='white'/> : this.state.serverStatus === 1 ? <MaterialIcon name='check-circle' size={70} color={colorConstants.success}/> : this.state.serverStatus === 2 ? <MaterialIcon name='warning' size={70} color={colorConstants.warning}/> : <MaterialIcon name='error' size={70} color={colorConstants.danger}/>
        const serverStatusHeaderText = this.state.serverStatus === 0 ? 'Testing connection...' : this.state.serverStatus === 1 ? 'Online' : this.state.serverStatus === 2 ? 'No Host' : 'Offline'
        const serverStatusDescriptionText = this.state.serverStatus === 0 ? 'Please wait for connection results.' : this.state.serverStatus === 1 ? 'All functions fully operational.' : this.state.serverStatus === 2 ? 'No host has been specified in settings.' : 'Our monkeys have been dispatched to fix this ASAP!'

        return (
            <Card title='Server Status' containerStyle={styles.cardContainer} titleStyle={{color:'white'}}>
                <View style={styles.statusContainer}>
                    { serverStatusIcon }
                    <View style={styles.statusTextContainer}>
                        <Text style={styles.statusHeaderText}>{serverStatusHeaderText}</Text>
                        <Text style={styles.statusDescriptionText}>{serverStatusDescriptionText}</Text>
                    </View>
                </View>
                { this.state.serverStatus > 1 ? <Button title='Retry' onPress={() => this.tryConnection()} backgroundColor={colorConstants.headerBackgroundColorVeryLight} containerViewStyle={styles.refreshButtonContainer} /> : undefined }
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
                { this.props.imagesStored > -1 ? 
                    <Text style={styles.tokensText}>{this.props.imagesStored}</Text> :
                    <ActivityIndicator size='large' color={colorConstants.headerBackgroundColorVeryVeryLight}/>
                }
                {/* <PieChart startAngle={Math.PI * 2} endAngle={0} data={[ { value: .1, key: '1', svg: { fill: colorConstants.blue } }, { value: .9, key: '2', svg: { fill: colorConstants.headerBackgroundColorVeryLight } } ]} style={{ height: 125 }} /> */}
            </Card>
        )
    }
}

class CreditsCard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            refilling: false
        }
    }

    refill = async () => {
        try {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            this.setState({ refilling: true })
            await axios.post(`${this.props.host}/login`, {
                username: this.props.login.email,
                password: this.props.login.password
            })
            const { data } = await axios.post(`${this.props.host}/refill`)
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            this.props.updateCredits(data.credits)
        } catch (err) {
            console.log(err)
            Alert.alert('Error', err.response ? (err.response.data.msg || err.message) : err.message)
        }
        this.setState({ refilling: false })
    }

    render = function () {
        return (
            <Card title='Tokens Available' containerStyle={styles.cardContainer} titleStyle={{color: 'white'}}>
                <View style={styles.tokensContainer}>
                    <Text style={styles.tokensText}>{this.state.refilling ? '...' : this.props.credits}</Text>
                    { this.state.refilling ? null : 
                        <TouchableOpacity style={styles.tokensButtonTouchable} onPress={this.refill}>
                            <Icon raised name='add' size={20} containerStyle={{backgroundColor: colorConstants.headerBackgroundColorVeryLight}} color='white' />
                        </TouchableOpacity>
                    }
                </View>
            </Card>
        )
    }
}

export default class DashboardScreen extends Component {
    static navigationOptions = {
      title: 'Dashboard'
    };

    static READY_STATES = {
        LOADING: 0,
        LOGGED_IN: 1,
        LOGGED_OUT: 2,
        ERROR: 3
    }

    static getDerivedStateFromProps(nextProps, state) {
        const params = nextProps.navigation.state.params
        console.log(params)
        if (!params) return null
        if (params.email === '') {
            // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            return { email: '', password: '', readyState: DashboardScreen.READY_STATES.LOGGED_OUT }
        }
        const toReturn = {}
        if (params.email && state.email !== params.email) toReturn.email = params.email
        if (params.password && state.password !== params.password) toReturn.password = params.password
        if (params.credits && state.credits !== params.credits) toReturn.credits = params.credits
        if (params.imagesStored && state.imagesStored !== params.imagesStored) toReturn.imagesStored = params.imagesStored
        if (Object.keys(toReturn).length === 0) return null
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        return { ...toReturn, readyState: DashboardScreen.READY_STATES.LOGGED_IN }
    }

    constructor(props) {
        super(props)
        this.state = {
            host: '',
            login: {},
            imagesStored: 0,
            credits: 0,
            readyState: DashboardScreen.READY_STATES.LOADING,
            errorMessage: ''
        }
        // Realm.deleteFile({ schema: schemas.all })
        setTimeout(() => {
            Realm.open({ schema: schemas.all })
            .then(realm => {
                const allObjects = realm.objects(schemas.ClassifiedResultSchema.name)
                this.setState({ imagesStored: allObjects.length })
            })
            .catch(console.log)

        })
    }

    componentDidMount = async function () {
        // return
        const navState = this.props.navigation.state
        keyHolder.set(navState.routeName, navState.key)
        try {
            const items = await AsyncStorage.multiGet(['login', 'host'])
            const login = items[0][1]
            const host = items[1][1]

            if (!login || !host) return this.setState({ host, readyState: DashboardScreen.READY_STATES.LOGGED_OUT })
            const loginParsed = JSON.parse(login)
            loginParsed.username = loginParsed.email
            const res = await axios.post(host + '/login', loginParsed, { validateStatus: () => true })
            const data = res.data
            if (res.status !== 200) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                return this.setState({ host, readyState: DashboardScreen.READY_STATES.ERROR, errorMessage: data.msg, login: loginParsed })
            }
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
            this.setState({ host, imagesStored: data.history.length, credits: data.credits, readyState: DashboardScreen.READY_STATES.LOGGED_IN, login: loginParsed })
        } catch (err) {
            console.log('Failed to get login details', err)
            this.setState({ readyState: DashboardScreen.READY_STATES.ERROR, errorMessage: err.message })
        }

    }

    render() {
        const { navigate } = this.props.navigation

        return (
        <ScrollView style={ styles.container }>
                <StatusBar backgroundColor='black' />

            <ServerStatusCard />
            { this.state.readyState === DashboardScreen.READY_STATES.LOADING ? <Text style={styles.loadingText}> Loading...</Text> :
            this.state.readyState === DashboardScreen.READY_STATES.LOGGED_OUT ? <Text style={styles.loadingText}>please login</Text> :
            this.state.readyState === DashboardScreen.READY_STATES.LOGGED_IN ?
                <View>
                    <CreditsCard credits={this.state.credits} updateCredits={credits => this.setState({ credits })} host={this.state.host} login={this.state.login}/>
                    <PhotoStorageCard imagesStored={this.state.imagesStored} />
                </View>
                : <Text style={styles.loadingText}>{this.state.errorMessage}</Text> }
        </ScrollView>
      )
    }
  }

  
const styles = StyleSheet.create({
    loadingText: {
        color: colorConstants.textPrimary,
        alignSelf: 'center',
        marginTop: 25
    },
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
  