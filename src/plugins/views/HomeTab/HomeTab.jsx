import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { ContextMenu } from "@mov-ai/mov-fe-lib-react";
import AddIcon from "@material-ui/icons/Add";
import BuildIcon from "@material-ui/icons/Build";
import ChromeReaderModeIcon from "@material-ui/icons/ChromeReaderMode";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import Divider from "@material-ui/core/Divider";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import withAlerts from "../../../decorators/withAlerts";
import {
  APP_DEFAULT_CONFIG,
  APP_CUSTOM_CONFIG
} from "../../../utils/Constants";
import { getNameFromURL, getIconByScope } from "../../../utils/Utils";
import ERROR_MESSAGES from "../../../utils/ErrorMessages";
import Configuration from "../../../models/Configuration/Configuration";
import movaiIcon from "../editors/_shared/Loader/movai_red.svg";
import HomeTabCard from "./HomeTabCard";
import HomeLink from "./HomeLink";

import { homeTabStyles } from "./styles";

const MAX_RECENT_DOCS = 10;
const HOME_SAMPLES = window.SERVER_DATA?.Samples || [];

const HomeTab = forwardRef((props, ref) => {
  const classes = homeTabStyles();
  const { workspaceManager, call, on, alert, alertSeverities } = props;
  const { t } = useTranslation();

  const [recentDocs, setRecentDocs] = useState([]);
  const [docTypes, setDocTypes] = React.useState([]);

  const handleRemoveRecentDocuments = useCallback(() => {
    workspaceManager.setRecentDocuments([]);
    setRecentDocs([]);
  }, [workspaceManager]);

  const removeRecentDocument = useCallback(
    docId => {
      const storagedDocs = workspaceManager.getRecentDocuments();
      const recentDocs = storagedDocs.filter(doc => doc.id !== docId);

      workspaceManager.setRecentDocuments(recentDocs);
      setRecentDocs(recentDocs);
    },
    [workspaceManager]
  );

  const addRecentDocument = useCallback(
    (id, name, scope) => {
      const storagedDocs = workspaceManager.getRecentDocuments();
      const recentDocs = storagedDocs.filter(doc => doc.id !== id);

      if (recentDocs.length === MAX_RECENT_DOCS) recentDocs.shift();

      recentDocs.push({
        id: id,
        name: name,
        scope: scope
      });

      workspaceManager.setRecentDocuments(recentDocs);
      setRecentDocs(workspaceManager.getRecentDocuments());
    },
    [workspaceManager]
  );

  const setDeletedRecentDocument = useCallback(
    id => {
      const sd = workspaceManager.getRecentDocuments();
      const deletedDoc = sd.find(doc => doc.id === id);

      if (deletedDoc) {
        deletedDoc.isDeleted = true;
      }

      workspaceManager.setRecentDocuments(sd);
      setRecentDocs(workspaceManager.getRecentDocuments());
    },
    [workspaceManager]
  );

  const openRecentDocument = useCallback(
    doc => {
      if (!doc.name) doc.name = getNameFromURL(doc.id);

      if (doc.isDeleted) {
        alert({
          message: t(ERROR_MESSAGES.FILE_DOESNT_EXIST, {
            FILE_URL: doc.id
          }),
          severity: alertSeverities.WARNING
        });
      } else {
        call("tabs", "openEditor", doc);
      }
    },
    [alertSeverities, alert, call, t]
  );

  const openAppConfig = evt => {
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
  };

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

    setRecentDocs(workspaceManager.getRecentDocuments());

    on("tabs", "openEditor", data => {
      if (!data.isNew) addRecentDocument(data.id, data.name, data.scope);
    });

    on("docManager", "deleteDoc", data => {
      setDeletedRecentDocument(data.url);
    });

    on("docManager", "saveDoc", data => {
      if (data.newName) {
        const { workspace, type: scope } = data.doc;
        const id = `${workspace}/${scope}/${data.newName}`;
        addRecentDocument(id, data.newName, scope);
      }
    });
  }, [workspaceManager, addRecentDocument, setDeletedRecentDocument, call, on]);

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <div className={classes.root}>
      <div className={classes.body}>
        <div className={classes.column}>
          <Paper className={classes.paper}>
            <div className={classes.columnTitle}>{t("Quick access")}</div>
            <Divider className={classes.divider} />
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
              <div className={classes.link} onClick={openAppConfig}>
                <BuildIcon className={classes.linkIcon} />
                {t("App Configuration")}
              </div>
            </div>
          </Paper>
          <Paper className={classes.paper}>
            <div className={`${classes.columnTitle} ${classes.flexTitle}`}>
              <div>{t("Recent")}</div>
              <Tooltip title={t("Remove all")}>
                <IconButton
                  onClick={handleRemoveRecentDocuments}
                  className={classes.clearIcon}
                  disabled={recentDocs.length === 0}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
            <Divider className={classes.divider} />
            <div className={`${classes.columnBody} ${classes.recentPaper}`}>
              {[...recentDocs]?.reverse().map(doc => (
                <HomeLink
                  key={doc.id}
                  doc={doc}
                  openRecentDocument={openRecentDocument}
                  removeRecentDocument={removeRecentDocument}
                ></HomeLink>
              ))}
            </div>
          </Paper>
        </div>
        <div className={classes.column}>
          <Paper className={`${classes.paper} ${classes.samplePaper}`}>
            <div className={classes.columnTitle}>{t("Samples")}</div>
            <Divider className={classes.divider} />
            <div className={classes.columnSample}>
              {HOME_SAMPLES?.map((sample, i) => {
                return (
                  <div key={sample.title + i}>
                    {i !== 0 && (
                      <Divider light={true} className={classes.cardDivider} />
                    )}
                    <HomeTabCard
                      sample={sample}
                      openDocument={openRecentDocument}
                    />
                  </div>
                );
              })}
            </div>
          </Paper>
        </div>
      </div>
      <div className={classes.footer}>
        <Tooltip title={t("MOV.AI Website")}>
          <IconButton
            href="https://mov.ai"
            target="_blank"
            rel="noreferrer"
            className={classes.socialIconBadge}
          >
            <img
              src={movaiIcon}
              alt="MOV.AI Logo"
              className={classes.movaiIcon}
            />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
});

export default withViewPlugin(withAlerts(HomeTab));

HomeTab.propTypes = {
  call: PropTypes.func,
  on: PropTypes.func,
  workspaceManager: PropTypes.object
};
