import React, { Component } from 'react'
import {
    View,
    AsyncStorage,
    StyleSheet,
    TextInput,
    UIManager,
    Animated,
    LayoutAnimation,
    Alert,
    Text
} from 'react-native';
import colors from '../constants/colors.js'
import { Button } from 'react-native-elements'
import { material } from 'react-native-typography'
import { NavigationActions } from 'react-navigation'
import globalState from '../constants/state.js'
import keyHolder from '../constants/keys.js'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
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
            registeringText: 'Registering...',
            loggingInText: 'Logging In...',
            registeringTextInterval: undefined,
            loggingInTextInterval: undefined,
            ellipsisInterval: undefined,
            ellipsisText: ''
        }
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
            const res = await fetch(`${host}/login`/*'http://18.220.69.245:6000/register'*/, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: this.state.email, password: this.state.password })
            })

            console.log(res)
            if (!res.ok) throw new Error(`Non-200 status code (${res.status})`)
        
            const json = await res.json()
            await AsyncStorage.setItem('login', JSON.stringify({ email: this.state.email, password: this.state.password }))
            globalState.email = this.state.email
            globalState.password = this.state.password
            const setParamsAction = NavigationActions.setParams({
                params: { email: this.state.email },
                key: keyHolder.get('SideMenu'),
            })
            console.log(keyHolder.get('SideMenu'))
            this.props.navigation.dispatch(setParamsAction)
            this.props.navigation.goBack()
            Alert.alert('Success', `You are now logged in as, ${this.state.email}!`)

            console.log(json)
        } catch (err) {
            console.log(err)
            Alert.alert('Failed to Login', err.message)
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
            const res = await fetch(`${host}/register`/*'http://18.220.69.245:6000/register'*/, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: this.state.email, password: this.state.password })
            })

            console.log(res)
            if (!res.ok) throw new Error(`Non-200 status code (${res.status})`)
        
            const json = await res.json()
            await AsyncStorage.setItem('login', JSON.stringify({ email: this.state.email, password: this.state.password }))
            globalState.email = this.state.email
            globalState.password = this.state.password
            const setParamsAction = NavigationActions.setParams({
                params: { email: this.state.email },
                key: keyHolder.get('SideMenu'),
            })
            console.log(keyHolder.get('SideMenu'))
            this.props.navigation.dispatch(setParamsAction)
            this.props.navigation.goBack()
            Alert.alert('Congratulations!', `You have created a new account, ${this.state.email}!`)

            console.log(json)
        } catch (err) {
            console.log(err)
            Alert.alert('Failed to Register', err.message)
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
            // console.log(this.state)
        }, 700) })
    }

    stopProcessState = () => {
        clearInterval(this.state.ellipsisInterval)
        this.setState({ processing: false })
    }

    render () {
        return (
            <View style={styles.container}>
                <Animated.View style={{ ...styles.headerTextContainer, opacity: this.state.textOpacity }}>
                    <Text style={styles.headerText}>{this.state.processing ? this.state.ellipsisText : this.state.loginForm ? 'Log In' : 'Register'}</Text>
                    <Text style={styles.subheaderText}>{this.state.loginForm === true ? `Log in to see your saved classifications and access them from the web or anywhere.` : `Register to save your classifications and access them from the web or anywhere.`}</Text>
                </Animated.View>
                <TextInput style={styles.inputContainer} editable={!this.state.processing} onChangeText={t => this.setState({ email: t })} onSubmitEditing={this.state.loginForm ? this.login : this.register} style={styles.input} inputStyle={styles.inputContainer} underlineColorAndroid={colors.headerBackgroundColorLight} placeholder='Email'/>
                <TextInput style={styles.inputContainer} editable={!this.state.processing} onChangeText={t => this.setState({ password: t })} onSubmitEditing={this.state.loginForm ?  this.login : this.register} style={styles.input} inputStyle={styles.inputContainer} underlineColorAndroid={colors.headerBackgroundColorLight} placeholder='Password' secureTextEntry={true} autoCapitalize='none' autoCorrect={false}/>
                
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
                <Button raised={this.state.loginForm} loading={this.state.loginForm && this.state.processing} title={this.state.processing && this.state.loginForm ? 'Logging in...' : 'Log In' } containerViewStyle={styles.loginButtonContainer} disabled={this.state.processing} buttonStyle={ { ...styles.loginButton, backgroundColor: this.state.loginForm ? colors.success : colors.gray } } disabled={this.state.processing} onPress={this.login}/>
                <Button raised={!this.state.loginForm} loading={!this.state.loginForm && this.state.processing} title={this.state.processing && !this.state.loginForm ? 'Registering...' : 'Register'} containerViewStyle={styles.loginButtonContainer2} disabled={this.state.processing} buttonStyle={{ backgroundColor: this.state.loginForm ? colors.gray : colors.blue }} onPress={this.register}/>
                {/* </View> */}
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        margin: 10
    },
    headerTextContainer: {
        marginTop: 30,
        marginLeft: 17,
        marginBottom: 30,
        alignContent: 'center'
    },
    headerText: {
        ...material.display1,
        marginBottom: 15
    },
    subheaderText: {
        ...material.subheadingWhite,
        color: colors.headerBackgroundColorLight,
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
        marginLeft: 18
    },
    loginButton: {
        backgroundColor: colors.success
    },
    input: {
        marginHorizontal: 15,
        marginVertical: 5
    },
    inputContainer: {
        // borderBottomColor: 'black',
        borderRadius: 5,
        flex: 1
    }
})