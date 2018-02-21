// @flow
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import Button from 'react-native-button'

import Colors from '../utils/colors'
import GlobalStyles from '../utils/styles'

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
    fontSize: 96 + 48
  },
  description: {
    color: Colors.white.string(),
    fontSize: 28,
    textAlign: 'center'
  }
})

export default class App extends React.Component {
  handlePress = () => {
    this.props.navigation.navigate('SelectLine')
  }

  props: {
    navigation: Object
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.containerText}>
          <Text style={styles.welcome}>HI!</Text>
          <Text style={styles.description}>
            Welcome to LightSTM, the application that focuses on the bus lines you use the most for
            commuting!
          </Text>
        </View>
        <Button style={GlobalStyles.button} onPress={this.handlePress}>
          GET STARTED
        </Button>
      </View>
    )
  }
}
