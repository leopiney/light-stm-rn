// @flow
import React from "react";

import * as Progress from "react-native-progress";
import Colors from "../utils/colors";

export default (props: { loading: boolean, size: number }) =>
  props.loading ? (
    <Progress.Circle
      color={Colors.accent.string()}
      size={props.size}
      thickness={6}
      indeterminate
    />
  ) : null;
