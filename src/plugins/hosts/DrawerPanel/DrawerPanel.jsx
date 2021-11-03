import { Drawer } from "@mui/material";
import { makeStyles } from "@mui/styles";
import PropTypes from "prop-types";
import React from "react";
import { withHostReactPlugin } from "../../../engine/ReactPlugin/HostReactPlugin";

const useStyles = (isLeft, isOpen) =>
  makeStyles({
    drawer: {
      overflow: "hidden",
      position: "relative",
      [isLeft ? "marginRight" : "marginLeft"]: "auto",
      width: isOpen ? 340 : "auto",
      height: "100%",
      "& .MuiBackdrop-root": {
        display: "none"
      },
      "& .MuiDrawer-paper": {
        width: 340,
        position: "absolute",
        transition: "none !important"
      }
    }
  });
function DrawerPanel(props) {
  const {
    viewPlugins,
    onTopic,
    hostName,
    style,
    anchor,
    height,
    initialOpenState
  } = props;
  const [open, setOpen] = React.useState(initialOpenState);
  const classes = useStyles(anchor === "left", open)({ height: height });

  React.useEffect(() => {
    // Handle drawer toggle
    onTopic(`toggle-${hostName}`, () => {
      setOpen(prevState => {
        return !prevState;
      });
    });
    // Handle dynamic drawer open
    onTopic(`open-${hostName}`, () => {
      setOpen(true);
    });
    // Handle dynamic drawer close
    onTopic(`close-${hostName}`, () => {
      setOpen(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTopic]);

  return (
    <Drawer
      id={hostName}
      style={{ ...style }}
      open={open}
      className={classes.drawer}
      variant="persistent"
      anchor={anchor}
    >
      {viewPlugins}
    </Drawer>
  );
}

export default withHostReactPlugin(DrawerPanel);

DrawerPanel.propTypes = {
  hostName: PropTypes.string.isRequired,
  initialOpenState: PropTypes.bool
};

DrawerPanel.defaultProps = {
  hostName: "drawer",
  initialOpenState: false
};
