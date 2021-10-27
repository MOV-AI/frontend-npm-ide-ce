import "./App.css";
import React from "react";
import PluginManagerIDE from "../engine/PluginManagerIDE/PluginManagerIDE";
import PluginList from "../plugins/views/PluginList/PluginList";
import SidePanel from "../plugins/hosts/SidePanel/SidePanel";
import CentralPanel from "../plugins/hosts/CentralPanel/CentralPanel";
import TopBar from "../plugins/hosts/TopBar/TopBar";
import BottomBar from "../plugins/hosts/BottomBar/BottomBar";
import Grid from "@mui/material/Grid";

function App() {
  writeMovaiLogo();

  React.useEffect(() => {
    installViewPlugins();
  }, []);

  return <div className="App">{getHostedPlugins()}</div>;
}

function installViewPlugins() {
  const listProfile = {
    name: "list",
    displayName: "plugin list",
    location: "leftPanel"
  };
  const list = new PluginList(listProfile);
  PluginManagerIDE.install(listProfile.name, list);
}

function getHostedPlugins() {
  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TopBar></TopBar>
        </Grid>
        <Grid item xs={12}>
          <Grid container>
            <Grid item xs="auto">
              <SidePanel
                style={{ flexGrow: 1 }}
                hostName="leftPanel"
              ></SidePanel>
            </Grid>
            <Grid item xs="auto">
              <CentralPanel
                style={{ flexGrow: 1 }}
                hostName="mainPanel"
              ></CentralPanel>
            </Grid>
            <Grid item xs="auto">
              <SidePanel
                style={{ flexGrow: 1 }}
                hostName="rightPanel"
                anchor="right"
              ></SidePanel>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <BottomBar></BottomBar>
        </Grid>
      </Grid>
    </>
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
