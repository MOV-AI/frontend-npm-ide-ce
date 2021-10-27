import { makeStyles } from "@mui/styles";
import PropTypes from "prop-types";
import React from "react";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";

const useStyles = makeStyles(() => ({
  icon: {
    color: "primary",
    "&:hover": {
      cursor: "pointer"
    }
  }
}));

const Explorer = ({ profile, call }) => {
  const classes = useStyles();
  return <h1>Explorer</h1>;
};

export default withViewPlugin(Explorer);

Explorer.propTypes = {
  call: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

Explorer.defaultProps = {
  profile: { name: "explorer" }
};
