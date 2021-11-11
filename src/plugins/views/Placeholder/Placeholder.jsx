import React from "react";
import PropTypes from "prop-types";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";

const Placeholder = () => {
  return <></>;
};

export default withViewPlugin(Placeholder);

Placeholder.propTypes = {
  call: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};
