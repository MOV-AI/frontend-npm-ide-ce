import { Drawer } from "@mui/material";
import React from "react";
import { withHostReactPlugin } from "../../../ReactPlugin/HostReactPlugin";
import PropTypes from "prop-types";

const SidePanel = props => {
  const { anchor = "left", viewPlugins } = props;
  return (
    <Drawer
      variant="permanent"
      sx={{
        "& .MuiDrawer-paper": { boxSizing: "border-box", width: "200px" },
        ...props.style
      }}
      open
      anchor={anchor}
    >
      {viewPlugins}
    </Drawer>
  );
};

SidePanel.propTypes = {
  name: PropTypes.string.isRequired,
  displayName: PropTypes.string
};

export default withHostReactPlugin(SidePanel);
