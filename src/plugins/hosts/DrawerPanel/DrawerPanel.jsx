import { Drawer, makeStyles } from "@mui/material";
import PropTypes from "prop-types";
import React from "react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

const useStyles = makeStyles({
  drawer: {
    position: "relative",
    marginLeft: "auto",
    width: 200,
    "& .MuiBackdrop-root": {
      display: "none"
    },
    "& .MuiDrawer-paper": {
      width: 200,
      position: "absolute",
      height: ({ height }) => height,
      transition: "none !important"
    }
  }
});

function DrawerPanel(props) {
  const { viewPlugins, hostName, style } = props;
  const classes = useStyles();
  return (
    <Drawer
      id={hostName}
      style={{ ...style }}
      open={true}
      className={classes.drawer}
      variant="persistent"
      anchor="right"
    >
      {viewPlugins}
    </Drawer>
  );
}

export default withHostReactPlugin(DrawerPanel);

DrawerPanel.propTypes = {
  hostName: PropTypes.string.isRequired
};

DrawerPanel.defaultProps = {
  hostName: "topBar"
};
