import PropTypes from "prop-types";
import * as React from "react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

const AlertPanel = props => {
  const { viewPlugins, hostName, style, className } = props;
  return (
    <div id={hostName} style={{ ...style }} className={className}>
      {viewPlugins}
    </div>
  );
};

export default withHostReactPlugin(AlertPanel);

AlertPanel.propTypes = {
  hostName: PropTypes.string.isRequired
};

AlertPanel.defaultProps = {
  hostName: "alertPanel"
};
