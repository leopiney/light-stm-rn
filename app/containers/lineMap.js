// @flow
import React from 'react'
import { StyleSheet, ToastAndroid, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

import Button from 'react-native-button'
import * as Progress from 'react-native-progress'

import db from '../store/db'
import Colors from '../utils/colors'
import GlobalStyles from '../utils/styles'

type props = {
  navigation: Object
}

type state = {
  busStops: Array<{
    DESC_LINEA: string,
    COD_UBIC_P: number,
    LAT: number,
    LONG: number,
    IS_SELECTED: boolean
  }>,
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
    this.state = { busStops: [], latitude: 0, longitude: 0 }
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

    db
      .executeSql(
        'select COD_UBIC_P, LAT, LONG, DESC_LINEA from PARADAS left join BUS_STOP on ID = COD_UBIC_P where DESC_LINEA = ?;',
        [this.props.navigation.getParam('line')]
      )
      .then(({ rows: { _array } }) => this.setState({ busStops: _array }))
      .catch(error => ToastAndroid.show(error.message, ToastAndroid.SHORT))
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID)
  }

  handlePress = () => {
    this.state.busStops.forEach(async (stop) => {
      if (stop.IS_SELECTED) {
        const { rowsAffected } = await db.executeSql(
          'insert into FAVORITES (COD_UBIC_P, DESC_LINEA) values (?, ?)',
          [stop.COD_UBIC_P, stop.DESC_LINEA]
        )
        console.log(`Inserted favorite ${stop.COD_UBIC_P}/${stop.DESC_LINEA} with result ${rowsAffected}`)
      }
    })
    this.props.navigation.navigate('Sandbox')
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
            onMarkerPress={(e) => {
              const selectedId = e.nativeEvent.id
              const s = this.state.busStops.find(stop => stop.COD_UBIC_P.toString() === selectedId)

              if (s) {
                s.IS_SELECTED = !s.IS_SELECTED
                this.setState({ busStops: this.state.busStops })
              }
            }}
          >
            {this.state.busStops.map(stop => (
              <Marker
                identifier={stop.COD_UBIC_P.toString()}
                key={stop.COD_UBIC_P}
                coordinate={{ latitude: stop.LAT, longitude: stop.LONG }}
                pinColor={stop.IS_SELECTED ? '#f00' : '#00f'}
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
          onPress={this.handlePress}
        >
          START!
        </Button>
      </View>
    )
  }
}
