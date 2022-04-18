import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import Workspace from "../../../utils/Workspace";
import { getNameFromURL } from "../../../utils/Utils";
import {
  HOMETAB_PROFILE,
  PLUGINS,
  ALERT_SEVERITIES
} from "../../../utils/Constants";
import { ERROR_MESSAGES } from "../../../utils/Messages";
import QuickAccessComponent from "./components/QuickAccess";
import RecentDocumentsComponent from "./components/RecentDocuments";
import ExamplesComponent from "./components/Examples";
import withAlerts from "../../../decorators/withAlerts";

import { homeTabStyles } from "./styles";

const HomeTab = props => {
  const { call, on, off, alert } = props;
  const workspaceManager = useMemo(() => new Workspace(), []);
  const classes = homeTabStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                        Methods                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Open an existing Document
   * @param {{name: string, scope: string, id: string, isDeleted: bool}} doc : Document data
   */
  const openExistingDocument = useCallback(
    doc => {
      if (!doc.name) doc.name = getNameFromURL(doc.id);

      if (doc.isDeleted) {
        alert({
          message: t(ERROR_MESSAGES.FILE_DOESNT_EXIST, {
            FILE_URL: doc.id
          }),
          severity: ALERT_SEVERITIES.WARNING
        });
      } else {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, doc);
      }
    },
    [alert, call, t]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    call(PLUGINS.RIGHT_DRAWER.NAME, PLUGINS.RIGHT_DRAWER.CALL.RESET_BOOKMARKS);
    on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, data => {
      if (data.id === HOMETAB_PROFILE.name) {
        call(
          PLUGINS.RIGHT_DRAWER.NAME,
          PLUGINS.RIGHT_DRAWER.CALL.RESET_BOOKMARKS
        );
      }
    });
    return () => {
      off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
    };
  }, [call, on, off]);

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <div data-testid="section_hometab" className={classes.root}>
      <div className={classes.body}>
        <div className={classes.column}>
          <QuickAccessComponent call={call} />
          <RecentDocumentsComponent
            workspaceManager={workspaceManager}
            openRecentDocument={openExistingDocument}
            on={on}
            off={off}
          />
        </div>
        <div className={classes.column}>
          <ExamplesComponent openExistingDocument={openExistingDocument} />
        </div>
      </div>
    </div>
  );
};

const HomeTabPlugin = withViewPlugin(withAlerts(HomeTab));

export default HomeTabPlugin;

HomeTab.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired
};

/**
 * Get welcome tab data
 * @returns {TabData} Data used to create tab
 */
export const getHomeTab = () => {
  const viewPlugin = new HomeTabPlugin(HOMETAB_PROFILE);

  return {
    ...HOMETAB_PROFILE,
    id: HOMETAB_PROFILE.name,
    name: HOMETAB_PROFILE.title,
    tabTitle: HOMETAB_PROFILE.title,
    scope: HOMETAB_PROFILE.name,
    extension: "",
    content: viewPlugin.render()
  };
};
