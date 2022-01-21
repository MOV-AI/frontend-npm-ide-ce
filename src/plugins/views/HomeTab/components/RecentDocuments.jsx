import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import HomeLink from "./HomeLink";

import { recentDocumentsStyles } from "../styles";

const MAX_RECENT_DOCS = 10;

const RecentDocuments = props => {
  const classes = recentDocumentsStyles();
  const { workspaceManager, openRecentDocument, on } = props;
  const { t } = useTranslation();

  // State
  const [recentDocs, setRecentDocs] = useState([]);

  const setRecentDocuments = useCallback(
    recentDocs => {
      workspaceManager.setRecentDocuments(recentDocs);
      setRecentDocs(recentDocs);
    },
    [workspaceManager]
  );

  const filterRecentDocuments = useCallback(
    id => {
      const storagedDocs = workspaceManager.getRecentDocuments();
      return storagedDocs.filter(doc => doc.id !== id);
    },
    [workspaceManager]
  );

  const removeRecentDocument = useCallback(
    id => {
      const recentDocs = filterRecentDocuments(id);

      setRecentDocuments(recentDocs);
    },
    [setRecentDocuments, filterRecentDocuments]
  );

  const addRecentDocument = useCallback(
    (id, name, scope) => {
      const recentDocs = filterRecentDocuments(id);

      if (recentDocs.length === MAX_RECENT_DOCS) recentDocs.shift();

      recentDocs.push({
        id: id,
        name: name,
        scope: scope
      });

      setRecentDocuments(recentDocs);
    },
    [setRecentDocuments, filterRecentDocuments]
  );

  const setDeletedRecentDocument = useCallback(
    id => {
      const recentDocs = workspaceManager.getRecentDocuments();
      const deletedDoc = recentDocs.find(doc => doc.id === id);

      if (deletedDoc) {
        deletedDoc.isDeleted = true;
      }

      setRecentDocuments(recentDocs);
    },
    [workspaceManager, setRecentDocuments]
  );

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handler to remove all recent documents
   */
  const handleRemoveRecentDocuments = useCallback(() => {
    setRecentDocuments([]);
  }, [setRecentDocuments]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Component Did Mount
   */
  useEffect(() => {
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
  }, [workspaceManager, addRecentDocument, setDeletedRecentDocument, on]);

  return (
    <Paper className={classes.paper}>
      <div className={`${classes.columnTitle} ${classes.flexTitle}`}>
        <span>{t("Recent")}</span>
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
      <Divider />
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
  );
};

RecentDocuments.propTypes = {
  workspace: PropTypes.object,
  openRecentDocument: PropTypes.func,
  on: PropTypes.func
};

export default RecentDocuments;
