// @flow
import React from 'react'
import { StyleSheet, ToastAndroid, View } from 'react-native'
import MapView from 'react-native-maps'

import Button from 'react-native-button'
import * as Progress from 'react-native-progress'

import Colors from '../utils/colors'
import GlobalStyles from '../utils/styles'

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundGrey.string(),
    flex: 1,
    justifyContent: 'flex-end',
    paddingLeft: '15%',
    paddingRight: '15%'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  progress: {
    flex: 1,
    justifyContent: 'center'
  }
})

export default class App extends React.Component {
  constructor(props: { navigation: Object }) {
    super(props)
    this.state = { latitude: 0, longitude: 0 }
  }

  state: {
    latitude: number,
    longitude: number
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        this.setState({ latitude, longitude })
      },
      error => ToastAndroid.show(error.message, ToastAndroid.SHORT),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    )
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID)
  }

  handlePress = () => {
    this.props.navigation.navigate('LineMap')
  }

  props: {
    navigation: Object
  }

  watchID: number

  render() {
    const isPositionReady = this.state.latitude !== 0 && this.state.longitude !== 0
    return (
      <View style={styles.container}>
        {isPositionReady && (
          <MapView
            initialRegion={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }}
            style={styles.map}
          />
        )}
        {!isPositionReady && (
          <View style={styles.progress}>
            <Progress.Circle color={Colors.accent.string()} size={60} thickness={6} indeterminate />
          </View>
        )}
        <Button
          disabled={!isPositionReady}
          style={GlobalStyles.button}
          styleDisabled={GlobalStyles.buttonDisabled}
          onPress={this.handlePress}
        >
          START!
        </Button>
      </View>
    )
  }
}
