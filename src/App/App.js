import React from "react";
import "./App.css";
import PluginManagerIDE from "../engine/PluginManagerIDE/PluginManagerIDE";
import DocManager from "../plugins/DocManager/DocManager";
import BottomBar from "../plugins/hosts/BottomBar/BottomBar";
import CentralPanel from "../plugins/hosts/CentralPanel/CentralPanel";
import DrawerPanel from "../plugins/hosts/DrawerPanel/DrawerPanel";
import SidePanel from "../plugins/hosts/SidePanel/SidePanel";
import TopBar from "../plugins/hosts/TopBar/TopBar";
import Explorer from "../plugins/views/Explorer/Explorer";
import MainMenu from "../plugins/views/MainMenu/MainMenu";
import Tabs from "../plugins/views/Tabs/Tabs";
import Placeholder from "../plugins/views/Placeholder/Placeholder";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { withAuthentication } from "@mov-ai/mov-fe-lib-react";
import { Typography } from "@material-ui/core";

const DEBUG_MODE = false;

const useStyles = debugMode =>
  makeStyles(() => ({
    topBar: { border: debugMode ? "solid 5px purple" : "", width: "100%" },
    leftPanel: {
      border: debugMode ? "solid 5px red" : "",
      borderRight: debugMode ? "" : "1px solid gray",
      display: "flex",
      position: "relative"
    },
    centralPanel: { flexGrow: 1, border: debugMode ? "solid 5px green" : "" },
    rightDrawer: {
      border: debugMode ? "solid 5px blue" : "",
      borderLeft: debugMode ? "" : "1px solid gray",
      position: "relative"
    },
    bottomBar: { border: debugMode ? "solid 5px orange" : "", width: "100%" }
  }));

function App() {
  const classes = useStyles(DEBUG_MODE)();
  writeMovaiLogo();

  React.useEffect(() => {
    installAppPlugins();
    installViewPlugins();
  }, []);

  return <div className="App">{getHostedPlugins(classes)}</div>;
}

function installAppPlugins() {
  const plugins = [
    {
      profile: { name: "docManager" },
      factory: profile => new DocManager(profile)
    }
  ];
  plugins.forEach(pluginDescription => {
    const plugin = pluginDescription.factory(pluginDescription.profile);
    PluginManagerIDE.install(pluginDescription.profile.name, plugin);
  });
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
    },
    {
      profile: { name: "tabs", location: "mainPanel" },
      factory: profile => new Tabs(profile)
    },
    {
      profile: { name: "placeholder", location: "rightDrawer" },
      factory: profile => new Placeholder(profile)
    }
  ];
  plugins.forEach(pluginDescription => {
    const plugin = pluginDescription.factory(pluginDescription.profile);
    PluginManagerIDE.install(pluginDescription.profile.name, plugin);
  });
}

function getHostedPlugins(classes) {
  return (
    <Grid container direction="column">
      <Grid container alignItems="flex-start">
        <TopBar hostName="topBar" className={classes.topBar}></TopBar>
      </Grid>
      <Grid container alignItems="stretch" style={{ flexGrow: 1 }}>
        <Typography component="div" className={classes.leftPanel}>
          <SidePanel
            hostName="leftPanel"
            style={{ height: "100%" }}
          ></SidePanel>
          <DrawerPanel
            hostName="leftDrawer"
            anchor="left"
            initialOpenState
          ></DrawerPanel>
        </Typography>
        <CentralPanel
          className={classes.centralPanel}
          hostName="mainPanel"
        ></CentralPanel>
        <DrawerPanel
          className={classes.rightDrawer}
          hostName="rightDrawer"
          anchor="right"
        ></DrawerPanel>
      </Grid>
      <Grid container alignItems="flex-end">
        <BottomBar
          hostName="bottomBar"
          className={classes.bottomBar}
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

export default withAuthentication(App);
