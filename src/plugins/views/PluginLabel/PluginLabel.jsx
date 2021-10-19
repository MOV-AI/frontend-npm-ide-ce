import React from "react";
import PropTypes from "prop-types";
import { withPlugin } from "../../../ReactPlugin/ViewReactPlugin";

const PluginLabel = ({ profile, random = "" }) => {
  return <h1>{`${profile.name} ${random}`}</h1>;
};

export default withPlugin(PluginLabel);

PluginLabel.propTypes = {
  call: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};
