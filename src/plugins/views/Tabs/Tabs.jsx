import React from "react";
import PropTypes from "prop-types";
import DockLayout from "rc-dock";
import "rc-dock/dist/rc-dock.css";
import { PLUGINS } from "../../../utils/Constants";
import {
  withViewPlugin,
  usePluginMethods
} from "../../../engine/ReactPlugin/ViewReactPlugin";
import useLayout from "./useLayout";

import tabsStyles from "./styles";

const Tabs = (props, ref) => {
  const classes = tabsStyles();
  const dockRef = React.useRef();
  const {
    layout,
    open,
    openEditor,
    close,
    onLayoutChange,
    focusExistingTab,
    getActiveTab,
    loadTab,
    updateTabId
  } = useLayout(props, dockRef);

  usePluginMethods(ref, {
    open,
    openEditor,
    updateTabId,
    getActiveTab,
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
    <div className={classes.root} onClick={focusActivePanelTab}>
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
