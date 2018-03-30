// @flow
import React from 'react'

import { StyleSheet, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

import Colors from '../utils/colors'

import LineEta from './lineETA'

type FavoriteBusStop = {
  DESC_LINEA: string,
  COD_UBIC_P: number,
  LAT: number,
  LONG: number
}

type props = {
  favorite: FavoriteBusStop
}

type state = {
  etas: Array<{
    line: string,
    etas: Array<string>
  }>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white.string(),
    borderRadius: 3,
    height: 304,
    margin: 4,
    overflow: 'hidden',
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: 'red',
    shadowOffset: { height: 0, width: 0 },
    width: '100%'
  },
  etasContainer: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    height: 104,
    justifyContent: 'space-around',
    marginTop: 12
  },
  map: {
    height: 200,
    width: '100%'
  }
})

export default class FavoriteCard extends React.Component<props, state> {
  constructor() {
    super()
    this.state = {
      etas: [
        { line: '192', etas: ['10 min', '18 min'] },
        { line: '169', etas: ['< 1 min', '14 min'] },
        { line: '110', etas: ['13 min'] }
      ]
    }
  }

  render() {
    const { favorite } = this.props
    return (
      <View elevation={1} style={styles.card}>
        <MapView
          initialRegion={{
            latitude: favorite.LAT,
            longitude: favorite.LONG,
            latitudeDelta: 0.005,
            longitudeDelta: 0.002
          }}
          liteMode
          zoomEnabled={false}
          zoomControlEnabled={false}
          rotateEnabled={false}
          scrollEnabled={false}
          pitchEnabled={false}
          loadingEnabled
          style={styles.map}
        >
          <Marker
            identifier={favorite.COD_UBIC_P.toString()}
            key={favorite.COD_UBIC_P}
            coordinate={{ latitude: favorite.LAT, longitude: favorite.LONG }}
            pinColor={Colors.accentDark.hex()}
          />
        </MapView>

        <View style={styles.etasContainer}>
          {this.state.etas &&
            this.state.etas.map(lineEta => (
              <LineEta key={lineEta.line} line={lineEta.line} etas={lineEta.etas} />
            ))}
        </View>
      </View>
    )
  }
}
