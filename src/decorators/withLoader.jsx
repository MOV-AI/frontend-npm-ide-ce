import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Loader from "../plugins/views/editors/_shared/Loader/Loader";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    "& > div.container-Node": {
      overflow: "auto"
    }
  }
}));

/**
 * Render loader before document is ready
 * @param {*} Component
 * @returns
 */
const withLoader = Component => {
  return (props, ref) => {
    const { loading } = props;
    const classes = useStyles();

    return (
      <Typography component="div" className={classes.root}>
        {loading ? <Loader /> : <Component {...props} ref={ref} />}
      </Typography>
    );
  };
};

export default withLoader;
