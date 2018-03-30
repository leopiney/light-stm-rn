// @flow
import React from 'react'
import { StyleSheet, View, ScrollView, ToastAndroid } from 'react-native'

import db from '../store/db'
import Colors from '../utils/colors'

import FavoriteCard from '../components/favoriteCard'

type FavoriteBusStop = {
  DESC_LINEA: string,
  COD_UBIC_P: number,
  LAT: number,
  LONG: number
}

type props = {}

type state = {
  favorites: Array<FavoriteBusStop>
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

export default class Sandbox extends React.Component<props, state> {
  constructor() {
    super()
    this.state = { favorites: [] }
  }

  componentWillMount() {
    db
      .executeSql(
        'select COD_UBIC_P, DESC_LINEA, LAT, LONG from FAVORITES join BUS_STOP on ID = COD_UBIC_P limit 20;',
        []
      )
      .then(({ rows: { _array } }) => this.setState({ favorites: _array }))
      .catch(error => ToastAndroid.show(error.message, ToastAndroid.LONG))
  }

  render() {
    const { favorites } = this.state

    return (
      <ScrollView>
        <View style={styles.container}>
          {favorites.map(favorite => (
            <FavoriteCard
              favorite={favorite}
              key={`${favorite.COD_UBIC_P}${favorite.DESC_LINEA}`}
            />
          ))}
        </View>
      </ScrollView>
    )
  }
}
