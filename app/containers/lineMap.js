// @flow
import React from 'react'
import { StyleSheet, ToastAndroid, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

import Button from 'react-native-button'
import * as Progress from 'react-native-progress'

import LightSTM from '../api/lightSTM'
import db from '../store/db'
import Colors from '../utils/colors'
import GlobalStyles from '../utils/styles'

import type { BusStop } from '../utils/types'

type props = {
  navigation: Object
}

type state = {
  busStops: BusStop[],
  busStopsSelected: Set<BusStop>,
  latitude: number,
  longitude: number
}

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

export default class App extends React.Component<props, state> {
  constructor() {
    super()
    this.state = {
      busStops: [],
      busStopsSelected: new Set(),
      latitude: 0,
      longitude: 0
    }
  }

  componentDidMount() {
    // Update current position of user
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        this.setState({ latitude, longitude })
      },
      error => ToastAndroid.show(error.message, ToastAndroid.SHORT),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    )

    // Get all bus stops for line passed through the navigator parameters
    db
      .executeSql(
        'select COD_UBIC_P, LAT, LONG, DESC_LINEA from PARADAS left join BUS_STOP on ID = COD_UBIC_P where DESC_LINEA = ?;',
        [this.props.navigation.getParam('line')]
      )
      .then(({ rows: { _array } }) => this.setState({ busStops: _array }))
      .catch(error => ToastAndroid.show(error.message, ToastAndroid.LONG))
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID)
  }

  handleButtonPress = async () => {
    // Add all selected bus stops to the favorite table
    const busStops = Array.from(this.state.busStopsSelected)
    await Promise.all(busStops.map(async (stop) => {
      const stopVariants = await LightSTM.getOrUpdateStopVariants(stop.COD_UBIC_P)
      return LightSTM.addFavorite(stop.COD_UBIC_P, stop.DESC_LINEA, stopVariants)
    }))

    // Navigate to dashboard screen
    this.props.navigation.navigate('Dashboard')
  }

  handleMarkerPress = (e: any) => {
    // Find the pressed marker
    const selectedStopId: number = parseInt(e.nativeEvent.id, 10)
    console.log(`Touching stop with id ${selectedStopId}`)

    const stop = this.state.busStops.find(s => s.COD_UBIC_P === selectedStopId)

    //
    // If the marker could be found, add it or delete it from the selected bus stops set and
    // then update the state.
    //
    if (stop) {
      if (this.state.busStopsSelected.has(stop)) {
        this.state.busStopsSelected.delete(stop)
      } else {
        this.state.busStopsSelected.add(stop)
      }

      this.setState({ busStopsSelected: this.state.busStopsSelected })
    }
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
              latitudeDelta: 0.10142,
              longitudeDelta: 0.04631
            }}
            style={styles.map}
            onMarkerPress={this.handleMarkerPress}
            loadingEnabled
          >
            {this.state.busStops.map(stop => (
              <Marker
                identifier={stop.COD_UBIC_P.toString()}
                key={`${stop.COD_UBIC_P}${JSON.stringify(this.state.busStopsSelected.has(stop))}`}
                coordinate={{ latitude: stop.LAT, longitude: stop.LONG }}
                pinColor={
                  this.state.busStopsSelected.has(stop)
                    ? Colors.accentDark.hex()
                    : Colors.primaryDark.hex()
                }
              />
            ))}
          </MapView>
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
          onPress={this.handleButtonPress}
        >
          START!
        </Button>
      </View>
    )
  }
}
