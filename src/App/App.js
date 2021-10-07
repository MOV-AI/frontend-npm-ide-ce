import { Engine, PluginManager } from "@remixproject/engine";
import TopBar from "../TopBar/TopBar";
import "./App.css";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { ViewPlugin } from "@remixproject/engine-web";

window.engine = new Engine();
window.manager = new PluginManager();
window.engine.register(window.manager);

function withPlugin(ReactComponent) {
  const WithPlugin = class extends ViewPlugin {
    constructor(name, location) {
      super({ name, location });
    }
    render() {
      console.log("debug render with plugin");
      return ReactComponent({ call: this.call });
    }
  };
  return (name, location) => {
    const plugin = new WithPlugin(name, location);
    window.engine.register(plugin);
    window.manager.activatePlugin(name);
    return plugin;
  };
}

const getElements = ({ call }) => {
  return (
    <>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2 }}
        onClick={() => {
          call("tabs", "open");
        }}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        News
      </Typography>
      <Button color="inherit">Login</Button>
    </>
  );
};

setTimeout(() => withPlugin(getElements)("buttons", "topbar"), 5000);

function App() {
  console.log(MOVAI_LOGO);
  const hosts = (
    <TopBar engine={window.engine} manager={window.manager}></TopBar>
  );
  return hosts;
}

const MOVAI_LOGO = `
███╗   ███╗ ████████╗ ██╗   ██╗         █████╗ ██╗ 
████╗ ████║ ██║   ██║ ██║   ██║        ██╔══██╗██║
██╔████╔██║ ██║   ██║ ██║   ██║ █████╗ ███████║██║
██║╚██╔╝██║ ██║   ██║  █║  ██╔╝ ╚════╝ ██╔══██║██║
██║ ╚═╝ ██║ ╚██████═╝   ╚███═╝         ██║  ██║██║
`;

export default App;
