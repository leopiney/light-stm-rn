// @flow
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "../utils/colors";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    position: "relative",
    width: 72
  },
  divider: {
    borderBottomColor: Colors.black.fade(0.87).string(),
    borderBottomWidth: 1,
    width: 72
  },
  line: {
    fontSize: 24,
    color: Colors.black.fade(0.13).string()
  },
  eta: {
    fontSize: 14,
    lineHeight: 24,
    color: Colors.black.fade(0.46).string()
  }
});

const Divider = () => <View style={styles.divider} />;

export default (props: { line: string, etas: number[] }) => (
  <View style={styles.container}>
    <Text style={styles.line}>{props.line}</Text>
    <Divider />
    {props.etas.length > 0 &&
      props.etas.map(eta => (
        <Text key={eta} style={styles.eta}>
          {Math.floor(eta / 60)} min
        </Text>
      ))}
    {props.etas.length === 0 && <Text style={styles.eta}>No ETA yet</Text>}
  </View>
);
