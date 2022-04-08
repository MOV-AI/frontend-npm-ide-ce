import React from "react";
import PropTypes from "prop-types";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

function CentralPanel(props) {
  const { viewPlugins, hostName, style, className } = props;
  return (
    <div id={hostName} style={{ ...style }} className={className}>
      {viewPlugins}
    </div>
  );
}

export default withHostReactPlugin(CentralPanel);

CentralPanel.propTypes = {
  hostName: PropTypes.string.isRequired
};
