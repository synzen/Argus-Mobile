import React, { Component } from 'react'
import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    Dimensions,
    Linking,
    TouchableOpacity,
    TouchableHighlight,
    Alert,
    Button,
    Animated
} from 'react-native';
import FastImage from 'react-native-fast-image'
import { material, systemWeights } from 'react-native-typography'
import colorConstants from '../constants/colors.js'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Orientation from 'react-native-orientation'
const win = Dimensions.get('window')

class Badge extends Component {
    render () {
        return (
            <TouchableOpacity 
            style={ this.props.selected ? { ...styles.badge, 'backgroundColor': colorConstants.headerBackgroundColorVeryLight } : styles.badge } 
            onPress={this.props.onPress}>
                <Text style={ this.props.selected ? styles.badgeTextSelected : styles.badgeText }>{ this.props.text }</Text>
            </TouchableOpacity>
        )
    }
}

export default class Details extends Component {
    static getDerivedStateFromProps (nextProps, state) {
        const nextParams = nextProps.navigation.state.params
        return !nextParams ? null : nextParams.id === state.id ? null : nextParams.classifications ? { ...Details.calculateBestClassification(nextParams.classifications), id: nextParams.id } : { id: nextParams.id }
    }

    static calculateBestClassification (classifications) {
        if (!classifications) return // Failed items do not have classifications
        let max = {
            selectedMatchPercent: 0,
            selectedMatchName: '',
            selectedWikipedia: '',
            selectedSummary: ''
        }
        classifications.forEach(item => {
            if (item.score < max.selectedMatchPercent) return
            max.selectedMatchPercent = item.score
            max.selectedMatchName = item.description
            max.selectedWikipedia = item.wikipediaUrl
            max.selectedSummary = item.summary
        })
        return max
    }


    constructor(props) {
        super(props)
        const params = this.props.navigation.state.params
        const classifications = params.classifications

        const max = classifications ? Details.calculateBestClassification(classifications) : {}

        this.state = {
            showResponse: false,
            id: params.id,
            selectedMatchPercent: '',
            selectedMatchName: '',
            selectedWikipedia: '',
            selectedSummary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
            fadeAnim: new Animated.Value(1),
            imageWidth: win.width,
            ...max

        }
    }

    componentDidMount = function () {
        Orientation.addOrientationListener(this._orientationChanged)
    }

    componentWillUnmount = function () {
        Orientation.removeOrientationListener(this._orientationChanged)
    }

    _orientationChanged = orientation => {
        setTimeout(() => this.setState({ imageWidth: Dimensions.get('window').height }), 0)
    }

    openLink = link => Linking.canOpenURL(link).then(able => able ? Linking.openURL(link) : Alert.alert('Error', 'No applications available to open URI')).catch(console.log)

    changeSelectedMatch = item => {
        Animated.timing(this.state.fadeAnim, {toValue: 0, duration: 150 }).start(() => {
            this.setState({ selectedMatchName: item.description, selectedMatchPercent: item.score, selectedWikipedia: item.wikipediaUrl || this.state.selectedWikipedia, selectedSummary: item.summary || this.state.selectedSummary })
            Animated.timing(this.state.fadeAnim, {toValue: 1, duration: 150 }).start()
        })

    }

    render () {
        const navParams = this.props.navigation.state.params
        return (
            <ScrollView>
                <TouchableHighlight onPress={() => this.props.navigation.navigate('ViewImageScreen', { base64: navParams.image.base64, width: navParams.image.width, height: navParams.image.height })}><FastImage source={{uri: `data:image/jpg;base64,${navParams.image.base64}`}} style={{ ...styles.image, height: 275, width: this.state.imageWidth }}/></TouchableHighlight>
                <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,.7)']} style={styles.gradientContainer}>
                    <View style={{ ...styles.gradientTextContainer, height: 90, width: this.state.imageWidth }}>
                        <View style={{flex: 1, paddingRight: 5}}>
                            <Animated.Text numberOfLines={1} style={{ ...styles.superHeading, opacity: this.state.fadeAnim }}>{this.state.selectedMatchName}</Animated.Text>
                            <Animated.Text style={{ ...styles.subheading, marginVertical: 5, opacity: this.state.fadeAnim }}>{ this.state.selectedMatchPercent ?  `${(this.state.selectedMatchPercent * 100).toFixed(2)}% Score` : ''}</Animated.Text>
                        </View>
                        <TouchableOpacity style={{padding: 10}}>
                            <Icon name='arrow-expand' size={30} color={colorConstants.textPrimary} onPress={() => this.props.navigation.navigate('ViewImageScreen', { base64: navParams.image.base64, width: navParams.image.width, height: navParams.image.height })}/>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
                <View style={styles.container}>
                    { !navParams.error ? 
                        (<View>
                            <Text style={styles.heading}>Other Matches</Text>
                            <View style={styles.badgeContainer}>
                                { //[{ description: 'dog', score: 12 }, { description: 'doge', score: 50 }, { description: 'dogggo', score: 70 }, { description: 'doggo', score: 98 }, { description: 'duck', score: 35 }, { description: 'dogjesus', score: 85 }, { description: 'dogod', score: 75 }, { description: 'dug', score: 54 }, { description: 'donkey', score: 12 },]
                                    navParams.classifications.map(item => {
                                    return <Badge key={item.description} selected={item.description === this.state.selectedMatchName} text={item.description} onPress={() => this.changeSelectedMatch(item)}></Badge>
                                }) }
                            </View>
                            <View style={styles.border}></View>

                            <Text style={styles.heading}>Summary</Text>
                            <Animated.Text style={{ ...styles.bodyText, opacity: this.state.fadeAnim }}>{this.state.selectedSummary}</Animated.Text>
                            <View style={styles.wikipediaButton}>{ this.state.selectedWikipedia ? <Button onPress={() => this.openLink(this.state.selectedWikipedia)} title='Wikipedia' color={colorConstants.headerBackgroundColorLight}></Button> : undefined }</View>
                            <View style={styles.border}></View>
                            <Text style={styles.heading}>Response</Text>
                            {  this.state.showResponse ?
                                <Text style={styles.bodyText}>{JSON.stringify(navParams.response, null, 2)}</Text>
                                :
                                <View style={styles.wikipediaButton} ><Button onPress={() => this.setState({ showResponse: true })} title='Show' color={colorConstants.headerBackgroundColorLight}></Button></View>
                            }
                            <View style={styles.border}></View>
                        </View>)
                        :
                        (<View>
                            <Text style={{ ...styles.superHeading, ...styles.dangerColor }}>Failed to Process</Text>
                            <Text style={styles.heading}>{ navParams.error || 'Unknown Reason' }</Text>
                            <View style={styles.border}></View>
                            
                        </View>)
                    }

                    <View style={styles.miscInfoContainer}>
                        <View style={styles.miscInfoRow}>
                            <View style={styles.miscInfoItem}>
                                <Text style={styles.subheading}>File Name</Text>
                                <Text style={styles.bodyText}>{navParams.id}</Text>
                            </View>
                            <View style={styles.miscInfoItem}>
                                <Text style={styles.subheading}>Dimensions</Text>
                                <Text style={styles.bodyText}>{navParams.image.width}x{navParams.image.height}</Text>
                            </View>
                        </View>
                        <View style={styles.miscInfoRow}>
                            <View style={styles.miscInfoItem}>
                                <Text style={styles.subheading}>Date Modified</Text>
                                <Text style={styles.bodyText}>{navParams.date.toString()}</Text>
                            </View>
                            <View style={styles.miscInfoItem}>
                                <Text style={styles.subheading}>File Size</Text>
                                <Text style={styles.bodyText}>{navParams.image.sizeMB} MB</Text>
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
        borderBottomColor: colorConstants.divider,
        marginVertical: 15
    },
    image: {
        flex: 1,
        alignSelf: 'center',
        marginBottom: 20
    },
    gradientContainer: {
        flex: 1,
        position: 'absolute',
        top: 185,
        left: 0
    },
    gradientTextContainer: {
        color: colorConstants.textPrimary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15
    },
    miscInfoContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between'
        
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
        marginBottom: 20,
        marginTop: 10,
        marginHorizontal: 10
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
        color: colorConstants.textPrimary
    },
    heading: {
        ...material.title,
        // ...systemWeights.semibold,
        color: colorConstants.textPrimary,
        marginBottom: 15
    },
    subheading: {
        ...material.body1,
        marginVertical: 15,
        color: colorConstants.textSecondary,
        
    },
    bodyText: {
        color: colorConstants.textSecondary
    },
    badge: {
        // borderRadius: 50,
        backgroundColor: colorConstants.headerBackgroundColorVeryVeryLight,
        margin: 2,
        borderColor: colorConstants.headerBackgroundColor,
        borderWidth: 1
    },
    badgeText: {
        paddingVertical: 3,
        paddingHorizontal: 6
    },
    badgeTextSelected: {
        paddingVertical: 3,
        paddingHorizontal: 6,
        color: colorConstants.textPrimary
    },
    badgeContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap'
    }
})