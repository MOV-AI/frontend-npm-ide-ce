import React from "react";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import Grid from "@material-ui/core/Grid";
import Circle from "@material-ui/icons/FiberManualRecord";
import { Link, Tooltip, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "../../../../../_shared/mocks";
import { Edit, Visibility } from "@material-ui/icons";

const useStyles = makeStyles(theme => {
  return {
    iconPadding: {
      paddingRight: 5
    },
    gridContainer: {
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      boxSizing: "border-box",
      padding: "10px"
    },
    circle: {
      width: "0.25em",
      height: "0.25em",
      margin: "5px"
    },
    icon: {
      paddingLeft: theme.spacing(3),
      color: theme.icon.color,
      "&:hover": {
        color: theme.icon.hoverColor
      }
    }
  };
});

const Callback = props => {
  // Props
  const {
    id,
    ioPort,
    message,
    callback,
    portName,
    handleNewCallback,
    handleOpenCallback,
    handleOpenSelectScopeModal
  } = props;
  // Hooks
  const classes = useStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <Grid className={classes.gridContainer}>
      <Grid item xs={3} style={{ margin: "auto" }}>
        <Circle className={classes.circle} />
        Callback:
      </Grid>
      <Grid item xs={6}>
        <Tooltip title={id}>
          <Typography>{id}</Typography>
        </Tooltip>
      </Grid>
      <Grid
        item
        xs={3}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center"
        }}
      >
        {/* EditIcon - Open Modal to Select Callback (with Workspace and Version) */}
        {props.editable && (
          <Tooltip title={t("Select a Callback")}>
            <Link
              className={classes.icon}
              component="button"
              onClick={() => {
                // Open SelectScopeModal
                handleOpenSelectScopeModal(
                  {
                    message,
                    selectedIoPort: ioPort,
                    selected: callback,
                    scopeList: ["Callback"]
                  },
                  portName,
                  ioPort
                );
              }}
            >
              <FolderOpenIcon />
            </Link>
          </Tooltip>
        )}

        {/* EyeIcon - Call Callback Editor */}
        <Tooltip title={t("Edit callback")}>
          <Link
            className={classes.icon}
            component="button"
            onClick={() => handleOpenCallback(id)}
          >
            <Visibility />
          </Link>
        </Tooltip>

        {/* EditIcon - Create new Callback with associated Message */}
        {props.editable && (
          <Tooltip title={t("Create callback")}>
            <Link
              className={classes.icon}
              component="button"
              onClick={() => handleNewCallback(message, portName, ioPort)}
            >
              <Edit />
            </Link>
          </Tooltip>
        )}
      </Grid>
    </Grid>
  );
};

export default Callback;
