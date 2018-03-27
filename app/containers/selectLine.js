// @flow
import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import Button from 'react-native-button'

import Colors from '../utils/colors'
import GlobalStyles from '../utils/styles'

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundBlue.string(),
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
  title: {
    color: Colors.white.string(),
    fontSize: 48,
    textAlign: 'center'
  },
  subtitle: {
    color: Colors.white.string(),
    fontSize: 18,
    textAlign: 'center'
  },
  input: {
    backgroundColor: Colors.white.string(),
    borderRadius: 2,
    fontSize: 18,
    marginTop: 64,
    padding: 16,
    textAlign: 'center',
    width: 300
  }
})

type props = { navigation: Object }

type state = {
  text: string
}

export default class App extends React.Component<props, state> {
  constructor() {
    super()
    this.state = { text: '' }
  }

  props: {
    navigation: Object
  }

  handlePress = () => {
    this.props.navigation.navigate('LineMap', { line: this.state.text })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.containerText}>
          <Text style={styles.title}>Select your favorite line</Text>
          <Text style={styles.subtitle}>(You will be able to add more later)</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={15}
            multiline={false}
            onChangeText={(text: string) => this.setState({ text })}
            placeholder="For instance: 64, 111, 192, DM1"
            style={styles.input}
            underlineColorAndroid={Colors.transparent.string()}
            value={this.state.text}
          />
        </View>
        <Button style={GlobalStyles.button} onPress={this.handlePress}>
          CONTINUE
        </Button>
      </View>
    )
  }
}
