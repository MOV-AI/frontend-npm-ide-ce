import React, { useEffect } from "react";
import {
  BaseApp,
  installEditor,
  installTool,
  ConfigurationModel,
  ConfigurationStore,
  ConfigurationEditor,
  CallbackModel,
  CallbackStore,
  CallbackEditor,
  NodeStore,
  NodeModel,
  NodeEditor,
  FlowModel,
  FlowStore,
  FlowEditor,
  FlowExplorer,
  CONSTANTS,
  getHomeTab,
  HomeTabPlugin,
  ShortcutsPlugin,
  getShortcutsTab,
  ApplicationTheme,
  ThemeProvider
} from "@mov-ai/mov-fe-lib-ide";
import { withDefaults } from "@mov-ai/mov-fe-lib-react";
// Editors
import KeyboardIcon from "@material-ui/icons/Keyboard";
import HomeIcon from "@material-ui/icons/Home";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n/i18n"
import { withStyles } from "@material-ui/core/styles";


const { HOMETAB_PROFILE, SHORTCUTS_PROFILE, FLOW_EXPLORER_PROFILE } = CONSTANTS;

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
      editorPlugin: FlowEditor,
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
      editorPlugin: NodeEditor
    });
    installEditor({
      scope: CallbackModel.SCOPE,
      store: CallbackStore,
      editorPlugin: CallbackEditor,
      props: { useLanguageServer: true }
    });
    installEditor({
      scope: ConfigurationModel.SCOPE,
      store: ConfigurationStore,
      editorPlugin: ConfigurationEditor
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


const dependencies = {
  "@material-ui/styles": { ThemeProvider, withStyles },
  "react-i18next": { I18nextProvider },
  i18n
};

export default withDefaults({
  name: "mov-fe-app-ide-ce",
  component: AppCE,
  themeProps: ApplicationTheme,
  dependencies
});
