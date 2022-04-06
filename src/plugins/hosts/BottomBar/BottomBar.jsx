import React from "react";
import PropTypes from "prop-types";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

function BottomBar(props) {
  const { viewPlugins, hostName, style, className } = props;
  return (
    <div id={hostName} style={{ ...style }} className={className}>
      {viewPlugins}
    </div>
  );
}

export default withHostReactPlugin(BottomBar);

BottomBar.propTypes = {
  hostName: PropTypes.string.isRequired
};
