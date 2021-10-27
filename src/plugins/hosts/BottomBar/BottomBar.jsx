import PropTypes from "prop-types";
import * as React from "react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

function BottomBar(props) {
  const { viewPlugins, hostName } = props;
  return <div id={hostName}>{viewPlugins}</div>;
}

export default withHostReactPlugin(BottomBar);

BottomBar.propTypes = {
  hostName: PropTypes.string.isRequired
};

BottomBar.defaultProps = {
  hostName: "bottomBar"
};
