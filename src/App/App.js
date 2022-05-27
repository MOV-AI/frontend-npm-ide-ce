import React from "react";
import { withAuthentication, Style } from "@mov-ai/mov-fe-lib-react";
import { Typography } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import DocManager from "../plugins/DocManager/DocManager";
import FlowExplorer from "../plugins/views/editors/Flow/Components/Explorer/Explorer";
import Dialog from "../plugins/Dialog/Dialog";
import Alerts from "../plugins/Alerts/Alerts";
import BottomBar from "../plugins/hosts/BottomBar/BottomBar";
import CentralPanel from "../plugins/hosts/CentralPanel/CentralPanel";
import DrawerPanel from "../plugins/hosts/DrawerPanel/DrawerPanel";
import SidePanel from "../plugins/hosts/SidePanel/SidePanel";
import TopBar from "../plugins/hosts/TopBar/TopBar";
import SystemBar from "../plugins/views/SystemBar/SystemBar";
import AlertPanel from "../plugins/hosts/AlertPanel/AlertPanel";
import Explorer from "../plugins/views/Explorer/Explorer";
import MainMenu from "../plugins/views/MainMenu/MainMenu";
import HomeTab from "../plugins/views/HomeTab/HomeTab";
import Tabs from "../plugins/views/Tabs/Tabs";
import PluginManagerIDE from "../engine/PluginManagerIDE/PluginManagerIDE";
import Placeholder from "../plugins/views/Placeholder/Placeholder";
import { withTheme } from "../decorators/withTheme";
import {
  HOMETAB_PROFILE,
  FLOW_EXPLORER_PROFILE,
  PLUGINS,
  HOSTS
} from "../utils/Constants";
import { MainContext } from "../main-context";

import "./App.css";

const DEBUG_MODE = false;

const useStyles = debugMode =>
  makeStyles(theme => ({
    leftPanel: {
      border: debugMode ? "solid 5px red" : "",
      borderRight: debugMode ? "" : `1px solid ${theme.background}`,
      display: "flex",
      position: "relative"
    },
    mainGrid: { flexGrow: 1 },
    sidePanel: { height: "100%" },
    centralPanel: { flexGrow: 1, border: debugMode ? "solid 5px green" : "" },
    rightDrawer: {
      border: debugMode ? "solid 5px blue" : "",
      borderLeft: debugMode ? "" : `1px solid ${theme.background}`,
      position: "relative"
    },
    bottomBar: { border: debugMode ? "solid 5px orange" : "", width: "100%" }
  }));

function App(props) {
  // Style hook
  const classes = useStyles(DEBUG_MODE)();

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    installAppPlugins();
    installViewPlugins();
    // Write log in consle
    writeMovaiLogo();
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  const onContextMenu = event => event.preventDefault();

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

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
      <div className="App" onContextMenu={onContextMenu}>
        {getHostedPlugins(classes)}
      </div>
    </MainContext.Provider>
  );
}

function installAppPlugins() {
  const plugins = [
    {
      profile: { name: PLUGINS.DOC_MANAGER.NAME },
      factory: profile => new DocManager(profile)
    },
    {
      profile: { name: PLUGINS.DIALOG.NAME },
      factory: profile => new Dialog(profile)
    },
    {
      profile: { name: PLUGINS.ALERT.NAME },
      factory: profile => new Alerts(profile)
    },
    {
      profile: FLOW_EXPLORER_PROFILE,
      factory: profile => new FlowExplorer(profile)
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
      profile: {
        name: PLUGINS.MAIN_MENU.NAME,
        location: HOSTS.LEFT_PANEL.NAME
      },
      factory: profile => new MainMenu(profile)
    },
    {
      profile: {
        name: PLUGINS.EXPLORER.NAME,
        location: HOSTS.LEFT_DRAWER.NAME
      },
      factory: profile => new Explorer(profile)
    },
    {
      profile: { name: PLUGINS.TABS.NAME, location: HOSTS.MAIN_PANEL.NAME },
      factory: profile => new Tabs(profile)
    },
    {
      profile: HOMETAB_PROFILE,
      factory: profile => new HomeTab(profile)
    },
    {
      profile: {
        name: PLUGINS.PLACEHOLDER.NAME,
        location: PLUGINS.RIGHT_DRAWER.NAME
      },
      factory: profile => new Placeholder(profile)
    },
    {
      profile: { name: PLUGINS.SYSTEM_BAR.NAME, location: HOSTS.TOP_BAR.NAME },
      factory: profile => new SystemBar(profile)
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
        <TopBar hostName={HOSTS.TOP_BAR.NAME} debugMode={DEBUG_MODE}></TopBar>
      </Grid>
      <Grid container alignItems="stretch" className={classes.mainGrid}>
        <Typography component="div" className={classes.leftPanel}>
          <SidePanel
            hostName={HOSTS.LEFT_PANEL.NAME}
            className={classes.sidePanel}
          ></SidePanel>
          <DrawerPanel
            hostName={HOSTS.LEFT_DRAWER.NAME}
            anchor="left"
            initialOpenState
          ></DrawerPanel>
        </Typography>
        <CentralPanel
          className={classes.centralPanel}
          hostName={HOSTS.MAIN_PANEL.NAME}
        ></CentralPanel>
        <DrawerPanel
          className={classes.rightDrawer}
          hostName={PLUGINS.RIGHT_DRAWER.NAME}
          anchor="right"
        ></DrawerPanel>
      </Grid>
      <Grid container alignItems="flex-end">
        <BottomBar
          hostName={HOSTS.BOTTOM_BAR.NAME}
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
