import PropTypes from "prop-types";
import * as React from "react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

function TopBar(props) {
  const { viewPlugins, hostName, style } = props;
  return (
    <div id={hostName} style={{ ...style }}>
      {viewPlugins}
    </div>
  );
}

export default withHostReactPlugin(TopBar);

TopBar.propTypes = {
  hostName: PropTypes.string.isRequired
};

TopBar.defaultProps = {
  hostName: "topBar"
};
