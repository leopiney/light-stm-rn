// @flow
import React from "react";

import MapView from "react-native-maps";

import type { LatLng, Region } from "../utils/types";

const fullMapOptions = {
  loadingEnabled: true
};

const staticMapOptions = {
  liteMode: true,
  loadingEnabled: true,
  pitchEnabled: false,
  rotateEnabled: false,
  scrollEnabled: false,
  zoomControlEnabled: false,
  zoomEnabled: false
};

export default (props: {
  children: any[],
  initialCoordinates: LatLng,
  innerRef?: any => void,
  onMapReady?: () => void,
  onMarkerPress?: any => void,
  onPress?: () => void,
  onRegionChangeComplete?: Region => void,
  styles: any,
  type: "static" | "full"
}) => {
  const options = props.type === "static" ? staticMapOptions : fullMapOptions;

  return (
    <MapView
      initialRegion={{
        ...props.initialCoordinates,
        latitudeDelta: props.type === "static" ? 0.005 : 0.0228195,
        longitudeDelta: props.type === "static" ? 0.002 : 0.01041975
      }}
      style={props.styles}
      ref={props.innerRef}
      onPress={props.onPress}
      onMarkerPress={props.onMarkerPress}
      onMapReady={props.onMapReady}
      onRegionChangeComplete={props.onRegionChangeComplete}
      {...options}
    >
      {props.children}
    </MapView>
  );
};
