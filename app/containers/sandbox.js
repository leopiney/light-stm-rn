import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

import db from '../store/db'
import Colors from '../utils/colors'

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.primary.string(),
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: '15%',
    paddingRight: '15%'
  },
  containerText: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  welcome: {
    color: Colors.white.string(),
    fontSize: 14
  }
})

class Sandbox extends React.Component {
  state = {
    favorites: [],
    error: 'no error'
  }

  componentDidMount() {
    db
      .executeSql(
        'select COD_UBIC_P, DESC_LINEA, LAT, LONG from FAVORITES join BUS_STOP on ID = COD_UBIC_P limit 20;',
        []
      )
      .then(({ rows: { _array } }) => this.setState({ favorites: _array }))
      .catch(error => this.setState({ error }))
  }

  render() {
    const { error, favorites } = this.state

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Hello</Text>
        {favorites.map(({ COD_UBIC_P, DESC_LINEA }) => (
          <TouchableOpacity
            key={`${COD_UBIC_P}-${DESC_LINEA}`}
            style={{
              padding: 5,
              backgroundColor: 'white',
              borderColor: 'black',
              borderWidth: 1
            }}
          >
            <Text>
              {COD_UBIC_P},{DESC_LINEA}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.welcome}>{JSON.stringify(favorites)}</Text>
        <Text style={styles.welcome}>{error}</Text>
      </View>
    )
  }
}

export default Sandbox
