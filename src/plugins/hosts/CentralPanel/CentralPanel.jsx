import React from "react";
import { useHostReactPlugin } from "../../../ReactPlugin/HostReactPlugin";
import PropTypes from "prop-types";

const profile = (name, displayName = name) => ({
  name: name,
  displayName: displayName,
  description: "Central Panel",
  version: "1.0.0"
});

const CentralPanel = props => {
  const { name, displayName } = props;
  const children = useHostReactPlugin(profile(name, displayName));
  return <div style={{ ...props.style }}>{children}</div>;
};

CentralPanel.propTypes = {
  name: PropTypes.string.isRequired,
  displayName: PropTypes.string
};

export default CentralPanel;
