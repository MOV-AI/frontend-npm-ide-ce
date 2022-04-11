import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Add from "@material-ui/icons/Add";
import { Utils } from "@mov-ai/mov-fe-lib-core";
import useDataSubscriber from "../../../../../DocManager/useDataSubscriber";
import {
  DEFAULT_KEY_VALUE_DATA,
  DATA_TYPES,
  PLUGINS
} from "../../../../../../utils/Constants";
import { validateDocumentName } from "../../../../../../utils/Utils";
import ParameterEditorDialog from "../../../_shared/KeyValueTable/ParametersEditorDialog";
import DetailsMenu from "../../../_shared/DetailsMenu/DetailsMenu";
import TableKeyValue from "./sub-components/TableKeyValue";
import GroupItem from "./sub-components/GroupItem";
import menuStyles from "./styles";

const ACTIVE_ITEM = {
  description: 1,
  parameters: 2,
  groups: 3
};

const Menu = ({
  name,
  model,
  details: detailsProp,
  editable,
  call,
  handleGroupVisibility
}) => {
  // State hook
  const [activeItem, setActiveItem] = useState(0);
  const { data } = useDataSubscriber({
    instance: model,
    propsData: detailsProp
  });
  // Other hooks
  const classes = menuStyles();
  const { t } = useTranslation();

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
      const type = data.parameters?.[param]?.type || DATA_TYPES.ANY;
      output.push({
        key: param,
        value: renderValue(value, type, true)
      });
    });
    return output;
  }, [data?.parameters, renderValue]);

  /**
   * @private Use this to change a group name
   * @param {String} prevName : previous name (used to discern if is new or edit)
   * @param {Function} submitCallback : Callback to be called on Submit
   */
  const editGroupName = useCallback(
    (submitCallback, prevName = "") => {
      const args = {
        size: "sm",
        title: prevName ? t("Edit Group") : t("Add Group"),
        inputLabel: t("Group Name"),
        value: prevName,
        onValidation: value => {
          try {
            const validation = validateDocumentName(value);
            return { result: validation, error: "" };
          } catch (err) {
            return {
              result: false,
              error: err.message
            };
          }
        },
        onSubmit: submitCallback
      };

      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.FORM_DIALOG, args);
    },
    [call, t]
  );

  /**
   * @summary: Validate document name against invalid characters. It accept ROS valid names
   * and can't accept two consecutive underscores.
   * @param {String} oldName : Old Name
   * @param {Object} newData : New data
   * @returns {Promise} {result: <boolean>, [error: <string> OR data: <object>]}
   **/
  const validateParamName = useCallback(
    (oldName, newData) => {
      const { name: newName } = newData;

      try {
        if (!newName) throw new Error(`Name is mandatory`);
        else if (!Utils.validateEntityName(newName, []))
          throw new Error(`Invalid Name`);

        // Validate against repeated names
        if (oldName !== newName && model.current.getParameter(newName)) {
          throw new Error(`Cannot have 2 entries with the same name`);
        }
      } catch (error) {
        return Promise.resolve({ result: false, error: error.message });
      }

      return Promise.resolve({ result: true, data: { oldName, newData } });
    },
    [model]
  );

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * @param {Object} data : Data to Save
   */
  const handleSubmitParameter = useCallback(
    (oldName, newData) => {
      if (oldName === "") {
        model.current.addParameter(newData.name, newData);
      } else {
        model.current.updateKeyValueItem("parameters", newData, oldName);
      }
    },
    [model]
  );

  /**
   * Open dialog to edit/add new Parameter
   * @param {string} dataId : Unique identifier of item (undefined when not created yet)
   * @param {ReactComponent} DialogComponent : Dialog component to render
   */
  const handleParameterDialog = useCallback(
    dataId => {
      const obj = model.current.getParameter(dataId) || DEFAULT_KEY_VALUE_DATA;

      const args = {
        onSubmit: formData => handleSubmitParameter(obj.name, formData),
        nameValidation: newData => validateParamName(obj.name, newData),
        renderType: true,
        title: t("Parameter"),
        data: obj,
        call
      };

      call(
        PLUGINS.DIALOG.NAME,
        PLUGINS.DIALOG.CALL.CUSTOM_DIALOG,
        args,
        ParameterEditorDialog
      );
    },
    [model, call, validateParamName, handleSubmitParameter, t]
  );

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Handle expand/collapse action
   *  If item is collapsed : Expand item and collapse other
   *  If item is expanded  : Collapse item and let all others collapsed as well
   * @param {Event} evt
   */
  const handleExpandClick = useCallback(evt => {
    const newActiveItem = parseInt(evt.currentTarget.dataset.menuId);

    setActiveItem(prevState => {
      return prevState === newActiveItem ? 0 : newActiveItem;
    });
  }, []);

  /**
   * Open dialog to edit flow description
   */
  const handleEditDescriptionClick = useCallback(() => {
    const args = {
      size: "md",
      multiline: true,
      title: t("Edit Description"),
      inputLabel: t("Description"),
      value: model.current.getDescription(),
      onSubmit: description => model.current.setDescription(description)
    };

    call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.FORM_DIALOG, args);
  }, [model, call, t]);

  /**
   * Handle Add new Parameter
   */
  const handleAddParameterClick = useCallback(() => {
    handleParameterDialog();
  }, [handleParameterDialog]);

  /**
   * Handle Edit Parameter
   * @param {string} key : parameter id to edit
   */
  const handleParamEdit = useCallback(
    ({ key }) => {
      handleParameterDialog(key);
    },
    [handleParameterDialog]
  );

  /**
   * Handle Delete Parameter
   * @param {string} key : parameter id to delete
   * @param {string} value : parameter value, to construct the confirm phrase
   */
  const handleParamDelete = useCallback(
    ({ key, value }) => {
      const args = {
        submitText: t("Delete"),
        title: t('Confirm to delete "{{paramName}}"', { paramName: key }),
        onSubmit: () => model.current.deleteParameter(key),
        message: t(
          'Are you sure you want to delete the param "{{paramName}}" with the value "{{value}}"?',
          { paramName: key, value }
        )
      };
      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CONFIRMATION, args);
    },
    [model, call, t]
  );

  /**
   * Handle Add group click
   */
  const handleAddGroupClick = useCallback(() => {
    editGroupName(groupName => model.current.addGroup(groupName));
  }, [editGroupName, model]);

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
      <Typography className={`${classes.itemValue} ${classes.description}`}>
        {data.description}
      </Typography>
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
          list={params}
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
        {t("No Parameters")}
      </Typography>
    );
  }, [classes, editable, getParameters, handleParamDelete, handleParamEdit, t]);

  /**
   * Render groups
   * @returns {ReactElement} Groups to render in collapsible content
   */
  const renderGroups = useCallback(() => {
    const groups = Object.values(data.groups || {});
    return groups.length ? (
      groups.map(group => (
        <GroupItem
          key={group.id}
          item={group}
          model={model}
          editGroupName={editGroupName}
          editable={editable}
          handleGroupVisibility={handleGroupVisibility}
        />
      ))
    ) : (
      <Typography className={`${classes.itemValue} ${classes.disabled}`}>
        {t("No Groups")}
      </Typography>
    );
  }, [
    classes,
    data.groups,
    model,
    editable,
    editGroupName,
    handleGroupVisibility,
    t
  ]);

  return (
    <Typography component="div">
      <DetailsMenu name={name} details={data.details || {}}></DetailsMenu>
      <List>
        {/* ============ DESCRIPTION ============ */}
        <ListItem
          button
          data-menu-id={ACTIVE_ITEM.description}
          onClick={handleExpandClick}
        >
          <ListItemText primary={t("Description")} />
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
          data-menu-id={ACTIVE_ITEM.parameters}
          onClick={handleExpandClick}
        >
          <ListItemText primary={t("Parameters")} />
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
        <ListItem
          button
          data-menu-id={ACTIVE_ITEM.groups}
          onClick={handleExpandClick}
        >
          <ListItemText primary={t("Groups")} />
          <IconButton
            disabled={!editable}
            onClick={e => {
              e.stopPropagation();
              handleAddGroupClick();
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

Menu.propTypes = {
  name: PropTypes.string.isRequired,
  model: PropTypes.object.isRequired,
  details: PropTypes.object.isRequired,
  call: PropTypes.func.isRequired,
  handleGroupVisibility: PropTypes.func.isRequired,
  editable: PropTypes.bool
};

export default Menu;
