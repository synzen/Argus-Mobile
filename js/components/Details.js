import React, { Component } from 'react'
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    Dimensions,
    Linking,
    TouchableOpacity,
    Alert,
    Button,
    Animated
} from 'react-native';
import FastImage from 'react-native-fast-image'
import { material, systemWeights } from 'react-native-typography'
import colorConstants from '../constants/colors.js'
const win = Dimensions.get('window')

class Badge extends Component {
    render () {
        return (
            <TouchableOpacity 
            style={ this.props.selected ? { ...styles.badge, 'backgroundColor': colorConstants.headerBackgroundColorLight } : styles.badge } 
            onPress={this.props.onPress}>
                <Text style={styles.badgeText}>{ this.props.text }</Text>
            </TouchableOpacity>
        )
    }
}

export default class Details extends Component {
    static navigationOptions = {
        title: 'Details'
    }

    constructor(props) {
        super(props)
        const classifications = this.props.navigation.state.params.classifications
        let max = {
            percent: 0,
            name: '',
            wikipediaUrl: '',
            summary: ''
        }
        if (classifications) {
            classifications.forEach(item => {
                if (item.score < max.percent) return
                max.percent = item.score
                max.name = item.description
                max.wikipediaUrl = item.wikipediaUrl
                max.summary = item.summary
            })
        }

        this.state = {
            showResponse: false,
            selectedMatchPercent: max.percent,
            selectedMatchName: max.name,
            selectedWikipedia: max.wikipediaUrl || 'https://www.google.com',
            selectedSummary: max.summary || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
            fadeAnim: new Animated.Value(1)
        }
    }

    openLink = link => Linking.canOpenURL(link).then(able => able ? Linking.openURL(link) : Alert.alert('Error', 'No applications available to open URI')).catch(console.log)

    calcImageHeight = (imageW, imageH, desiredWidth)  => {
        return imageH * desiredWidth / imageW
    }

    changeSelectedMatch = item => {
        Animated.timing(this.state.fadeAnim, {toValue: 0, duration: 150 }).start(() => {
            this.setState({ selectedMatchName: item.description, selectedMatchPercent: item.score, selectedWikipedia: item.wikipediaUrl || this.state.selectedWikipedia, selectedSummary: item.summary || this.state.selectedSummary })
            Animated.timing(this.state.fadeAnim, {toValue: 1, duration: 150 }).start()

        })

    }

    render () {
        const navProps = this.props.navigation.state.params
        const imageWidth = win.width * .9
        const imageHeight = this.calcImageHeight(navProps.width, navProps.height, imageWidth)

        return (
            <ScrollView>
                <View style={styles.container}>
                    <TouchableOpacity  onPress={() => this.props.navigation.navigate('ViewImageScreen', { base64: navProps.base64, width: navProps.width, height: navProps.height })}>
                        <FastImage source={{uri: `data:image/jpg;base64,${navProps.base64}`}} style={ { ...styles.image, height: imageHeight, width: imageWidth } } resizeMode={FastImage.resizeMode.stretch}/>
                    </TouchableOpacity>
                    {/* <Image resizeMode='contain' source={{uri: navProps.uri}} style={styles.image}/> */}
                    { navProps.success === true ? 
                        (<View>
                            <Animated.Text style={ { ...styles.superHeading, opacity: this.state.fadeAnim } }>{this.state.selectedMatchName}</Animated.Text>
                            <Animated.Text style={{ ...styles.subheading, marginVertical: 5, opacity: this.state.fadeAnim }}>{(this.state.selectedMatchPercent * 100).toFixed(2)}% Score</Animated.Text>
                            <View style={styles.border}></View>
                            <Text style={styles.heading}>Matches</Text>
                            <View style={styles.badgeContainer}>
                                { //[{ description: 'dog', score: 12 }, { description: 'doge', score: 50 }, { description: 'dogggo', score: 70 }, { description: 'doggo', score: 98 }, { description: 'duck', score: 35 }, { description: 'dogjesus', score: 85 }, { description: 'dogod', score: 75 }, { description: 'dug', score: 54 }, { description: 'donkey', score: 12 },]
                                    navProps.classifications.map(item => {
                                    return <Badge key={item.description} selected={item.description === this.state.selectedMatchName} text={item.description} onPress={() => this.changeSelectedMatch(item)}></Badge>
                                }) }
                            </View>
                            <View style={styles.border}></View>

                            <Text style={styles.heading}>Summary</Text>
                            <Animated.Text style={{opacity: this.state.fadeAnim}}>{this.state.selectedSummary}</Animated.Text>
                            <View style={styles.wikipediaButton} ><Button onPress={() => this.openLink(this.state.selectedWikipedia)} title='Wikipedia' color={colorConstants.headerBackgroundColor}></Button></View>
                            <View style={styles.border}></View>
                            <Text style={styles.heading}>Response</Text>
                            {  this.state.showResponse ?
                                <Text>{JSON.stringify(navProps.response, null, 2)}</Text>
                                :
                                <View style={styles.wikipediaButton} ><Button onPress={() => this.setState({ showResponse: true })} title='Show' color={colorConstants.headerBackgroundColor}></Button></View>
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
                                <Text style={styles.subheading}>Dimensions</Text>
                                <Text>{navProps.width}x{navProps.height}</Text>
                            </View>
                        </View>
                        <View style={styles.miscInfoRow}>
                            <View style={styles.miscInfoItem}>
                                <Text style={styles.subheading}>Date Modified</Text>
                                <Text>{navProps.mtime.toString()}</Text>
                            </View>
                            <View style={styles.miscInfoItem}>
                                {/* <Text style={styles.subheading}>File Size</Text>
                                <Text>{navProps.size}</Text> */}
                            </View>

                        </View>
                    </View>
                    {/* <View style={styles.wikipediaButton} ><Button onPress={ () => { } } title='Delete' color='gray'></Button></View> */}



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
    },
    badge: {
        borderRadius: 50,
        backgroundColor: '#ecf0f1',
        margin: 5,
        borderColor: colorConstants.headerBackgroundColor,
        borderWidth: 1
    },
    badgeText: {
        paddingVertical: 3,
        paddingHorizontal: 6
    },
    badgeContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap'

    }
})