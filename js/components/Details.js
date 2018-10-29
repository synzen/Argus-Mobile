import React, { Component } from 'react'
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    Dimensions,
    Linking,
    Alert,
    Button
} from 'react-native';
import FastImage from 'react-native-fast-image'
import { material, systemWeights } from 'react-native-typography'

const win = Dimensions.get('window')

export default class Details extends Component {
    static navigationOptions = {
        title: 'Details'
    }

    constructor(props) {
        super(props)
        this.state = {
            showResponse: false
        }
    }

    openWikipedia = () => Linking.canOpenURL('https://www.google.com').then(able => able ? Linking.openURL('https://www.google.com') : Alert.alert('Error', 'No applications available to open URL.')).catch(console.log)

    render () {
        const navProps = this.props.navigation.state.params
        return (
            <ScrollView>
                <View style={styles.container}>
                    <FastImage source={{uri: `data:image/jpg;base64,${navProps.base64}`}} style={styles.image} resizeMode={FastImage.resizeMode.stretch}/>
                    {/* <Image resizeMode='contain' source={{uri: navProps.uri}} style={styles.image}/> */}
                    { navProps.success === true ? 
                        (<View>
                            <Text style={styles.superHeading}>Television</Text>
                            <Text style={{ ...styles.subheading, marginVertical: 5 }}>90% Best Match</Text>
                            <View style={styles.border}></View>
                            <Text style={styles.heading}>Summary</Text>
                            <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</Text>
                            <View style={styles.wikipediaButton} ><Button onPress={this.openWikipedia.bind(this)} title='Wikipedia' color='gray'></Button></View>
                            <View style={styles.border}></View>
                            <Text style={styles.heading}>Response</Text>
                            {  this.state.showResponse ?
                                <Text>{JSON.stringify(navProps.response, null, 2)}</Text>
                                :
                                <View style={styles.wikipediaButton} ><Button onPress={() => this.setState({ showResponse: true })} title='Show' color='gray'></Button></View>
                            }
                            <View style={styles.border}></View>
                        </View>)
                        :
                        (<View>
                            <Text style={{ ...styles.superHeading, ...styles.dangerColor }}>Failed to Process</Text>
                            <Text style={styles.heading}>{ navProps.error || 'Unknown Reason' }</Text>
                            <View style={styles.border}></View>
                            
                        </View>)
                    }

                    <View style={styles.miscInfoContainer}>
                        <View style={styles.miscInfoRow}>
                            <View style={styles.miscInfoItem}>
                                <Text style={styles.subheading}>File Name</Text>
                                <Text>{navProps.name}</Text>
                            </View>
                            <View style={styles.miscInfoItem}>
                                <Text style={styles.subheading}>File Path</Text>
                                <Text>{navProps.path}</Text>
                            </View>
                        </View>
                        <View style={styles.miscInfoRow}>
                            <View style={styles.miscInfoItem}>
                                <Text style={styles.subheading}>File Size</Text>
                                <Text>{navProps.size}</Text>
                            </View>
                            <View style={styles.miscInfoItem}>
                                <Text style={styles.subheading}>Date Modified</Text>
                                <Text>{navProps.mtime.toString()}</Text>
                            </View>
                        </View>
                    </View>


                    {/* <Text style={styles.heading}>Television</Text>
                    <Text>Some text</Text> */}
                </View>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    dangerColor: {
        color: '#b00020'
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: '#bdbdbd',
        marginVertical: 15
    },
    image: {
        flex: 1,
        // marginBottom: 20,
        // width: 300,
        width: win.width * .8,
        height: 225,
        alignSelf: 'center',
        marginBottom: 20
    },
    miscInfoContainer: {
        flex: 1,
        flexDirection: 'column'
        
    },
    miscInfoRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    miscInfoItem: {
        flex: 1,
        flexDirection: 'column',
        paddingRight: 10
    },
    container: {
        flex: 1,
        // margin: 30,
        marginVertical: 20,
        marginHorizontal: 25
        // backgroundColor: 'gray'
        // padding: 100
        // height: 500
    },
    wikipediaButton: {
        marginTop: 25,
        marginBottom: 15,
    }, 
    superHeading: {
        ...material.display1,
        ...systemWeights.bold,
        color: 'black'
    },
    heading: {
        ...material.title,
        ...systemWeights.semibold,
        marginBottom: 15
    },
    subheading: {
        marginVertical: 15,
        ...material.body1
    }
})