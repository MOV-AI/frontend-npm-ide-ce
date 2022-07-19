import React, { useRef } from "react";
import PropTypes from "prop-types";
import DockLayout from "rc-dock";
import { PLUGINS } from "../../../utils/Constants";
import {
  withViewPlugin,
  usePluginMethods
} from "../../../engine/ReactPlugin/ViewReactPlugin";
import useTabLayout from "./hooks/useTabLayout";

import "rc-dock/dist/rc-dock.css";
import { tabsStyles } from "./styles";

const Tabs = (props, ref) => {
  const classes = tabsStyles();
  const dockRef = useRef();
  const {
    layout,
    open,
    openEditor,
    close,
    onLayoutChange,
    focusExistingTab,
    getActiveTab,
    focusActiveTab,
    loadTab,
    updateTabId
  } = useTabLayout(props, dockRef);

  usePluginMethods(ref, {
    open,
    openEditor,
    updateTabId,
    getActiveTab,
    focusActiveTab,
    close
  });

  /**
   * Searches active tab in clicked panel and focus that tab.
   * @param {*} evt
   */
  const focusActivePanelTab = evt => {
    const target = evt.target;
    if (!target?.classList?.contains("dock-nav-wrap")) return;

    const activeTabEl = target.querySelector(".dock-tab-active>.dock-tab-btn");
    const panelActiveTab = activeTabEl.id.substring(
      activeTabEl.id.indexOf("tab-") + 4
    );

    if (getActiveTab !== panelActiveTab) focusExistingTab(panelActiveTab);
  };

  return (
    <div
      data-testid="input_tab-panel"
      className={classes.root}
      onClick={focusActivePanelTab}
    >
      <DockLayout
        ref={dockRef}
        layout={layout}
        loadTab={loadTab}
        onLayoutChange={onLayoutChange}
        className={classes.dockLayout}
      />
    </div>
  );
};

Tabs.pluginMethods = [...Object.values(PLUGINS.TABS.CALL)];

export default withViewPlugin(Tabs, Tabs.pluginMethods);

Tabs.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  emit: PropTypes.func.isRequired,
  onTopic: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};
