// @flow
import React from "react";

import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";

import Colors from "../utils/colors";
import type { LatLng } from "../utils/types";

const styles = StyleSheet.create({
  marker: {
    alignItems: "center",
    justifyContent: "center"
  },
  text: { color: Colors.white.string(), fontSize: 10 }
});

const MarkerIcon = (props: {
  text: string | number,
  isStop?: boolean,
  isSelected?: boolean
}) => (
  <View style={styles.marker} elevation={1}>
    <View
      style={{
        backgroundColor: props.isStop
          ? props.isSelected
            ? Colors.accentDark.string()
            : Colors.primaryDark.string()
          : Colors.accentDark.string(),
        borderRadius: 3,
        padding: 4
      }}
    >
      <Text style={styles.text}>
        {props.isSelected ? `·${props.text}·` : props.text}
      </Text>
    </View>
    <View
      style={{
        backgroundColor: props.isStop
          ? props.isSelected
            ? Colors.accentDark.string()
            : Colors.primaryDark.string()
          : Colors.accentDark.string(),
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
        height: 12,
        width: 4
      }}
    />
  </View>
);

export default (props: {
  coordinate: LatLng,
  identifier: string,
  text: string | number,
  isSelected?: boolean,
  isStop?: boolean
}) => (
  <Marker identifier={props.identifier} coordinate={props.coordinate}>
    <MarkerIcon
      text={props.text}
      isStop={props.isStop}
      isSelected={props.isSelected}
    />
  </Marker>
);
