import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import DeleteIcon from "@material-ui/icons/DeleteForever";
import { PLUGINS } from "../../../../utils/Constants";
import HomeLink from "./HomeLink";

import { recentDocumentsStyles } from "../styles";

const MAX_RECENT_DOCS = 10;

const RecentDocuments = props => {
  const classes = recentDocumentsStyles();
  const { workspaceManager, openRecentDocument, on, off } = props;
  const { t } = useTranslation();

  // State
  const [recentDocs, setRecentDocs] = useState(
    workspaceManager.getRecentDocuments()
  );

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  const setRecentDocuments = useCallback(
    documents => {
      workspaceManager.setRecentDocuments(documents);
      setRecentDocs(documents);
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
      const documents = filterRecentDocuments(id);

      setRecentDocuments(documents);
    },
    [setRecentDocuments, filterRecentDocuments]
  );

  const addRecentDocument = useCallback(
    (id, name, scope) => {
      const documents = filterRecentDocuments(id);

      if (documents.length === MAX_RECENT_DOCS) documents.shift();

      documents.push({
        id: id,
        name: name,
        scope: scope
      });

      setRecentDocuments(documents);
    },
    [setRecentDocuments, filterRecentDocuments]
  );

  const setDeletedRecentDocument = useCallback(
    id => {
      const documents = workspaceManager.getRecentDocuments();
      const deletedDoc = documents.find(doc => doc.id === id);

      if (deletedDoc) {
        deletedDoc.isDeleted = true;
      }

      setRecentDocuments(documents);
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

    on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.OPEN_EDITOR, data => {
      if (!data.isNew) addRecentDocument(data.id, data.name, data.scope);
    });

    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.DELETE_DOC, data => {
      setDeletedRecentDocument(data.url);
    });

    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.SAVE_DOC, data => {
      if (data.newName) {
        const { workspace, type: scope } = data.doc;
        const id = `${workspace}/${scope}/${data.newName}`;
        addRecentDocument(id, data.newName, scope);
      }
    });

    return () => {
      off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.OPEN_EDITOR);
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.DELETE_DOC);
      off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.SAVE_DOC);
    };
  }, [workspaceManager, addRecentDocument, setDeletedRecentDocument, on, off]);

  return (
    <Paper data-testid="section_recent-documents" className={classes.paper}>
      <div className={`${classes.columnTitle} ${classes.flexTitle}`}>
        <span>{t("Recent")}</span>
        <Tooltip title={t("RemoveAll")}>
          <span>
            <IconButton
              data-testid="input_clear-recent-documents"
              onClick={handleRemoveRecentDocuments}
              className={classes.clearIcon}
              disabled={recentDocs.length === 0}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
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
