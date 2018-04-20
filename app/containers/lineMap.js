// @flow
import React from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";
import { NavigationActions } from "react-navigation";

import MapView, { Marker } from "react-native-maps";
import Button from "react-native-button";

import LightSTM from "../api/lightSTM";
import db from "../store/db";
import Colors from "../utils/colors";
import GlobalStyles from "../utils/styles";
import type { BusStop } from "../utils/types";

import Loading from "../components/loading";
import MapMarker from "../components/mapMarker";

type Region = {
  latitude: number,
  longitude: number,
  latitudeDelta: number,
  longitudeDelta: number
};

type props = {
  navigation: Object
};

type state = {
  busStops: BusStop[],
  busStopsSelected: Set<BusStop>,
  currentRegion: Region,
  loading: boolean,
  myLatitude: number,
  myLongitude: number
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: Colors.backgroundGrey.string(),
    flex: 1,
    justifyContent: "flex-end",
    paddingLeft: "15%",
    paddingRight: "15%"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  loading: {
    flex: 1,
    justifyContent: "center"
  }
});

const LATITUDE_DELTA = 0.0228195;
const LONGITUDE_DELTA = 0.01041975;

export default class App extends React.Component<props, state> {
  constructor() {
    super();
    this.state = {
      busStops: [],
      busStopsSelected: new Set(),
      currentRegion: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0
      },
      loading: true,
      myLatitude: 0,
      myLongitude: 0
    };
  }

  componentDidMount() {
    // Update current position of user
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        this.setState({
          myLatitude: latitude,
          myLongitude: longitude,
          currentRegion: {
            latitude,
            longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }
        });
      },
      error => ToastAndroid.show(error.message, ToastAndroid.SHORT),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    // Get all bus stops for line passed through the navigator parameters
    db
      .executeSql(
        "select COD_UBIC_P, LAT, LONG, DESC_LINEA from PARADAS left join BUS_STOP on ID = COD_UBIC_P where DESC_LINEA = ?;",
        [this.props.navigation.getParam("line")]
      )
      .then(({ rows: { _array } }) => this.setState({ busStops: _array }))
      .catch(error => ToastAndroid.show(error.message, ToastAndroid.LONG));
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  handleButtonPress = async () => {
    // Add all selected bus stops to the favorite table
    const busStops = Array.from(this.state.busStopsSelected);
    console.log(
      `Getting or updating stop variants for stops ${JSON.stringify(busStops)}`
    );
    await Promise.all(
      busStops.map(async stop => {
        const stopVariants = await LightSTM.getOrUpdateStopVariants(
          stop.COD_UBIC_P
        );
        return LightSTM.addFavorite(
          stop.COD_UBIC_P,
          stop.DESC_LINEA,
          stopVariants
        );
      })
    );

    // Navigate to dashboard screen
    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "Dashboard" })]
    });
    this.props.navigation.dispatch(resetAction);
  };

  handleMarkerPress = (e: any) => {
    // Find the pressed marker
    const selectedStopId: number = parseInt(e.nativeEvent.id, 10);
    console.log(`Touching stop with id ${selectedStopId}`);

    const stop = this.state.busStops.find(s => s.COD_UBIC_P === selectedStopId);

    //
    // If the marker could be found, add it or delete it from the selected bus stops set and
    // then update the state.
    //
    if (stop) {
      if (this.state.busStopsSelected.has(stop)) {
        this.state.busStopsSelected.delete(stop);
      } else {
        this.state.busStopsSelected.add(stop);
      }

      this.setState({ busStopsSelected: this.state.busStopsSelected });
    }
  };

  handleMapReady = () => {
    this.setState({ loading: false });
  };

  handleRegionChangeComplete = (currentRegion: Region) => {
    this.setState({ currentRegion });
  };

  watchID: number;

  render() {
    const isPositionReady =
      this.state.myLatitude !== 0 && this.state.myLongitude !== 0;
    return (
      <View style={styles.container}>
        {isPositionReady && (
          <MapView
            initialRegion={{
              latitude: this.state.myLatitude,
              longitude: this.state.myLongitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA
            }}
            onMarkerPress={this.handleMarkerPress}
            onMapReady={this.handleMapReady}
            onRegionChangeComplete={this.handleRegionChangeComplete}
            style={styles.map}
          >
            {this.state.busStops
              .filter(
                stop =>
                  Math.abs(this.state.currentRegion.latitude - stop.LAT) <
                    this.state.currentRegion.latitudeDelta / 2 &&
                  Math.abs(this.state.currentRegion.longitude - stop.LONG) <
                    this.state.currentRegion.longitudeDelta / 2
              )
              .map(stop => (
                <Marker
                  identifier={stop.COD_UBIC_P.toString()}
                  key={`${stop.LAT}${stop.LONG}${JSON.stringify(
                    this.state.busStopsSelected.has(stop)
                  )}`}
                  coordinate={{ latitude: stop.LAT, longitude: stop.LONG }}
                >
                  <MapMarker
                    text={stop.COD_UBIC_P}
                    isSelected={this.state.busStopsSelected.has(stop)}
                    isStop={true}
                  />
                </Marker>
              ))}
          </MapView>
        )}
        {this.state.loading && (
          <View style={styles.loading}>
            <Loading loading={!isPositionReady} size={60} />
          </View>
        )}
        <Button
          disabled={this.state.busStopsSelected.size === 0}
          style={GlobalStyles.button}
          styleDisabled={GlobalStyles.buttonDisabled}
          onPress={this.handleButtonPress}
        >
          START!
        </Button>
      </View>
    );
  }
}
