import React, {Component} from 'react'
import {
  StyleSheet,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay'
import colorConstants from '../constants/colors.js'
import { Card } from 'react-native-elements'

class ProgressBox extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    render () {
        const progressBox = (
            <Card containerStyle={styles.cardContainer} titleStyle={styles.cardTitle}>
                {this.props.children}
            </Card>
          )

        return (
            <Spinner
            overlayColor='rgba(0,0,0,0.75)'
            visible={this.props.shown}
            cancelable
            animation={this.props.animation}
            customIndicator={progressBox}
            />
        )
    }
}

const styles = StyleSheet.create({
    cardContainer: {
      backgroundColor: colorConstants.headerBackgroundColorLight,
      borderColor: colorConstants.headerBackgroundColorLight,
      width: 300,
    },
    cardTitle: {
        color: colorConstants.textPrimary
    }
})

export default ProgressBox