// @flow
import React from "react";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";

import Colors from "../utils/colors";

const menuTriggerStyles = {
  triggerText: {
    color: Colors.black.fade(0.87).string(),
    fontSize: 24,
    textAlign: "center"
  }
};

export default (props: { style: any, onDelete: Function }) => (
  <Menu style={props.style}>
    <MenuTrigger customStyles={menuTriggerStyles} text="⋮" />
    <MenuOptions>
      <MenuOption onSelect={props.onDelete} text="Delete" />
    </MenuOptions>
  </Menu>
);
