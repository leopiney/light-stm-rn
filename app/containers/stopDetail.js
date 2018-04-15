// @flow
import React from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";

import MapView, { Marker } from "react-native-maps";

import LightSTM from "../api/lightSTM";
import Colors from "../utils/colors";
import Settings from "../utils/settings";
import type { BusETA, FavoriteBusStop, LineVariants } from "../utils/types";

import Loading from "../components/loading";
import MapMarker from "../components/mapMarker";

type props = {
  navigation: Object
};

type state = {
  buses: BusETA[],
  etas: {
    [string]: number[]
  },
  latitude: number,
  linesVariants: LineVariants[],
  longitude: number,
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
  },
  loading: {
    flex: 1,
    justifyContent: "center"
  }
});

export default class App extends React.Component<props, state> {
  constructor() {
    super();
    this.state = {
      buses: [],
      etas: {},
      latitude: 0,
      linesVariants: [],
      longitude: 0,
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

    // Update current position of user
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        this.setState({ latitude, longitude });
      },
      error => ToastAndroid.show(error.message, ToastAndroid.SHORT),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

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

    LightSTM.getFavoriteNextETAs(stop.COD_UBIC_P, linesVariants).then(
      nextETAs => {
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
          setTimeout(() => this.map && this.map.fitToElements(true));

        this.triggerETAs();
      }
    );
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
    const isPositionReady =
      this.state.latitude !== 0 && this.state.longitude !== 0;

    return (
      <View style={styles.container}>
        {isPositionReady && (
          <MapView
            initialRegion={{
              latitude: this.state.latitude,
              longitude: this.state.longitude,
              latitudeDelta: 0.10142,
              longitudeDelta: 0.04631
            }}
            style={styles.map}
            onMarkerPress={this.handleMarkerPress}
            ref={map => {
              this.map = map;
            }}
          >
            {this.state.stop.COD_UBIC_P && (
              <Marker
                identifier={this.state.stop.COD_UBIC_P.toString()}
                key={this.state.stop.COD_UBIC_P}
                coordinate={{
                  latitude: this.state.stop.LAT,
                  longitude: this.state.stop.LONG
                }}
                pinColor={Colors.accentDark.hex()}
              >
                <MapMarker text={this.state.stop.COD_UBIC_P} isStop />
              </Marker>
            )}
            {this.state.buses.map(bus => (
              <Marker
                identifier={bus.code.toString()}
                key={bus.code.toString()}
                coordinate={bus.coordinates}
              >
                <MapMarker text={bus.line} />
              </Marker>
            ))}
          </MapView>
        )}
        {!isPositionReady && (
          <View style={styles.loading}>
            <Loading loading={!isPositionReady} size={60} />
          </View>
        )}
      </View>
    );
  }
}
