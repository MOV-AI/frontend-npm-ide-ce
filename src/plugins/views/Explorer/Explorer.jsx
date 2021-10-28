import { Button } from "@material-ui/core";
// import { makeStyles } from "@mui/styles";
import PropTypes from "prop-types";
import React from "react";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";

// const useStyles = makeStyles(() => ({
//   icon: {
//     color: "primary",
//     "&:hover": {
//       cursor: "pointer"
//     }
//   }
// }));

const Explorer = ({ profile, call, on, emit, onTopic }) => {
  //   const classes = useStyles();

  return (
    <>
      <h1>Explorer</h1>
      <Button
        onClick={() => {
          const id = `tab-${Math.floor(10 * Math.random())}`;
          call("tabs", "open", {
            id: id,
            title: id,
            content: <div>Hello World {id}</div>
          });
        }}
        color="primary"
        variant="outlined"
      >
        {"button"}
      </Button>
    </>
  );
};

export default withViewPlugin(Explorer);

Explorer.propTypes = {
  call: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

Explorer.defaultProps = {
  profile: { name: "explorer" }
};
