import React, { Component } from 'react'
import {
    View,
    AsyncStorage,
    StyleSheet,
    TextInput,
    UIManager,
    ScrollView,
    Animated,
    LayoutAnimation,
    Alert,
    Image,
    Text
} from 'react-native';
import colorConstants from '../constants/colors.js'
import { Button } from 'react-native-elements'
import { material } from 'react-native-typography'
import { NavigationActions } from 'react-navigation'
import globalState from '../constants/state.js'
import keyHolder from '../constants/keys.js'
import schemas from '../constants/schemas.js'
import { Container, Content, StyleProvider, Input } from 'native-base'
import getTheme from '../../native-base-theme/components';
import darkMaterial from '../../native-base-theme/variables/darkMaterial';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Realm from 'realm'
import axios from 'axios'
// UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export default class Login extends Component {
    static navigationOptions = {
        title: 'Login'
    }

    constructor(props) {
        super(props)
        this.state = {
            processing: false,
            loginForm: true,
            textOpacity: new Animated.Value(1),
            email: '',
            password: '',
            ellipsisInterval: undefined,
            ellipsisText: ''
        }
    }

    saveSchemaToDatabase = async (schema, realm) => {
        realm.write(() => {
            realm.create(schemas.ClassifiedResultSchema.name, schema)
        })
        console.log('saved new schema to database')
    }

    sendDataToRelevantRoutes = (data, route) => {
        const setParamsAction = NavigationActions.setParams({
            params: data,
            key: keyHolder.get(route),
        })
        this.props.navigation.dispatch(setParamsAction)
    }

    parseDateString = str => {
        // This is in the format of 2018-12-16 16:44:07
        const data = str.split(' ')
        const date = data[0].split('-')
        const time = data[1].split(':')
        // The month must be subtracted by 1 since they count from 0
        return new Date(date[0], parseInt(date[1], 10) - 1, date[2], time[0], time[1], time[2])
    }

    login = async () => {
        // If it's the register form, change it to login form
        if (!this.state.loginForm) {
            return Animated.timing(this.state.textOpacity, {toValue: 0, duration: 100}).start(() => {
                this.setState({ loginForm: true })
                Animated.timing(this.state.textOpacity, {toValue: 1, duration: 100}).start()
            })
        }

        if (!this.state.email || !this.state.password) return Alert.alert('Oopsy Daisy!', 'You missed your email or password')
        this.startProcessState()
        try {
            const host = await AsyncStorage.getItem('host')
            if (!host) return Alert.alert('Error', 'A host has not been set.')

            // Axios automatically checks for the 200 status code
            const res = await axios.post(`${host}/login`/*'http://18.220.69.245:6000/register'*/, {
                username: this.state.email,
                password: this.state.password
            })

            await AsyncStorage.setItem('login', JSON.stringify({ email: this.state.email, password: this.state.password }))
            const userData = res.data
            const history = userData.history
            const realm = await Realm.open({ schema: schemas.all })
            const formattedClassifiedItems = []
            for (const classifiedItem of history) {
                const imagePath = `${host}/${classifiedItem.image.url}`
                const schema = {
                    user: this.state.email,
                    id: classifiedItem.id,
                    image: {
                        path: classifiedItem.image.userFileUri,
                        url: imagePath,
                        width: classifiedItem.image.width,
                        height: classifiedItem.image.height,
                        sizeMB: (classifiedItem.image.size / 1000).toFixed(2)
                    },
                    date: this.parseDateString(classifiedItem.dateCreated),
                    successful: true,
                    classifications: classifiedItem.predictions
                }
                formattedClassifiedItems.push(schema)
                // Check if the item is already in the database
                const match = realm.objects(schemas.ClassifiedResultSchema.name).filtered('id == $0', classifiedItem.id)
                if (match.length === 0) this.saveSchemaToDatabase(schema, realm)
            }
            globalState.email = this.state.email
            globalState.password = this.state.password
            const paramsData = { email: this.state.email, password: this.state.password, credits: userData.credits, imageStored: history.length }
            this.sendDataToRelevantRoutes(paramsData, 'SideMenu')
            this.sendDataToRelevantRoutes(paramsData, 'DashboardScreen')
            this.sendDataToRelevantRoutes({ classifiedResults: formattedClassifiedItems,  loggedOut: false }, 'HistoryScreen')
            this.sendDataToRelevantRoutes({ classifiedResults: undefined }, 'HistoryScreen')
            this.props.navigation.goBack()
            Alert.alert('Success', `You are now logged in as ${this.state.email}!`)
        } catch (err) {
            console.log(err)
            Alert.alert('Failed to Login', err.response ? err.response.data.msg : err.message)
        }
        this.stopProcessState()
    }

    register = async () => {
        // If it's the login form, change it to register form
        if (this.state.loginForm) {
            return Animated.timing(this.state.textOpacity, {toValue: 0, duration: 100}).start(() => {
                this.setState({ loginForm: false })
                Animated.timing(this.state.textOpacity, {toValue: 1, duration: 100}).start()
            })
        }

        if (!this.state.email || !this.state.password) return Alert.alert('Oopsy Daisy!', 'You missed your email or password')
        this.startProcessState()
        try {
            console.log(this.state.email)
            console.log(this.state.password)
            const host = await AsyncStorage.getItem('host')
            if (!host) return Alert.alert('Error', 'A host has not been set.')

            // Axios automatically checks the 200 status code
            const res = await axios.post(`${host}/register`, {
                username: this.state.email,
                password: this.state.password
            })
            console.log(res.data)
            // const loginData = await axios.get(`${host}/login`)
            // console.log(res.data)

            // if (!res.ok) throw new Error(`Non-200 status code (${res.status})\n\n${resBody.msg}`)
        
            await AsyncStorage.setItem('login', JSON.stringify({ email: this.state.email, password: this.state.password }))
            globalState.email = this.state.email
            globalState.password = this.state.password
            const paramsData = { email: this.state.email, password: this.state.password, credits: res.data.credits, imageStored: 0 }
            this.sendDataToRelevantRoutes(paramsData, 'SideMenu')
            this.sendDataToRelevantRoutes(paramsData, 'DashboardScreen')
            this.sendDataToRelevantRoutes({ classifiedResults: formattedClassifiedItems,  loggedOut: false }, 'HistoryScreen')
            this.sendDataToRelevantRoutes({ classifiedResults: undefined }, 'HistoryScreen')
            this.props.navigation.goBack()
            Alert.alert('Congratulations!', `You have created a new account, ${this.state.email}!`)
        } catch (err) {
            console.log(err)
            Alert.alert('Failed to Register', err.response ? err.response.data.msg : err.message)
        }
        this.stopProcessState()
    }

    startProcessState = () => {
        const textStateValue = this.state.loginForm ? 'Logging In' : 'Registering'
        this.setState({ processing: true, ellipsisText: `${textStateValue}...`, ellipsisInterval: setInterval(() => {
            if (this.state.ellipsisText === `${textStateValue}...`) this.setState({ ellipsisText: textStateValue })
            else if (this.state.ellipsisText === textStateValue) this.setState({ ellipsisText: `${textStateValue}.`})
            else if (this.state.ellipsisText === `${textStateValue}.`) this.setState({ ellipsisText: `${textStateValue}..`})
            else this.setState({ ellipsisText: `${textStateValue}...` })
        }, 700) })
    }

    stopProcessState = () => {
        clearInterval(this.state.ellipsisInterval)
        this.setState({ processing: false })
    }

    render () {
        return (
            <ScrollView style={styles.container}>
                <Animated.View style={{ ...styles.headerTextContainer, opacity: this.state.textOpacity }}>
                    <Text style={styles.headerText}>{this.state.processing ? this.state.ellipsisText : this.state.loginForm ? 'Log In' : 'Register'}</Text>
                    <Text style={styles.subheaderText}>{this.state.loginForm === true ? `Log in to see your saved classifications and access them from the web or anywhere.` : `Register to save your classifications and access them from the web or anywhere.`}</Text>
                </Animated.View>
                <StyleProvider style={getTheme(darkMaterial)}>
                {/* <Input placeholder='Regular Textbox' /> */}
                <View>
                <Input style={styles.inputContainer} selectionColor={colorConstants.blue} editable={!this.state.processing} onChangeText={t => this.setState({ email: t })} onSubmitEditing={this.state.loginForm ? this.login : this.register} style={styles.input} underlineColorAndroid={colorConstants.headerBackgroundColorLight} placeholder='Email' placeholderTextColor={colorConstants.textDisabled}/>
                <Input style={styles.inputContainer} editable={!this.state.processing} selectionColor={colorConstants.blue} onChangeText={t => this.setState({ password: t })} onSubmitEditing={this.state.loginForm ?  this.login : this.register} style={styles.input} underlineColorAndroid={colorConstants.headerBackgroundColorLight} placeholder='Password' placeholderTextColor={colorConstants.textDisabled} secureTextEntry={true} autoCapitalize='none' autoCorrect={false}/>
                </View></StyleProvider>    
                {/* <Text style={styles.forgotPassword}>Forgot Password?</Text> */}
                <Button raised={this.state.loginForm} disabledStyle={styles.buttonDisabledStyle} loadingStyle={styles.buttonDisabledStyle} loading={this.state.loginForm && this.state.processing} title={this.state.processing && this.state.loginForm ? 'Logging in...' : 'Log In' } containerViewStyle={styles.loginButtonContainer} disabled={this.state.processing} buttonStyle={ { ...styles.loginButton, backgroundColor: this.state.loginForm ? colorConstants.success : colorConstants.gray } } disabled={this.state.processing} onPress={this.login}/>
                <Button raised={!this.state.loginForm} disabledStyle={styles.buttonDisabledStyle} loadingStyle={styles.buttonDisabledStyle} loading={!this.state.loginForm && this.state.processing} title={this.state.processing && !this.state.loginForm ? 'Registering...' : 'Register'} containerViewStyle={styles.loginButtonContainer2} disabled={this.state.processing} buttonStyle={{ backgroundColor: this.state.loginForm ? colorConstants.gray : colorConstants.blue }} onPress={this.register}/>
                {/* </View> */}
                
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    buttonDisabledStyle: {
        backgroundColor: colorConstants.headerBackgroundColorVeryLight
    },
    container: {
        // margin: 10
        paddingHorizontal: 10
    },
    headerTextContainer: {
        marginTop: 30,
        marginLeft: 17,
        marginBottom: 30,
        alignContent: 'center'
    },
    headerText: {
        ...material.display1,
        color: colorConstants.textPrimary,
        marginBottom: 15
    },
    subheaderText: {
        ...material.subheadingWhite,
        color: colorConstants.textSecondary,
    },
    inputWrapper: {
        alignContent: 'center',
        flexDirection: 'row',
    },
    loginButtonContainer: {
        marginTop: 40
    },
    loginButtonContainer2: {
        marginTop: 10
    },
    forgotPassword: {
        marginLeft: 18,
        color: colorConstants.textSecondary
    },
    loginButton: {
        backgroundColor: colorConstants.success
    },
    input: {
        marginHorizontal: 15,
        marginVertical: 5
    },
    inputContainer: {
        borderRadius: 5,
        flex: 1,
        backgroundColor: 'white',
        color: '#FFFFFF'
    }
})