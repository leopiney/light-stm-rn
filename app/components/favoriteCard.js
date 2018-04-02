// @flow
import React from 'react'

import { StyleSheet, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

import LightSTM from '../api/lightSTM'
import Colors from '../utils/colors'
import type { FavoriteBusStop, LineVariants } from '../utils/types'

import LineEta from './lineETA'

type props = {
  stop: FavoriteBusStop,
  linesVariants: LineVariants[]
}

type state = {
  etas: {
    line: string,
    etas: string[]
  }[]
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

  componentDidMount() {
    const { stop, linesVariants } = this.props

    LightSTM.getFavoriteNextETAs(stop.COD_UBIC_P, linesVariants).then((nextETAs) => {
      const etas = nextETAs.map(eta => ({ line: eta.line, etas: [eta.eta.toString()] }))
      this.setState({ etas })
    })
  }

  render() {
    const { stop } = this.props
    return (
      <View elevation={1} style={styles.card}>
        <MapView
          initialRegion={{
            latitude: stop.LAT,
            longitude: stop.LONG,
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
            identifier={stop.COD_UBIC_P.toString()}
            key={stop.COD_UBIC_P}
            coordinate={{ latitude: stop.LAT, longitude: stop.LONG }}
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
