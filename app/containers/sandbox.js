import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

import db from '../store/db'
import Colors from '../utils/colors'

// const dbAsset = Expo.Asset.fromModule(require('../../assets/stm.db'))

// const db = SQLite.openDatabase(dbAsset.localUri)
// const db = SQLite.openDatabase('../../assets/stm.db')

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
    items: [],
    error: 'no error'
  }

  componentDidMount() {
    db
      .executeSql('select * from FAVORITES limit 20;', [])
      .then(({ rows: { _array } }) => this.setState({ items: _array }))
      .catch(error => this.setState({ error }))
  }

  render() {
    const { error, items } = this.state

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Hello</Text>
        {items.map(({ ID, COD_UBIC_P, DESC_LINEA }) => (
          <TouchableOpacity
            key={ID}
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
        <Text style={styles.welcome}>{JSON.stringify(items)}</Text>
        <Text style={styles.welcome}>{error}</Text>
      </View>
    )
  }
}

export default Sandbox
