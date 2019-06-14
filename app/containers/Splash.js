// @flow
import React from "react";

import { NavigationActions, StackActions } from "react-navigation";
import * as SecureStore from "expo-secure-store";

type props = {
  navigation: Object
};

export default class Splash extends React.Component<props> {
  componentWillMount() {
    SecureStore.getItemAsync("app.onboardingFinished").then(value => {
      if (!value) {
        const resetAction = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Home" })]
        });
        this.props.navigation.dispatch(resetAction);
      } else {
        const resetAction = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Dashboard" })]
        });
        this.props.navigation.dispatch(resetAction);
      }
    });
  }

  render() {
    return null;
  }
}
