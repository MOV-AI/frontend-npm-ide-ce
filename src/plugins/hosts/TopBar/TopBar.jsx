import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { useHostReactPlugin } from "../../../ReactPlugin/HostReactPlugin";

const profile = (name, displayName = name) => ({
  name: name,
  displayName: displayName,
  description: "Side Panel",
  version: "1.0.0"
});

function TopBar(props) {
  const { name, displayName } = props;
  const elements = useHostReactPlugin(profile(name, displayName));
  return (
    <Box sx={{ ...props.style }}>
      <AppBar position="static">
        <Toolbar>{elements}</Toolbar>
      </AppBar>
    </Box>
  );
}

export default TopBar;
