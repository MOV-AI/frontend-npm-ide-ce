import Grid from "@mui/material/Grid";
import React from "react";
import PluginManagerIDE from "../engine/PluginManagerIDE/PluginManagerIDE";
import BottomBar from "../plugins/hosts/BottomBar/BottomBar";
import CentralPanel from "../plugins/hosts/CentralPanel/CentralPanel";
import DrawerPanel from "../plugins/hosts/DrawerPanel/DrawerPanel";
import SidePanel from "../plugins/hosts/SidePanel/SidePanel";
import TopBar from "../plugins/hosts/TopBar/TopBar";
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
  const mainMenuProfile = {
    name: "mainMenu",
    location: "leftPanel"
  };
  const mainMenu = new MainMenu(mainMenuProfile);
  PluginManagerIDE.install(mainMenuProfile.name, mainMenu);
}

function getHostedPlugins() {
  return (
    <Grid container direction="column">
      <Grid container alignItems="flex-start">
        <TopBar style={{ border: "solid 5px purple", width: "100%" }}></TopBar>
      </Grid>
      <Grid container alignItems="stretch" style={{ flexGrow: 1 }}>
        <div style={{ border: "solid 5px red" }}>
          <SidePanel hostName="leftPanel"></SidePanel>
          <DrawerPanel hostName="leftDrawer"></DrawerPanel>
        </div>
        <CentralPanel
          style={{ flexGrow: 1, border: "solid 5px green" }}
          hostName="mainPanel"
        ></CentralPanel>
        <DrawerPanel
          hostName="rightDrawer"
          anchor="right"
          style={{ border: "solid 5px blue" }}
        ></DrawerPanel>
      </Grid>
      <Grid container alignItems="flex-end">
        <BottomBar
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
