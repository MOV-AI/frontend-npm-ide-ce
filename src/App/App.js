import Grid from "@mui/material/Grid";
import React from "react";
import PluginManagerIDE from "../engine/PluginManagerIDE/PluginManagerIDE";
import BottomBar from "../plugins/hosts/BottomBar/BottomBar";
import CentralPanel from "../plugins/hosts/CentralPanel/CentralPanel";
import DrawerPanel from "../plugins/hosts/DrawerPanel/DrawerPanel";
import SidePanel from "../plugins/hosts/SidePanel/SidePanel";
import TopBar from "../plugins/hosts/TopBar/TopBar";
import Explorer from "../plugins/views/Explorer/Explorer";
import MainMenu from "../plugins/views/MainMenu/MainMenu";
import "./App.css";

function App() {
  writeMovaiLogo();

  React.useEffect(() => {
    installViewPlugins();
  }, []);

  return <div className="App">{getHostedPlugins()}</div>;
}

function installViewPlugins() {
  const plugins = [
    {
      profile: { name: "mainMenu", location: "leftPanel" },
      factory: profile => new MainMenu(profile)
    },
    {
      profile: { name: "explorer", location: "leftDrawer" },
      factory: profile => new Explorer(profile)
    }
  ];
  plugins.forEach(pluginDescription => {
    const plugin = pluginDescription.factory(pluginDescription.profile);
    PluginManagerIDE.install(pluginDescription.profile.name, plugin);
  });
  console.log("debug pluginManagerIde", PluginManagerIDE.getInstance());
}

function getHostedPlugins() {
  return (
    <Grid container direction="column">
      <Grid container alignItems="flex-start">
        <TopBar
          hostName="topBar"
          style={{ border: "solid 5px purple", width: "100%" }}
        ></TopBar>
      </Grid>
      <Grid container alignItems="stretch" style={{ flexGrow: 1 }}>
        <div
          style={{
            border: "solid 5px red",
            display: "flex",
            position: "relative"
          }}
        >
          <SidePanel
            hostName="leftPanel"
            style={{ height: "100%" }}
          ></SidePanel>
          <DrawerPanel
            hostName="leftDrawer"
            anchor="left"
            initialOpenState
          ></DrawerPanel>
        </div>
        <CentralPanel
          style={{ flexGrow: 1, border: "solid 5px green" }}
          hostName="mainPanel"
        ></CentralPanel>
        <DrawerPanel
          hostName="rightDrawer"
          anchor="right"
          style={{ border: "solid 5px blue", position: "relative" }}
        ></DrawerPanel>
      </Grid>
      <Grid container alignItems="flex-end">
        <BottomBar
          hostName="bottomBar"
          style={{ border: "solid 5px orange", width: "100%" }}
        ></BottomBar>
      </Grid>
    </Grid>
  );
}

function writeMovaiLogo() {
  console.log(MOVAI_LOGO);
}

const MOVAI_LOGO = `
███╗   ███╗ ████████╗ ██╗   ██╗         █████╗ ██╗ 
████╗ ████║ ██║   ██║ ██║   ██║        ██╔══██╗██║
██╔████╔██║ ██║   ██║ ██║   ██║ █████╗ ███████║██║
██║╚██╔╝██║ ██║   ██║  █║  ██╔╝ ╚════╝ ██╔══██║██║
██║ ╚═╝ ██║ ╚██████═╝   ╚███═╝         ██║  ██║██║
`;

export default App;
