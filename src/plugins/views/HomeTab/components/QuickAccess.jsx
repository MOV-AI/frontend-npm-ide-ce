import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { ContextMenu } from "@mov-ai/mov-fe-lib-react";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import AddIcon from "@material-ui/icons/Add";
import BuildIcon from "@material-ui/icons/Build";
import ChromeReaderModeIcon from "@material-ui/icons/ChromeReaderMode";
import { getIconByScope } from "../../../../utils/Utils";
import {
  APP_DEFAULT_CONFIG,
  APP_CUSTOM_CONFIG
} from "../../../../utils/Constants";
import Configuration from "../../../../models/Configuration/Configuration";

import { quickAccessStyles } from "../styles";

const QuickAccess = props => {
  const { call } = props;
  const { t } = useTranslation();
  const classes = quickAccessStyles();

  // State
  const [docTypes, setDocTypes] = useState([]);

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  const handleOpenAppConfig = useCallback(() => {
    const name = APP_CUSTOM_CONFIG;
    const scope = Configuration.SCOPE;

    call("docManager", "checkDocumentExists", {
      name,
      scope
    }).then(fileExists => {
      if (!fileExists) {
        call(
          "docManager",
          "copy",
          {
            name: APP_DEFAULT_CONFIG,
            scope
          },
          name
        );
      }

      call("tabs", "openEditor", {
        id: `global/${scope}/${name}`,
        name,
        scope
      });
    });
  }, [call]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Component Did Mount
   */
  useEffect(() => {
    call("docManager", "getDocTypes").then(_docTypes => {
      setDocTypes(_docTypes);
    });
  }, [call]);

  return (
    <Paper className={classes.paper}>
      <div className={classes.columnTitle}>{t("Quick access")}</div>
      <Divider />
      <div className={classes.columnBody}>
        <ContextMenu
          element={
            <div className={classes.link}>
              <AddIcon className={classes.linkIcon} />
              {t("Create New")}
            </div>
          }
          menuList={docTypes.map(docType => ({
            onClick: () =>
              call("docManager", "create", { scope: docType.scope }).then(
                document => {
                  call("tabs", "openEditor", {
                    id: document.getUrl(),
                    name: document.getName(),
                    scope: docType.scope,
                    isNew: true
                  });
                }
              ),
            element: docType.scope,
            icon: getIconByScope(docType.scope),
            onClose: true
          }))}
        ></ContextMenu>
        <a
          href="https://movai.atlassian.net/wiki/spaces/MW/overview"
          target="_blank"
          rel="noreferrer"
          className={classes.link}
        >
          <ChromeReaderModeIcon className={classes.linkIcon} />

          {t("Documentation")}
        </a>
        <div className={classes.link} onClick={handleOpenAppConfig}>
          <BuildIcon className={classes.linkIcon} />
          {t("App Configuration")}
        </div>
      </div>
    </Paper>
  );
};

QuickAccess.propTypes = {
  call: PropTypes.func
};

export default QuickAccess;
