import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import { withPlugin } from "../../../ReactPlugin/ViewReactPlugin";

const PluginButton = props => {
  return <Button variant="outlined">Generate Data {props.profile.name}</Button>;
};

export default withPlugin(PluginButton);

PluginButton.propTypes = {
  call: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};
