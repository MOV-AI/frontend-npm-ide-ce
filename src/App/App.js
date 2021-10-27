import "./App.css";
import React from "react";
import PluginManagerIDE from "../engine/PluginManagerIDE/PluginManagerIDE";
import PluginList from "../plugins/views/PluginList/PluginList";
import SidePanel from "../plugins/hosts/SidePanel/SidePanel";
import CentralPanel from "../plugins/hosts/CentralPanel/CentralPanel";
import TopBar from "../plugins/hosts/TopBar/TopBar";
import BottomBar from "../plugins/hosts/BottomBar/BottomBar";
import Grid from "@mui/material/Grid";
import MainMenu from "../plugins/views/MainMenu/MainMenu";

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
        <SidePanel
          hostName="leftPanel"
          style={{ border: "solid 5px red" }}
        ></SidePanel>
        <CentralPanel
          style={{ flexGrow: 1, border: "solid 5px green" }}
          hostName="mainPanel"
        ></CentralPanel>
        <SidePanel
          hostName="rightPanel"
          anchor="right"
          style={{ border: "solid 5px blue" }}
        ></SidePanel>
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
