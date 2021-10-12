import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { useHostReactPlugin } from "../../../ReactPlugin/HostReactPlugin";

const profile = {
  name: "topbar",
  displayName: "Top Bar",
  description: "Top bar host",
  version: "1.0.0"
};

function TopBar(props) {
  const elements = useHostReactPlugin(profile);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>{elements}</Toolbar>
      </AppBar>
    </Box>
  );
}

export default TopBar;
