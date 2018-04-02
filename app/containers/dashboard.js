// @flow
import React from 'react'
import { StyleSheet, View, ScrollView, ToastAndroid } from 'react-native'

import LightSTM from '../api/lightSTM'
import Colors from '../utils/colors'

import FavoriteCard from '../components/favoriteCard'

type FavoriteBusStop = {
  COD_UBIC_P: number,
  LAT: number,
  LONG: number
}

type LineVariants = {
  line: string,
  variantsCodes: Array<number>,
  variantsDescriptions: Array<string>
}

type props = {}

type state = {
  favoriteStops: Array<FavoriteBusStop>,
  favoriteStopsLines: {
    [number]: Array<LineVariants>
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.whiteSmoke.string(),
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: '5%',
    paddingRight: '5%',
    paddingTop: '5%'
  }
})

export default class Dashboard extends React.Component<props, state> {
  constructor() {
    super()
    this.state = { favoriteStops: [], favoriteStopsLines: {} }
  }

  componentDidMount() {
    LightSTM.getFavorites()
      .then(([favoriteStops, favoriteStopsLines]) => {
        console.log(`Got favorite stops ${JSON.stringify(favoriteStops)} with lines ${JSON.stringify(favoriteStopsLines)}`)
        this.setState({ favoriteStops, favoriteStopsLines })
      })
      .catch(error => ToastAndroid.show(error.message, ToastAndroid.LONG))
  }

  render() {
    const { favoriteStops, favoriteStopsLines } = this.state

    return (
      <ScrollView>
        <View style={styles.container}>
          {favoriteStops.map(stop => (
            <FavoriteCard
              stop={stop}
              linesVariants={favoriteStopsLines[stop.COD_UBIC_P]}
              key={`${stop.COD_UBIC_P}`}
            />
          ))}
        </View>
      </ScrollView>
    )
  }
}
