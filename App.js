import React from "react";
import { StackNavigator } from "react-navigation";
import { MenuProvider } from "react-native-popup-menu";

import Dashboard from "./app/containers/Dashboard";
import LineMap from "./app/containers/LineMap";
import SelectLine from "./app/containers/SelectLine";
import Splash from "./app/containers/Splash";
import Start from "./app/containers/Start";
import StopDetail from "./app/containers/StopDetail";

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
