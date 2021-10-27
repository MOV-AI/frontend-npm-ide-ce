import PropTypes from "prop-types";
import React from "react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

function SidePanel(props) {
  const { viewPlugins, hostName } = props;
  return <div id={hostName}>{viewPlugins}</div>;
}

export default withHostReactPlugin(SidePanel);

SidePanel.propTypes = {
  hostName: PropTypes.string.isRequired
};

SidePanel.defaultProps = {
  hostName: "topBar"
};
