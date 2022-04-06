import React, { forwardRef } from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Loader from "../plugins/views/editors/_shared/Loader/Loader";

const useStyles = makeStyles(_ => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    "& > div[class^='container-']": {
      height: "100%"
    },
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
  const RefComponent =
    typeof Component === "function"
      ? forwardRef((props, ref) => Component(props, ref))
      : Component;

  return (props, ref) => {
    const { loading } = props;
    const classes = useStyles();

    return (
      <Typography component="div" className={classes.root}>
        {loading ? <Loader /> : <RefComponent {...props} ref={ref} />}
      </Typography>
    );
  };
};

export default withLoader;
