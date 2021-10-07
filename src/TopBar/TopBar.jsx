import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { HostPlugin } from "@remixproject/engine-web";


// Host plugin display
class AbstractHost extends HostPlugin {
  constructor(name, addViewCb = () => {}, removeViewCb = () => {}) {
    super({ name });
    this.addViewCb = addViewCb;
    this.removeViewCb = removeViewCb;
  }
  addView(profile, view) {
    this.addViewCb(profile, view);
  }
  focus(name) {}

  currentFocus() {
    return this.name;
  }

  removeView(profile) {
    this.removeViewCb(profile);
  }
}

function TopBar({ engine, manager }) {
  const elements = useHostPlugin("topbar", engine, manager);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>{elements}</Toolbar>
      </AppBar>
    </Box>
  );
}

const useHostPlugin = (name, engine, manager) => {
  const [elements, setElements] = React.useState([]);
  const addViewCb = (profile, view) => {
    console.log("Debug add view cb");
    setElements(view);
  };
  const removeViewCb = () => {};
  const plugin = React.useRef(new AbstractHost(name, addViewCb, removeViewCb));

  React.useEffect(() => {
    // Register both plugins
    console.log("debug use effect");
    engine.register(plugin.current);
    manager.activatePlugin(name);
  }, [name, engine, manager]);
  return elements;
};

export default TopBar;
