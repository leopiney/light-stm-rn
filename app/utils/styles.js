// @flow
import { StyleSheet } from "react-native";

import Colors from "../utils/colors";

export default StyleSheet.create({
  button: {
    backgroundColor: Colors.accent.string(),
    color: Colors.white.string(),
    fontSize: 12,
    marginBottom: 32,
    paddingBottom: 24,
    paddingTop: 24,
    width: 300
  },
  buttonDisabled: {
    backgroundColor: Colors.accent.grayscale().string(),
    color: Colors.white.string(),
    fontSize: 12,
    marginBottom: 32,
    paddingBottom: 24,
    paddingTop: 24,
    width: 300
  }
});
