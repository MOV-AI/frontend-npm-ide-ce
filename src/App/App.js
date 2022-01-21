import React from "react";
import "./App.css";
import PluginManagerIDE from "../engine/PluginManagerIDE/PluginManagerIDE";
import DocManager from "../plugins/DocManager/DocManager";
import Dialog from "../plugins/Dialog/Dialog";
import Alerts from "../plugins/Alerts/Alerts";
import BottomBar from "../plugins/hosts/BottomBar/BottomBar";
import CentralPanel from "../plugins/hosts/CentralPanel/CentralPanel";
import DrawerPanel from "../plugins/hosts/DrawerPanel/DrawerPanel";
import SidePanel from "../plugins/hosts/SidePanel/SidePanel";
import TopBar from "../plugins/hosts/TopBar/TopBar";
import AlertPanel from "../plugins/hosts/AlertPanel/AlertPanel";
import Explorer from "../plugins/views/Explorer/Explorer";
import MainMenu from "../plugins/views/MainMenu/MainMenu";
import Tabs from "../plugins/views/Tabs/Tabs";
import Placeholder from "../plugins/views/Placeholder/Placeholder";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { withAuthentication, Style } from "@mov-ai/mov-fe-lib-react";
import { withTheme } from "../decorators/withTheme";
import { MainContext } from "../main-context";
import { Typography } from "@material-ui/core";

const DEBUG_MODE = false;

const useStyles = debugMode =>
  makeStyles(theme => ({
    topBar: { border: debugMode ? "solid 5px purple" : "", width: "100%" },
    leftPanel: {
      border: debugMode ? "solid 5px red" : "",
      borderRight: debugMode ? "" : `1px solid ${theme.background}`,
      display: "flex",
      position: "relative"
    },
    centralPanel: { flexGrow: 1, border: debugMode ? "solid 5px green" : "" },
    rightDrawer: {
      border: debugMode ? "solid 5px blue" : "",
      borderLeft: debugMode ? "" : `1px solid ${theme.background}`,
      position: "relative"
    },
    bottomBar: { border: debugMode ? "solid 5px orange" : "", width: "100%" }
  }));

function App(props) {
  const classes = useStyles(DEBUG_MODE)();
  writeMovaiLogo();

  React.useEffect(() => {
    installAppPlugins();
    installViewPlugins();
  }, []);

  return (
    <MainContext.Provider
      value={{
        selectedTheme: props.theme,
        isDarkTheme: props.theme === "dark",
        handleToggleTheme: props.handleToggleTheme,
        handleLogOut: props.handleLogOut
      }}
    >
      <Style />
      <div className="App">{getHostedPlugins(classes)}</div>
    </MainContext.Provider>
  );
}

/**
 * Install app plugins 
 */
function installAppPlugins() {
  const plugins = [
    {
      profile: { name: "docManager" },
      factory: profile => new DocManager(profile)
    },
    {
      profile: { name: "dialog" },
      factory: profile => new Dialog(profile)
    },
    {
      profile: { name: "alert" },
      factory: profile => new Alerts(profile)
    }
  ];
  plugins.forEach(pluginDescription => {
    const plugin = pluginDescription.factory(pluginDescription.profile);
    PluginManagerIDE.install(pluginDescription.profile.name, plugin);
  });
}

/**
 * 
 */
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
      <AlertPanel hostName="alertPanel" />
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

export default withTheme(withAuthentication(App));
