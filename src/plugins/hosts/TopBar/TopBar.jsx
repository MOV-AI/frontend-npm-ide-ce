import PropTypes from "prop-types";
import React from "react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

const TopBar = props => {
  const { viewPlugins, hostName, style } = props;
  return (
    <div id={hostName} style={{ width: "100%", ...style }}>
      {viewPlugins}
    </div>
  );
};

export default withHostReactPlugin(TopBar);

TopBar.propTypes = {
  hostName: PropTypes.string.isRequired
};
