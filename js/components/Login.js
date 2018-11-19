import React, { Component } from 'react'
import {
    View,
    StyleSheet,
    TextInput,
    Text
} from 'react-native';
import colors from '../constants/colors.js'
import { Button } from 'react-native-elements'
import { material } from 'react-native-typography'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

export default class Login extends Component {
    static navigationOptions = {
        title: 'Login'
    }

    constructor(props) {
        super(props)
        this.state = {
            loggingIn: false
        }
    }

    login = () => {

    }

    render () {
        return (
            <View style={styles.container}>
                <View style={styles.headerTextContainer}>
                    {/* <Text style={styles.headerText}>Argus</Text> */}
                    <Text style={styles.subheaderText}>Log in to save your classifications and access them from the web or anywhere.</Text>
                </View>
                <TextInput style={styles.inputContainer} onSubmitEditing={this.login} style={styles.input} inputStyle={styles.inputContainer} underlineColorAndroid={colors.headerBackgroundColorLight} placeholder='Email'/>
                <TextInput style={styles.inputContainer} onSubmitEditing={this.login} style={styles.input} inputStyle={styles.inputContainer} underlineColorAndroid={colors.headerBackgroundColorLight} placeholder='Password' secureTextEntry={true} autoCapitalize='none' autoCorrect={false}/>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
                <Button raised title='Log In' containerViewStyle={styles.loginButtonContainer} buttonStyle={styles.loginButton} disabled={this.state.loggingIn} />
                <Button raised title='Register' containerViewStyle={styles.loginButtonContainer2} disabled={this.state.loggingIn} />
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