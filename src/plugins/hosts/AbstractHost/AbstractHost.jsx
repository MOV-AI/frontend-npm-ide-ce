import React from "react";
import PropTypes from "prop-types";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

const AbstractHost = props => {
  const { viewPlugins, hostName } = props;
  return <div id={hostName}>{viewPlugins}</div>;
};

export default withHostReactPlugin(AbstractHost);

AbstractHost.propTypes = {
  hostName: PropTypes.string.isRequired
};
