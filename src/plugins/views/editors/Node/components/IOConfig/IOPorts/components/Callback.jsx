import React, { useCallback } from "react";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import Grid from "@material-ui/core/Grid";
import Circle from "@material-ui/icons/FiberManualRecord";
import { IconButton, Tooltip, Typography } from "@material-ui/core";
import { callbackStyles } from "./styles";
import { useTranslation } from "../../../../../_shared/mocks";
import { Edit, AddBox } from "@material-ui/icons";
import { SCOPES } from "../../../../../../../../utils/Constants";

const Callback = props => {
  // Props
  const {
    id,
    ioPort,
    message,
    callback,
    portName,
    protectedCallbacks,
    handleNewCallback,
    handleOpenCallback,
    handleOpenSelectScopeModal
  } = props;
  // Hooks
  const classes = callbackStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                        Handler                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Open Select scope modal
   */
  const openSelectScopeModal = useCallback(() => {
    handleOpenSelectScopeModal(
      {
        message,
        selectedIoPort: ioPort,
        selected: callback,
        scopeList: [SCOPES.CALLBACK]
      },
      portName,
      ioPort
    );
  }, [callback, handleOpenSelectScopeModal, ioPort, message, portName]);

  /**
   * Handler to open a callback by a given id
   */
  const openCallback = useCallback(() => {
    handleOpenCallback(id);
  }, [id, handleOpenCallback]);

  /**
   * Handler to create a new Callback
   */
  const createNewCallback = useCallback(() => {
    handleNewCallback(message, portName, ioPort);
  }, [message, portName, ioPort, handleNewCallback]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <Grid className={classes.gridContainer}>
      <Grid item xs={3} className={classes.titleColumn}>
        <Circle className={classes.circle} />
        Callback:
      </Grid>
      <Grid item xs={6}>
        <Tooltip title={id}>
          <Typography>{id}</Typography>
        </Tooltip>
      </Grid>
      <Grid item xs={3} className={classes.actionColumn}>
        {/* FolderIcon - Open Modal to Select Callback (with Workspace and Version) */}
        {props.editable && (
          <Tooltip title={t("Select a callback")}>
            <IconButton
              className={classes.icon}
              component="button"
              onClick={openSelectScopeModal}
            >
              <FolderOpenIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* EditIcon - Call Callback Editor */}
        <Tooltip title={t("Edit callback")}>
          <>
            <IconButton
              disabled={protectedCallbacks.includes(id)}
              className={classes.icon}
              component="button"
              onClick={openCallback}
            >
              <Edit />
            </IconButton>
          </>
        </Tooltip>

        {/* AddIcon - Create new Callback with associated Message */}
        {props.editable && (
          <Tooltip title={t("Create callback")}>
            <IconButton
              className={classes.icon}
              component="button"
              onClick={createNewCallback}
            >
              <AddBox />
            </IconButton>
          </Tooltip>
        )}
      </Grid>
    </Grid>
  );
};

export default Callback;
