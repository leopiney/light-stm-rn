import React from "react";
import { StackNavigator } from "react-navigation";
import { MenuProvider } from "react-native-popup-menu";

import Dashboard from "./app/containers/dashboard";
import LineMap from "./app/containers/lineMap";
import SelectLine from "./app/containers/selectLine";
import Splash from "./app/containers/splash";
import Start from "./app/containers/start";
import StopDetail from "./app/containers/stopDetail";

import { setUpDatabase } from "./app/store/db";
import Colors from "./app/utils/colors";

setUpDatabase();

const App = StackNavigator({
  Splash: { screen: Splash, navigationOptions: { header: null } },
  Dashboard: {
    screen: Dashboard,
    navigationOptions: {
      title: "LightSTM",
      headerStyle: {
        backgroundColor: Colors.primary.string()
      },
      headerTitleStyle: {
        color: Colors.white.string()
      }
    }
  },
  Home: { screen: Start, navigationOptions: { header: null } },
  LineMap: { screen: LineMap, navigationOptions: { header: null } },
  SelectLine: { screen: SelectLine, navigationOptions: { header: null } },
  StopDetail: { screen: StopDetail }
});

export default () => (
  <MenuProvider>
    <App />
  </MenuProvider>
);
