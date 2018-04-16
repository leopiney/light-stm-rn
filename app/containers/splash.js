// @flow
import React from "react";

import { NavigationActions } from "react-navigation";
import { SecureStore } from "expo";

type props = {
  navigation: Object
};

export default class Splash extends React.Component<props> {
  componentWillMount() {
    SecureStore.getItemAsync("app.onboardingFinished").then(value => {
      if (!value) {
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Home" })]
        });
        this.props.navigation.dispatch(resetAction);
      } else {
        const resetAction = NavigationActions.reset({
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
