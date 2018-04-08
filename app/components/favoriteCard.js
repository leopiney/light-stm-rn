// @flow
import React from "react";

import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Progress from "react-native-progress";

import LightSTM from "../api/lightSTM";
import Colors from "../utils/colors";
import type { BusETA, FavoriteBusStop, LineVariants } from "../utils/types";

import LineEta from "./lineETA";

type props = {
  stop: FavoriteBusStop,
  linesVariants: LineVariants[]
};

type state = {
  buses: BusETA[],
  etas: {
    [string]: number[]
  },
  loading: boolean
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white.string(),
    borderRadius: 3,
    height: 304,
    margin: 4,
    overflow: "hidden",
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: "red",
    shadowOffset: { height: 0, width: 0 },
    width: "100%"
  },
  etasContainer: {
    alignItems: "flex-start",
    flex: 1,
    flexDirection: "row",
    height: 104,
    justifyContent: "space-around",
    marginTop: 12
  },
  map: {
    height: 200,
    width: "100%"
  }
});

export default class FavoriteCard extends React.Component<props, state> {
  constructor() {
    super();
    this.state = {
      buses: [],
      etas: {},
      loading: true
    };
  }

  componentDidMount() {
    const { stop, linesVariants } = this.props;

    LightSTM.getFavoriteNextETAs(stop.COD_UBIC_P, linesVariants).then(
      nextETAs => {
        const etas: { [string]: number[] } = {};
        this.props.linesVariants.forEach(l => {
          etas[l.line] = [];
        });

        nextETAs.forEach(nextEta => {
          etas[nextEta.line].push(nextEta.eta);
        });

        console.log(`Setting ETAs: ${JSON.stringify(etas)}`);
        this.setState({ buses: nextETAs, etas, loading: false });

        if (nextETAs.length > 0)
          setTimeout(() => this.map && this.map.fitToElements(true));
      }
    );
  }

  map: ?Object;

  render() {
    const { stop } = this.props;
    return (
      <View elevation={1} style={styles.card}>
        <MapView
          initialRegion={{
            latitude: stop.LAT,
            longitude: stop.LONG,
            latitudeDelta: 0.005,
            longitudeDelta: 0.002
          }}
          liteMode
          zoomEnabled={false}
          zoomControlEnabled={false}
          rotateEnabled={false}
          scrollEnabled={false}
          pitchEnabled={false}
          loadingEnabled
          style={styles.map}
          ref={map => {
            this.map = map;
          }}
        >
          <Marker
            identifier={stop.COD_UBIC_P.toString()}
            key={stop.COD_UBIC_P}
            coordinate={{ latitude: stop.LAT, longitude: stop.LONG }}
            pinColor={Colors.accentDark.hex()}
          />
          {this.state.buses.map(bus => (
            <Marker
              identifier={bus.code.toString()}
              key={bus.code.toString()}
              coordinate={bus.coordinates}
              pinColor={Colors.primaryDark.hex()}
            />
          ))}
        </MapView>

        <View style={styles.etasContainer}>
          {this.state.loading && (
            <Progress.Circle
              color={Colors.accent.string()}
              size={48}
              thickness={6}
              indeterminate
            />
          )}
          {!this.state.loading &&
            this.props.linesVariants.map(lineVariants => (
              <LineEta
                key={lineVariants.line}
                line={lineVariants.line}
                etas={this.state.etas[lineVariants.line]}
              />
            ))}
        </View>
      </View>
    );
  }
}
