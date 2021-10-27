import PropTypes from "prop-types";
import * as React from "react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

function BottomBar(props) {
  const { viewPlugins, hostName , style} = props;
  return (
    <div id={hostName} style={{ ...style }}>
      {viewPlugins}
    </div>
  );
}

export default withHostReactPlugin(BottomBar);

BottomBar.propTypes = {
  hostName: PropTypes.string.isRequired
};

BottomBar.defaultProps = {
  hostName: "bottomBar"
};
