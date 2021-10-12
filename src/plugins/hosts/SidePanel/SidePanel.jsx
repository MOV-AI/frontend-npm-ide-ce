import { Drawer } from "@mui/material";
import React from "react";
import { useHostReactPlugin } from "../../../ReactPlugin/HostReactPlugin";
import PropTypes from "prop-types";

const profile = (name, displayName = name) => ({
  name: name,
  displayName: displayName,
  description: "Side Panel",
  version: "1.0.0"
});

const SidePanel = props => {
  const { name, displayName, anchor = "left" } = props;
  const children = useHostReactPlugin(profile(name, displayName));
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
      {children}
    </Drawer>
  );
};

SidePanel.propTypes = {
  name: PropTypes.string.isRequired,
  displayName: PropTypes.string
};
export default SidePanel;
