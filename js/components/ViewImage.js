import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    AsyncStorage,
    Alert,
    FlatList,
    Dimensions,
    Image
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import FastImage from 'react-native-fast-image'
const windowDimensions = Dimensions.get('window')

export default class ViewImage extends Component {
    static navigationOptions = {
        title: 'View Image'
    }

    constructor(props) {
        super(props)
        const windowWidth = windowDimensions.width
        const windowHeight = windowDimensions.height - 100
        const imageWidth = this.props.navigation.state.params.width
        const imageHeight = this.props.navigation.state.params.height
        let useWidth, useHeight
        useWidth = imageWidth > windowWidth ? windowWidth : imageWidth
        useHeight = useWidth * imageHeight / imageWidth

        if (useHeight > windowHeight) {
            useHeight = windowHeight
            useWidth = useHeight * imageWidth / imageHeight
        }

        this.state = {
            width: useWidth,
            height: useHeight,
            cropWidth: windowDimensions.width,
            cropHeight: windowDimensions.height
        }
    }

    calcDimensions = () => {

    }

    render () {
        const navProps = this.props.navigation.state.params

        return (
                <ImageZoom cropWidth={this.state.cropWidth}
                        cropHeight={this.state.cropHeight}
                        imageWidth={this.state.width}
                        imageHeight={this.state.height}
                        style={styles.container}>
                    <FastImage source={{uri: `data:image/jpg;base64,${navProps.base64}`}} style={ { height: this.state.height, width: this.state.width, alignSelf: 'center' } } resizeMode={FastImage.resizeMode.stretch}/>
                </ImageZoom>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center'
    }
})