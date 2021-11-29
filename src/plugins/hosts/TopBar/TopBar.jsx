import PropTypes from "prop-types";
import * as React from "react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

const TopBar = props => {
  const { viewPlugins, hostName, style, className } = props;
  return (
    <div id={hostName} style={{ ...style }} className={className}>
      {viewPlugins}
    </div>
  );
};

export default withHostReactPlugin(TopBar);

TopBar.propTypes = {
  hostName: PropTypes.string.isRequired
};

TopBar.defaultProps = {
  hostName: "topBar"
};
