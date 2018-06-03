// @flow
import React from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";

import { getFavoriteNextETAs } from "../api/lightSTM";
import Colors from "../utils/colors";
import Settings from "../utils/settings";
import type { BusETA, FavoriteBusStop, LineVariants } from "../utils/types";

import MapMarker from "../components/MapMarker";
import MapView from "../components/MapView";

type props = {
  navigation: Object
};

type state = {
  buses: BusETA[],
  etas: {
    [string]: number[]
  },
  linesVariants: LineVariants[],
  stop: FavoriteBusStop
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: Colors.backgroundGrey.string(),
    flex: 1,
    justifyContent: "flex-end"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});

export default class App extends React.Component<props, state> {
  constructor() {
    super();
    this.state = {
      buses: [],
      etas: {},
      linesVariants: [],
      stop: {
        COD_UBIC_P: 0,
        LAT: 0,
        LONG: 0
      }
    };
  }

  componentDidMount() {
    this.setState({
      buses: this.props.navigation.getParam("buses"),
      etas: this.props.navigation.getParam("etas"),
      linesVariants: this.props.navigation.getParam("linesVariants"),
      stop: this.props.navigation.getParam("stop")
    });

    this.triggerETAs();
  }

  triggerETAs = () => {
    if (Settings.ETA_UPDATE_ENABLE) {
      this.timeout = setTimeout(() => {
        this.updateETAs();
      }, Settings.ETA_UPDATE_RATE_MS);
    }
  };

  //
  // TODO: Centralize this code somewhere. Try using unstated or reflux instead
  //
  updateETAs = () => {
    const { stop, linesVariants } = this.state;

    getFavoriteNextETAs(stop.COD_UBIC_P, linesVariants)
      .then(nextETAs => {
        const etas: { [string]: number[] } = {};
        this.state.linesVariants.forEach(l => {
          etas[l.line] = [];
        });

        nextETAs.forEach(nextEta => {
          etas[nextEta.line].push(nextEta.eta);
        });

        console.log(`Setting ETAs: ${JSON.stringify(etas)}`);
        this.setState({ buses: nextETAs, etas });

        if (nextETAs.length > 0)
          setTimeout(() => {
            const coordinates = nextETAs.map(bus => bus.coordinates);
            const { stop } = this.state;
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

        this.triggerETAs();
      })
      .catch(error => ToastAndroid.show(error.message, ToastAndroid.SHORT));
  };

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
    if (this.timeout) clearTimeout(this.timeout);
  }

  handleMarkerPress = (e: any) => {
    // Find the pressed marker
    console.log(`Touching bus with id ${e.nativeEvent.id}`);
  };

  static navigationOptions = (props: { navigation: Object }) => ({
    title: `${props.navigation.state.params.title}`,
    headerTitleStyle: { textAlign: "center", alignSelf: "center" },
    headerStyle: {
      backgroundColor: Colors.primary.string()
    },
    headerTintColor: Colors.white.string()
  });

  map: ?Object;
  timeout: ?any;
  watchID: number;

  render() {
    return (
      <View style={styles.container}>
        <MapView
          initialCoordinates={{
            latitude: this.state.stop.LAT,
            longitude: this.state.stop.LONG
          }}
          innerRef={map => {
            this.map = map;
          }}
          styles={styles.map}
          onMarkerPress={this.handleMarkerPress}
          type="full"
        >
          {this.state.stop.COD_UBIC_P && (
            <MapMarker
              coordinate={{
                latitude: this.state.stop.LAT,
                longitude: this.state.stop.LONG
              }}
              identifier={this.state.stop.COD_UBIC_P.toString()}
              isStop={true}
              key={this.state.stop.COD_UBIC_P}
              pinColor={Colors.accentDark.hex()}
              text={this.state.stop.COD_UBIC_P}
            />
          )}
          {this.state.buses.map(bus => (
            <MapMarker
              coordinate={bus.coordinates}
              identifier={bus.code.toString()}
              key={bus.code.toString()}
              text={bus.line}
            />
          ))}
        </MapView>
      </View>
    );
  }
}
