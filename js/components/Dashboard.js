import React, { Component, useState, useEffect } from 'react'
import Dialog from "react-native-dialog";
import keyHolder from '../constants/keys.js'
import {
    Text,
    StatusBar,
    TouchableOpacity,
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    AsyncStorage,
    Alert
} from 'react-native';
import { Card, Icon } from 'react-native-elements'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import AntIcon from 'react-native-vector-icons/AntDesign'
import colorConstants from '../constants/colors.js'
import { PieChart } from 'react-native-svg-charts'

class ServerStatusCard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            serverStatus: 0, // 0 = pending, 1 = success, 2 = warning, 3 = failed
            serverStatusMessage: ''
        }

        AsyncStorage.getItem('host')
        .then(host => host ? fetch(host + '/probe') : null)
        .then(res => {
            if (!res || this.unmounted) return
            this.setState( res.ok ? { serverStatus: 1 } : { serverStatus: 2, serverStatusMessage: `Bad status code (${res.status})` })
        })
        .catch(err => {
            console.log(err)
            if (this.unmounted) return
            this.setState({ serverStatus: 3, serverStatusMessage: err.message })
        })
    }

    componentWillUnmount = () => {
        this.unmounted = true // This must be changed to be non-antipattern
    }

    render () {
        const serverStatusIcon = this.state.serverStatus === 0 ? <AntIcon name='ellipsis1' size={70} color='white'/> : this.state.serverStatus === 1 ? <MaterialIcon name='check-circle' size={70} color={colorConstants.success}/> : this.state.serverStatus === 2 ? <MaterialIcon name='warning' size={70} color={colorConstants.warning}/> : <MaterialIcon name='error' size={70} color={colorConstants.danger}/>
        const serverStatusHeaderText = this.state.serverStatus === 0 ? 'Testing connection...' : this.state.serverStatus === 1 ? 'Online' : this.state.serverStatus === 2 ? 'Unexpected Response' : 'Offline'
        const serverStatusDescriptionText = this.state.serverStatus === 0 ? 'Please wait for connection results.' : this.state.serverStatus === 1 ? 'All functions fully operational.' : this.state.serverStatus === 2 ? 'Some functions may have unexpected results.' : 'Our monkeys have been dispatched fix this ASAP!.'

        return (
            <Card title='Server Status' containerStyle={styles.cardContainer} titleStyle={{color:'white'}}>
                <View style={styles.statusContainer}>
                    { serverStatusIcon }
                    <View style={styles.statusTextContainer}>
                        <Text style={styles.statusHeaderText}>{serverStatusHeaderText}</Text>
                        <Text style={styles.statusDescriptionText}>{serverStatusDescriptionText}</Text>
                    </View>
                </View>
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
                {/* <View style={styles.statusContainer}> */}
                    <PieChart startAngle={Math.PI * 2} endAngle={0} data={[ { value: .1, key: '1', svg: { fill: colorConstants.blue } }, { value: .9, key: '2', svg: { fill: colorConstants.headerBackgroundColorVeryLight } } ]} style={{ height: 125 }} />
                    {/* <View style={styles.statusTextContainer}> */}
                        {/* <Text>You've used a lot of storage!</Text> */}
                    {/* </View> */}
                {/* </View> */}
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
            <StatusBar backgroundColor='black' />
            <ServerStatusCard />
            <Card title='Tokens Available' containerStyle={styles.cardContainer} titleStyle={{color: 'white'}}>
                <View style={styles.tokensContainer}>
                    <Text style={styles.tokensText}>1000</Text>
                    <TouchableOpacity style={styles.tokensButtonTouchable} onPress={() => Alert.alert('', 'no', [{text: ':('}])}>
                        <Icon raised name='add' size={20} containerStyle={{backgroundColor: colorConstants.headerBackgroundColorVeryLight}} color='white' />
                    </TouchableOpacity>
                </View>
                {/* <PieChart startAngle={Math.PI * 2} endAngle={0} data={[ { value: .1, key: '1', svg: { fill: colorConstants.blue } }, { value: .9, key: '2', svg: { fill: colorConstants.headerBackgroundColorVeryLight } } ]} style={{ height: 200 }}/> */}
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
  