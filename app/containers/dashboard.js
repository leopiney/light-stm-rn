// @flow
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView
} from "react-native";
import { NavigationActions } from "react-navigation";

import LightSTM from "../api/lightSTM";
import Colors from "../utils/colors";
import type { FavoriteBusStop, LineVariants } from "../utils/types";

import FavoriteCard from "../components/favoriteCard";
import Loading from "../components/loading";

type props = {
  navigation: Object
};

type state = {
  favoriteStops: FavoriteBusStop[],
  favoriteStopsLines: {
    [number]: LineVariants[]
  },
  loading: boolean
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: Colors.whiteSmoke.string(),
    flex: 1,
    justifyContent: "flex-start",
    paddingLeft: "5%",
    paddingRight: "5%",
    paddingTop: "5%"
  },
  containerScroll: {
    backgroundColor: Colors.whiteSmoke.string(),
    flex: 1
  },
  add: {
    color: Colors.white.string(),
    fontSize: 16,
    lineHeight: 24,
    marginRight: 16
  }
});

export default class Dashboard extends React.Component<props, state> {
  constructor() {
    super();
    this.state = { favoriteStops: [], favoriteStopsLines: {}, loading: true };
  }

  componentDidMount() {
    LightSTM.getFavorites()
      .then(([favoriteStops, favoriteStopsLines]) => {
        console.log(
          `Got favorite stops ${JSON.stringify(
            favoriteStops
          )} with lines ${JSON.stringify(favoriteStopsLines)}`
        );
        this.setState({ favoriteStops, favoriteStopsLines, loading: false });
      })
      .catch(error => {
        const resetAction = NavigationActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: "Home" })]
        });
        this.props.navigation.dispatch(resetAction);
        console.log(error);
      });
  }

  static navigationOptions = (props: { navigation: Object }) => ({
    headerRight: (
      <TouchableOpacity onPress={() => props.navigation.navigate("SelectLine")}>
        <Text style={styles.add}>Add</Text>
      </TouchableOpacity>
    )
  });

  render() {
    const { favoriteStops, favoriteStopsLines } = this.state;

    return (
      <ScrollView style={styles.containerScroll}>
        <View style={styles.container}>
          <Loading loading={this.state.loading} size={48} />
          {!this.state.loading &&
            favoriteStops.map(stop => (
              <FavoriteCard
                key={`${stop.COD_UBIC_P}`}
                linesVariants={favoriteStopsLines[stop.COD_UBIC_P]}
                navigation={this.props.navigation}
                stop={stop}
              />
            ))}
        </View>
      </ScrollView>
    );
  }
}
