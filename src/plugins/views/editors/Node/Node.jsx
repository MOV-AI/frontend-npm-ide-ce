import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import Model from "../../../../models/Node/Node";
import CallbackModel from "../../../../models/Callback/Callback";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import {
  DEFAULT_KEY_VALUE_DATA,
  TABLE_KEYS_NAMES,
  DIALOG_TITLE,
  DATA_TYPES,
  ROS_VALID_NAMES,
  PLUGINS,
  SCOPES,
  ALERT_SEVERITIES
} from "../../../../utils/Constants";
import { ERROR_MESSAGES } from "../../../../utils/Messages";
import ParameterEditorDialog from "../_shared/KeyValueTable/ParametersEditorDialog";
import KeyValueTable from "../_shared/KeyValueTable/KeyValueTable";
import useDataSubscriber from "../../../DocManager/useDataSubscriber";
import Description from "./components/Description/Description";
import ExecutionParameters from "./components/ExecutionParameters/ExecutionParameters";
import ParametersTable from "./components/ParametersTable/ParametersTable";
import IOConfig from "./components/IOConfig/IOConfig";
import useKeyValueMethods from "./components/hooks/useKeyValueMethods";
import Menu from "./Menu";

import { nodeStyles } from "./styles";

const Node = (props, ref) => {
  const {
    id,
    name,
    call,
    alert,
    instance,
    activateEditor,
    editable = true
  } = props;

  // Hooks
  const [protectedCallbacks, setProtectedCallbacks] = useState([]);
  const classes = nodeStyles();
  const { t } = useTranslation();
  const { getColumns } = useKeyValueMethods();
  const { data } = useDataSubscriber({
    instance,
    propsData: props.data,
    keysToDisconsider: Model.KEYS_TO_DISCONSIDER
  });
  const defaultColumns = getColumns();

  //========================================================================================
  /*                                                                                      *
   *                                      Validation                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * @summary: Validate document name against invalid characters. It accept ROS valid names
   * and can't accept two consecutive underscores.
   * @param {string} paramName : name of the document
   * @param {string} type : one of options "port" or "keyValue"
   * @param {object} previousData : Previous data row
   * @returns {object} {result: <boolean>, error: <string>}
   **/
  const validateName = useCallback(
    (paramName, type, previousData) => {
      const typeName = DIALOG_TITLE[type.toUpperCase()] ?? type;
      const newName = paramName.name ?? paramName;
      const re = ROS_VALID_NAMES;
      try {
        if (!paramName)
          throw new Error(
            t(ERROR_MESSAGES.TYPE_NAME_IS_MANDATORY, { typeName })
          );
        else if (!re.test(newName)) {
          throw new Error(t(ERROR_MESSAGES.INVALID_TYPE_NAME, { typeName }));
        }

        const previousName = previousData?.name ?? previousData;
        // Validate against repeated names
        const checkNewName = !previousName && data[type][newName];
        const checkNameChanged =
          previousName && previousName !== newName && data[type][newName];

        if (checkNameChanged || checkNewName) {
          throw new Error(t(ERROR_MESSAGES.MULTIPLE_ENTRIES_WITH_SAME_NAME));
        }
      } catch (error) {
        return { result: false, error: error.message };
      }
      return { result: true, error: "" };
    },
    [data, t]
  );

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  const updateDescription = value => {
    if (instance.current) instance.current.setDescription(value);
  };

  const updateExecutionParams = (param, value) => {
    if (instance.current) instance.current.setExecutionParameter(param, value);
  };

  const updatePath = value => {
    if (instance.current) instance.current.setPath(value);
  };

  const setPort = (value, resolve, reject, previousData) => {
    try {
      // Trim name
      value.name = value.name.trim();

      // Validate port name
      const validation = validateName(value.name, "ports", previousData);
      if (!validation.result) {
        throw new Error(validation.error);
      }

      // Check for transport/package/message
      if (!value.template)
        throw new Error(t(ERROR_MESSAGES.NO_TRANSPORT_PROTOCOL_CHOSEN));
      else if (!value.msgPackage)
        throw new Error(ERROR_MESSAGES.NO_PACKAGE_CHOSEN);
      else if (!value.message)
        throw new Error(ERROR_MESSAGES.NO_MESSAGE_CHOSEN);

      if (instance.current) {
        if (previousData?.template === value.template) {
          instance.current.updatePort(previousData.name, value);
          return resolve();
        } else instance.current.deletePort(value.id);

        const dataToSave = { [value.name]: value };
        instance.current.setPort(dataToSave);
        resolve();
      }
    } catch (err) {
      // Show alert
      alert({ message: err.message, severity: ALERT_SEVERITIES.ERROR });
      // Reject promise
      reject();
    }
  };

  const deletePort = (port, resolve) => {
    if (instance.current) instance.current.deletePort(port.name);
    resolve();
  };

  const updatePortCallback = useCallback(
    (ioConfigId, portName, callback) => {
      instance.current.setPortCallback(ioConfigId, portName, callback);
    },
    [instance]
  );

  const updateIOPortInputs = (
    value,
    ioConfigName,
    direction,
    ioPortKey,
    paramName
  ) => {
    instance.current.setPortParameter(
      ioConfigName,
      direction,
      ioPortKey,
      paramName,
      value
    );
  };

  const updateKeyValue = useCallback(
    (varName, newData, oldData, isNew) => {
      try {
        const keyName = newData.name;
        const dataToSave = { [keyName]: newData };
        // Validate port name
        const validation = validateName(keyName, varName, oldData.name);
        if (!validation.result) {
          throw new Error(validation.error);
        }
        if (isNew) {
          // update key value
          if (instance.current)
            instance.current.setKeyValue(varName, dataToSave);
        } else {
          // add key value
          if (instance.current)
            instance.current.updateKeyValueItem(varName, newData, oldData.name);
        }
      } catch (err) {
        if (err.message)
          alert({ message: err.message, severity: ALERT_SEVERITIES.ERROR });
      }
    },
    [instance, alert, validateName]
  );

  const deleteKeyValue = (varName, key) => {
    return new Promise((resolve, reject) => {
      if (instance.current) instance.current.deleteKeyValue(varName, key);
      if (instance.current.getKeyValue(varName, key)) reject();
      else resolve();
    });
  };

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = useCallback(() => {
    const details = props.data?.details ?? {};
    const menuName = `${id}-detail-menu`;
    const menuTitle = t("Node Details Menu");
    // add bookmark
    call(PLUGINS.RIGHT_DRAWER.NAME, PLUGINS.RIGHT_DRAWER.CALL.SET_BOOKMARK, {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        title: menuTitle,
        view: (
          <Menu id={id} name={name} details={details} model={instance}></Menu>
        )
      }
    });
  }, [call, id, name, props.data, instance, t]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Open dialog to edit/add new Parameter
   * @param {object} objData : data to construct the object
   * @param {ReactComponent} DialogComponent : Dialog component to render
   */
  const handleOpenEditDialog = useCallback(
    (param, dataId) => {
      const paramType = t(DIALOG_TITLE[param.toUpperCase()]);
      const isNew = !dataId;
      const objData = data[param][dataId] || DEFAULT_KEY_VALUE_DATA;
      const obj = {
        ...objData,
        varName: param,
        type: objData.type ?? DATA_TYPES.ANY,
        name: objData.key || dataId,
        paramType
      };
      const args = {
        onClose: activateEditor,
        onSubmit: formData => {
          return updateKeyValue(param, formData, obj, isNew);
        },
        nameValidation: newData =>
          Promise.resolve(validateName(newData, param, obj.name)),
        title: t("Edit {{paramType}}", { paramType }),
        data: obj,
        preventRenderType: param !== TABLE_KEYS_NAMES.PARAMETERS,
        call
      };

      call(
        PLUGINS.DIALOG.NAME,
        PLUGINS.DIALOG.CALL.CUSTOM_DIALOG,
        args,
        ParameterEditorDialog
      );
    },
    [data, validateName, updateKeyValue, call, activateEditor, t]
  );

  /**
   * Create new callback, set it in node port and open editor
   * @param {string} defaultMsg : Callback default message
   * @param {string} ioConfigName : I/O Config Name
   * @param {string} portName : Port name
   */
  const handleNewCallback = useCallback(
    (defaultMsg, ioConfigName, portName) => {
      const scope = CallbackModel.SCOPE;
      call(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.CALL.SAVE,
        {
          scope,
          name: " new_callback ",
          data: {
            message: defaultMsg
          }
        },
        res => {
          if (res.success) {
            const newTabData = {
              id: `${res.model.workspace}/${scope}/${res.name}`,
              name: res.name,
              scope
            };
            call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, newTabData);
            // Set new callback in Node Port
            updatePortCallback(ioConfigName, portName, res.name);
          }
        }
      );
    },
    [call, updatePortCallback]
  );

  /**
   * Open Callback
   * @param {string} callbackName : Callback name
   */
  const handleOpenCallback = useCallback(
    callbackName => {
      // If no callback name is passed -> returns
      if (!callbackName) return;
      // Open existing callback
      const scope = CallbackModel.SCOPE;
      call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
        scope,
        name: callbackName
      }).then(doc => {
        call(PLUGINS.TABS.NAME, PLUGINS.TABS.CALL.OPEN_EDITOR, {
          id: doc.getUrl(),
          name: doc.getName(),
          scope
        });
      });
    },
    [call]
  );

  /**
   * Handle Open SelectScopeModal
   * @param {object} modalData : Props to pass to SelectScopeModal
   * @param {string} ioConfigName : I/O Config Name
   * @param {string} portName : Port name
   */
  const handleOpenSelectScopeModal = useCallback(
    (modalData, ioConfigName, portName) => {
      call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.SELECT_SCOPE_MODAL, {
        ...modalData,
        onClose: activateEditor,
        onSubmit: selectedCallback => {
          const splitURL = selectedCallback.split("/");
          const callback = splitURL.length > 1 ? splitURL[2] : selectedCallback;
          // Set new callback in Node Port
          updatePortCallback(ioConfigName, portName, callback);
        }
      });
    },
    [call, updatePortCallback, activateEditor]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.GET_STORE,
      SCOPES.CALLBACK
    ).then(store => {
      setProtectedCallbacks(store.protectedDocs);
    });
  }, [call]);

  //========================================================================================
  /*                                                                                      *
   *                                   Render Functions                                   *
   *                                                                                      */
  //========================================================================================

  return (
    <Typography component="div" className={classes.container}>
      <Description
        onChangeDescription={updateDescription}
        editable={editable}
        nodeType={data.type}
        value={data.description}
      ></Description>
      <IOConfig
        {...props}
        editable={editable}
        ioConfig={data.ports}
        protectedCallbacks={protectedCallbacks}
        onIOConfigRowSet={setPort}
        onIOConfigRowDelete={deletePort}
        handleIOPortsInputs={updateIOPortInputs}
        handleOpenSelectScopeModal={handleOpenSelectScopeModal}
        handleOpenCallback={handleOpenCallback}
        handleNewCallback={handleNewCallback}
      />
      <ExecutionParameters
        path={data.path}
        remappable={data.remappable}
        persistent={data.persistent}
        launch={data.launch}
        editable={editable}
        onChangePath={updatePath}
        onChangeExecutionParams={updateExecutionParams}
      />
      <ParametersTable
        editable={editable}
        data={data.parameters}
        defaultColumns={defaultColumns}
        openEditDialog={handleOpenEditDialog}
        onRowDelete={deleteKeyValue}
      ></ParametersTable>
      <KeyValueTable
        title={t("Environment Variables")}
        editable={editable}
        data={data.envVars}
        columns={defaultColumns}
        openEditDialog={handleOpenEditDialog}
        onRowDelete={deleteKeyValue}
        varName="envVars"
      ></KeyValueTable>
      <KeyValueTable
        title={t("Command Line")}
        editable={editable}
        data={data.commands}
        columns={defaultColumns}
        openEditDialog={handleOpenEditDialog}
        onRowDelete={deleteKeyValue}
        varName="commands"
      ></KeyValueTable>
    </Typography>
  );
};

Node.scope = "Node";

Node.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  call: PropTypes.func.isRequired,
  data: PropTypes.object,
  instance: PropTypes.object,
  editable: PropTypes.bool
};

export default withEditorPlugin(Node);
export { Node as NodeComponent };
