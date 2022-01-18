import React, { useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Tooltip
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Add from "@material-ui/icons/Add";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import useDataSubscriber from "../../../../../DocManager/useDataSubscriber";
import DetailsMenu from "../../../_shared/DetailsMenu/DetailsMenu";
import TableKeyValue from "./sub-components/TableKeyValue";
import styles from "./styles";

const useStyles = makeStyles(styles);

const ACTIVE_ITEM = {
  description: 1,
  parameters: 2,
  groups: 3
};

const Menu = ({ name, model, details: detailsProp, editable }) => {
  // State hook
  const [activeItem, setActiveItem] = React.useState(0);
  const { data } = useDataSubscriber({
    instance: model,
    propsData: detailsProp
  });
  // Other hooks
  const classes = useStyles();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   *
   * @param {*} value
   * @param {*} type
   * @param {*} is2ParseString
   * @returns
   */
  const renderValue = useCallback((value, type, is2StringifyString) => {
    const renderValueByType = {
      string: () => (is2StringifyString ? JSON.stringify(value) : value),
      boolean: () => value.toString()
    };
    return type in renderValueByType ? renderValueByType[type]() : value;
  }, []);

  /**
   * @private Get parameters to render in menu
   */
  const getParameters = useCallback(() => {
    const output = [];
    const parameters = data?.parameters || {};
    Object.keys(parameters).forEach(param => {
      const value = data.parameters?.[param]?.value || "";
      const type = data.parameters?.[param]?.type || "any";
      output.push({
        key: param,
        value: renderValue(value, type, true)
      });
    });
    return output;
  }, [data?.parameters, renderValue]);

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle expand/collapse action
   *  If item is collapsed : Expand item and collapse other
   *  If item is expanded  : Collapse item and let all others collapsed as well
   * @param {*} _activeItem
   */
  const handleExpandClick = useCallback(newActiveItem => {
    setActiveItem(prevState => {
      if (prevState === newActiveItem) return 0;
      else return newActiveItem;
    });
  }, []);

  const handleEditDescriptionClick = useCallback(() => {
    console.log("debug handleEditDescriptionClick");
  }, []);

  const handleAddParameterClick = useCallback(() => {
    console.log("debug handleAddParameterClick");
  }, []);

  const handleParamEdit = useCallback(() => {
    console.log("debug handleParamEdit");
  }, []);

  const handleParamDelete = useCallback(() => {
    console.log("debug handleParamDelete");
  }, []);

  const handleGroupActive = useCallback((group, status) => {
    console.log("debug handleGroupActive", group, status);
  }, []);

  const handleGroupEdit = useCallback(groupId => {
    console.log("debug open modal to edit group", groupId);
  }, []);

  const handleGroupDelete = useCallback(groupId => {
    console.log("debug handleGroupDelete", groupId);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Description
   * @returns {ReactElement} Description to render in collapsible content
   */
  const renderDescription = useCallback(() => {
    return data.description ? (
      <Typography className={classes.itemValue}>{data.description}</Typography>
    ) : (
      <Typography className={`${classes.itemValue} ${classes.disabled}`}>
        N/A
      </Typography>
    );
  }, [classes, data.description]);

  /**
   * Render parameters
   * @returns {ReactElement} Parameters to render in collapsible content
   */
  const renderParameters = useCallback(() => {
    const params = getParameters();
    return params.length ? (
      <Typography component="div" className={classes.parametersContainer}>
        <TableKeyValue
          list={getParameters()}
          allowDelete={editable}
          allowEdit={editable}
          handleParameterDeleteModal={handleParamDelete}
          handleParameterEditModal={handleParamEdit}
          type="params"
          allowSearch
        />
      </Typography>
    ) : (
      <Typography className={`${classes.itemValue} ${classes.disabled}`}>
        No Parameters
      </Typography>
    );
  }, [classes, editable, getParameters, handleParamDelete, handleParamEdit]);

  /**
   * Render groups
   * @returns {ReactElement} Groups to render in collapsible content
   */
  const renderGroups = useCallback(() => {
    const groups = Object.keys(data.groups || {});
    return groups.length ? (
      groups.map(key => {
        const checked = data.groups[key].enabled;
        const groupName = data.groups[key].name;
        return (
          <Typography component="div" className={classes.groupRow} key={key}>
            <Tooltip title={groupName}>
              <Typography
                component="div"
                className={`${classes.itemValue} ${classes.groupItem}`}
              >
                {groupName}
              </Typography>
            </Tooltip>
            <IconButton onClick={() => handleGroupActive(key, !checked)}>
              {checked && (
                <VisibilityIcon
                  fontSize="small"
                  color="primary"
                ></VisibilityIcon>
              )}
              {!checked && (
                <VisibilityOffIcon
                  fontSize="small"
                  color="disabled"
                ></VisibilityOffIcon>
              )}
            </IconButton>
            {editable && (
              <Tooltip title="Edit Group">
                <IconButton onClick={() => handleGroupEdit(key)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {editable && (
              <Tooltip title="Delete Group">
                <IconButton onClick={() => handleGroupDelete(key)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Typography>
        );
      })
    ) : (
      <Typography className={`${classes.itemValue} ${classes.disabled}`}>
        No Groups
      </Typography>
    );
  }, [
    classes,
    data.groups,
    editable,
    handleGroupActive,
    handleGroupEdit,
    handleGroupDelete
  ]);

  return (
    <Typography component="div">
      <DetailsMenu name={name} details={data.details || {}}></DetailsMenu>
      <List>
        {/* ============ DESCRIPTION ============ */}
        <ListItem
          button
          onClick={() => handleExpandClick(ACTIVE_ITEM.description)}
        >
          <ListItemText primary="Description" />
          <IconButton
            disabled={!editable}
            onClick={e => {
              e.stopPropagation();
              handleEditDescriptionClick();
            }}
          >
            <EditIcon />
          </IconButton>
          {activeItem === ACTIVE_ITEM.description ? (
            <ExpandLess />
          ) : (
            <ExpandMore />
          )}
        </ListItem>
        <Collapse in={activeItem === ACTIVE_ITEM.description} unmountOnExit>
          {renderDescription()}
          <Divider />
        </Collapse>
        {/* ============ PARAMETERS ============ */}
        <ListItem
          button
          onClick={() => handleExpandClick(ACTIVE_ITEM.parameters)}
        >
          <ListItemText primary="Parameters" />
          <IconButton
            disabled={!editable}
            onClick={e => {
              e.stopPropagation();
              handleAddParameterClick();
            }}
          >
            <Add />
          </IconButton>
          {activeItem === ACTIVE_ITEM.parameters ? (
            <ExpandLess />
          ) : (
            <ExpandMore />
          )}
        </ListItem>
        <Collapse in={activeItem === ACTIVE_ITEM.parameters} unmountOnExit>
          {renderParameters()}
          <Divider />
        </Collapse>
        {/* ============ GROUPS ============ */}
        <ListItem button onClick={() => handleExpandClick(ACTIVE_ITEM.groups)}>
          <ListItemText primary="Groups" />
          <IconButton
            disabled={!editable}
            onClick={e => {
              e.stopPropagation();
              handleAddParameterClick();
            }}
          >
            <Add />
          </IconButton>
          {activeItem === ACTIVE_ITEM.groups ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={activeItem === ACTIVE_ITEM.groups} unmountOnExit>
          {renderGroups()}
          <Divider />
        </Collapse>
      </List>
    </Typography>
  );
};

export default Menu;
