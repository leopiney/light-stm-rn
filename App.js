import React from 'react'
import { StackNavigator } from 'react-navigation'

import Start from './app/containers/start'
import SelectLine from './app/containers/selectLine'
import LineMap from './app/containers/lineMap'


const App = StackNavigator({
  Home: { screen: Start, navigationOptions: { header: null } },
  SelectLine: { screen: SelectLine, navigationOptions: { header: null } },
  LineMap: { screen: LineMap, navigationOptions: { header: null } },
})

export default () => (
  <App />
)
