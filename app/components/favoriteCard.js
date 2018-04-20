// @flow
import React from "react";

import { StyleSheet, Text, View } from "react-native";

import LightSTM from "../api/lightSTM";
import Colors from "../utils/colors";
import Settings from "../utils/settings";
import type { BusETA, FavoriteBusStop, LineVariants } from "../utils/types";

import FavoriteCardMenu from "./favoriteCardMenu";
import LineEta from "./lineETA";
import Loading from "./loading";
import MapMarker from "./mapMarker";
import MapView from "./mapView";

type props = {
  linesVariants: LineVariants[],
  navigation: Object,
  stop: FavoriteBusStop
};

type state = {
  buses: BusETA[],
  error: string,
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
    shadowColor: Colors.black.string(),
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
  },
  error: {
    color: Colors.accentDark.string(),
    fontSize: 14,
    lineHeight: 24
  }
});

export default class FavoriteCard extends React.Component<props, state> {
  constructor() {
    super();
    this.state = {
      buses: [],
      error: "",
      etas: {},
      deleted: false,
      loading: true
    };
  }

  componentDidMount() {
    this.updateETAs();
  }

  componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  updateETAs = () => {
    const { stop, linesVariants } = this.props;

    LightSTM.getFavoriteNextETAs(stop.COD_UBIC_P, linesVariants)
      .then(nextETAs => {
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
          setTimeout(() => {
            const coordinates = nextETAs.map(bus => bus.coordinates);
            const { stop } = this.props;
            coordinates.push({ latitude: stop.LAT, longitude: stop.LONG });

            if (this.map) {
              this.map.fitToCoordinates(coordinates, {
                edgePadding: {
                  top: 20,
                  bottom: 20,
                  left: 20,
                  right: 20
                },
                animated: true
              });
            }
          });

        if (Settings.ETA_UPDATE_ENABLE) {
          this.timeout = setTimeout(() => {
            this.setState({ loading: true });
            this.updateETAs();
          }, Settings.ETA_UPDATE_RATE_MS);
        }
      })
      .catch(error => this.setState({ loading: false, error }));
  };

  map: ?Object;
  timeout: ?any;

  render() {
    if (this.state.deleted) {
      return null;
    }

    const { stop } = this.props;
    return (
      <View elevation={1} style={styles.card}>
        <MapView
          initialCoordinates={{
            latitude: stop.LAT,
            longitude: stop.LONG
          }}
          innerRef={map => {
            this.map = map;
          }}
          styles={styles.map}
          onPress={() =>
            this.props.navigation.navigate("StopDetail", {
              buses: this.state.buses,
              etas: this.state.etas,
              linesVariants: this.props.linesVariants,
              stop: this.props.stop,
              title: `Detail for stop ${this.props.stop.COD_UBIC_P}`
            })
          }
          type="static"
        >
          <MapMarker
            coordinate={{ latitude: stop.LAT, longitude: stop.LONG }}
            identifier={stop.COD_UBIC_P.toString()}
            isStop
            key={stop.COD_UBIC_P}
            text={stop.COD_UBIC_P}
          />
          {this.state.buses.map(bus => (
            <MapMarker
              coordinate={bus.coordinates}
              identifier={bus.code.toString()}
              key={bus.code.toString()}
              text={bus.line}
            />
          ))}
        </MapView>

        <View style={styles.etasContainer}>
          <Loading loading={this.state.loading} size={48} />

          {!this.state.loading &&
            !this.state.error &&
            this.props.linesVariants.map(lineVariants => (
              <LineEta
                key={lineVariants.line}
                line={lineVariants.line}
                etas={this.state.etas[lineVariants.line]}
              />
            ))}

          {!this.state.loading &&
            this.state.error.length > 0 && (
              <Text style={styles.error}>{this.state.error}</Text>
            )}
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
