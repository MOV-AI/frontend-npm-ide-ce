import React, { useEffect } from "react";
import { withDefaults } from "@mov-ai/mov-fe-lib-react";
import { ThemeProvider } from "@material-ui/core/styles";
import { ApplicationTheme } from "../themes";
import BaseApp, { installEditor, installTool } from "./BaseApp";
// Editors
import {
  ConfigurationModel,
  ConfigurationStore,
  ConfigurationView
} from "../editors/Configuration";
import {
  CallbackModel,
  CallbackStore,
  CallbackView
} from "../editors/Callback";
import { NodeStore, NodeModel, NodeView } from "../editors/Node";
import { FlowModel, FlowStore, FlowView } from "../editors/Flow";
import FlowExplorer from "../editors/Flow/view/Components/Explorer/Explorer";
// Tools
import {
  FLOW_EXPLORER_PROFILE,
  HOMETAB_PROFILE,
  SHORTCUTS_PROFILE
} from "../utils/Constants";
import HomeTabPlugin, { getHomeTab } from "../tools/HomeTab/HomeTab";
import ShortcutsPlugin, {
  getShortcutsTab
} from "../tools/AppShortcuts/AppShortcuts";
import KeyboardIcon from "@material-ui/icons/Keyboard";
import HomeIcon from "@material-ui/icons/Home";

const AppCE = props => {
  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // On component did mount
  useEffect(() => {
    // Install editors
    installEditor({
      scope: FlowModel.SCOPE,
      store: FlowStore,
      editorPlugin: FlowView,
      otherPlugins: [
        {
          profile: FLOW_EXPLORER_PROFILE,
          factory: profile => new FlowExplorer(profile)
        }
      ]
    });
    installEditor({
      scope: NodeModel.SCOPE,
      store: NodeStore,
      editorPlugin: NodeView
    });
    installEditor({
      scope: CallbackModel.SCOPE,
      store: CallbackStore,
      editorPlugin: CallbackView
    });
    installEditor({
      scope: ConfigurationModel.SCOPE,
      store: ConfigurationStore,
      editorPlugin: ConfigurationView
    });

    // Install tools
    installTool({
      id: HOMETAB_PROFILE.name,
      profile: HOMETAB_PROFILE,
      Plugin: HomeTabPlugin,
      tabData: getHomeTab(),
      icon: HomeIcon,
      quickAccess: false,
      toolBar: false,
      mainMenu: false
    });
    installTool({
      id: SHORTCUTS_PROFILE.name,
      profile: SHORTCUTS_PROFILE,
      Plugin: ShortcutsPlugin,
      tabData: getShortcutsTab(),
      icon: KeyboardIcon,
      quickAccess: false,
      toolBar: false,
      mainMenu: false
    });
  }, []);

  return <BaseApp {...props} />;
};

export default withDefaults({
  name: "mov-fe-app-ide-ce",
  component: AppCE,
  offlineValidation: false,
  theme: {
    provider: ThemeProvider,
    props: ApplicationTheme
  }
});
