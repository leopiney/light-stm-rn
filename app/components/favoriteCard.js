// @flow
import React from "react";

import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import LightSTM from "../api/lightSTM";
import Colors from "../utils/colors";
import Settings from "../utils/settings";
import type { BusETA, FavoriteBusStop, LineVariants } from "../utils/types";

import LineEta from "./lineETA";
import FavoriteCardMenu from "./favoriteCardMenu";
import Loading from "./loading";

type props = {
  stop: FavoriteBusStop,
  linesVariants: LineVariants[]
};

type state = {
  buses: BusETA[],
  etas: {
    [string]: number[]
  },
  deleted: boolean,
  loading: boolean
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white.string(),
    borderRadius: 3,
    height: 304,
    margin: 4,
    overflow: "hidden",
    position: "relative",
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
  },
  menu: {
    bottom: 0,
    position: "absolute",
    right: 0,
    width: 24
  }
});

export default class FavoriteCard extends React.Component<props, state> {
  constructor() {
    super();
    this.state = {
      buses: [],
      etas: {},
      deleted: false,
      loading: true
    };
  }

  componentDidMount() {
    this.updateETAs();
  }

  updateETAs = () => {
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

        setTimeout(() => {
          this.setState({ loading: true });
          this.updateETAs();
        }, Settings.ETA_UPDATE_RATE_MS);
      }
    );
  };

  map: ?Object;

  render() {
    if (this.state.deleted) {
      return null;
    }

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
          <Loading loading={this.state.loading} size={48} />

          {!this.state.loading &&
            this.props.linesVariants.map(lineVariants => (
              <LineEta
                key={lineVariants.line}
                line={lineVariants.line}
                etas={this.state.etas[lineVariants.line]}
              />
            ))}
        </View>

        <FavoriteCardMenu
          style={styles.menu}
          onDelete={async () => {
            await LightSTM.removeFavorite(stop.COD_UBIC_P);
            this.setState({ deleted: true });
          }}
        />
      </View>
    );
  }
}
