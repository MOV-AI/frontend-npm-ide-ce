import React from "react";
import loader from "./movai_red.svg";
import { makeStyles } from "@material-ui/core/styles";
import { LinearProgress } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    maxHeight: "100%",
    minHeight: "300px",
    position: "relative"
  },
  loaderContainer: {
    height: "100%",
    position: "absolute",
    textAlign: "center",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1051 // Must be greater than 1050 to be on top of floating buttons
  },
  loaderImage: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)"
  }
}));

const Loader = props => {
  // Style hook
  const classes = useStyles();
  // Render
  return (
    <div className={classes.root}>
      <div id="loader" className={classes.loaderContainer}>
        <div className={classes.loaderImage}>
          <img src={loader} alt="loading" width={200}></img>
          <LinearProgress color="secondary" style={{ marginTop: 20 }} />
        </div>
      </div>
    </div>
  );
};

export default Loader;
