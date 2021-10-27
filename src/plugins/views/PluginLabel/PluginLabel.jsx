import React from "react";
import PropTypes from "prop-types";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";

const PluginLabel = ({ profile, random = "" }) => {
  return <h1>{`${profile.name} ${random}`}</h1>;
};

export default withViewPlugin(PluginLabel);

PluginLabel.propTypes = {
  call: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};
