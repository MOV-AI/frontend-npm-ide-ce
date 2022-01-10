import React from "react";
import PropTypes from "prop-types";
import Model from "../../../../models/Node/Node";
import CallbackModel from "../../../../models/Callback/Callback";
import { useTranslation } from "../_shared/mocks";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import InfoIcon from "@material-ui/icons/Info";
import Menu from "./Menu";
import Description from "./components/Description/Description";
import ExecutionParameters from "./components/ExecutionParameters/ExecutionParameters";
import ParametersTable from "./components/ParametersTable/ParametersTable";
import KeyValueTable from "./components/KeyValueTable/KeyValueTable";
import KeyValueEditorDialog from "./components/KeyValueTable/KeyValueEditorDialog";
import IOConfig from "./components/IOConfig/IOConfig";
import useKeyValueMethods from "./components/KeyValueTable/useKeyValueMethods";
import useDataSubscriber from "../../../DocManager/useDataSubscriber";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  container: {
    flexGrow: 1,
    padding: "15px",
    overflowY: "auto"
  }
}));

const Node = (props, ref) => {
  const { id, name, call, alert, instance, editable = true } = props;

  // Hooks
  const classes = useStyles();
  const { t } = useTranslation();
  const { getColumns, renderValueEditor } = useKeyValueMethods();
  const { data } = useDataSubscriber({
    instance,
    propsData: props.data,
    keysToDisconsider: [
      Model.OBSERVABLE_KEYS.DESCRIPTION,
      Model.OBSERVABLE_KEYS.NAME,
      Model.OBSERVABLE_KEYS.PATH
    ]
  });
  const defaultColumns = getColumns();

  //========================================================================================
  /*                                                                                      *
   *                                       Constants                                      *
   *                                                                                      */
  //========================================================================================

  const DIALOG_TITLE = {
    parameters: t("Parameter"),
    commands: t("Command Line"),
    envVars: t("Environment Variable")
  };

  const DEFAULT_KEY_VALUE_DATA = {
    name: "",
    description: "",
    type: "any",
    value: ""
  };

  const ROS_VALID_NAMES = new RegExp(
    /(?!.*__.*)^[a-zA-Z~/]{1}?[a-zA-Z0-9_/]*$/
  );

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = React.useCallback(() => {
    const details = props.data?.details ?? {};
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: (
          <Menu id={id} name={name} details={details} model={instance}></Menu>
        )
      }
    });
  }, [call, id, name, props.data, instance]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Open dialog to edit/add new Parameter/CmdLine/EnvVars
   * @param {string} varName : One of options ("parameters", "commands", "envVars")
   * @param {string} dataId : Unique identifier of item (undefined when not created yet)
   * @param {ReactComponent} DialogComponent : Dialog component to render
   */
  const handleOpenEditDialog = (
    varName,
    dataId,
    DialogComponent = KeyValueEditorDialog
  ) => {
    const obj = data[varName][dataId] || DEFAULT_KEY_VALUE_DATA;
    const isNew = !dataId;
    call(
      "dialog",
      "customDialog",
      {
        onSubmit: (...args) => updateKeyValue(...args, obj, isNew),
        renderValueEditor: renderValueEditor,
        title: DIALOG_TITLE[varName],
        data: obj,
        varName,
        isNew,
        call
      },
      DialogComponent
    );
  };

  /**
   * Create new callback, set it in node port and open editor
   * @param {string} defaultMsg : Callback default message
   * @param {string} ioConfigName : I/O Config Name
   * @param {string} portName : Port name
   */
  const handleNewCallback = (defaultMsg, ioConfigName, portName) => {
    const scope = CallbackModel.SCOPE;
    call("dialog", "newDocument", {
      scope,
      onSubmit: newName => {
        call("docManager", "create", {
          scope,
          name: newName
        }).then(doc => {
          doc.setMessage(defaultMsg);
          // Create callback in DB
          call("docManager", "save", { scope, name: newName }).then(res => {
            if (res.success) {
              alert({
                message: "Callback created",
                severity: "success"
              });
              // Open editor of new callback
              const newTabData = {
                id: doc.getUrl(),
                name: newName,
                scope
              };
              call("tabs", "openEditor", newTabData);
              // Set new callback in Node Port
              updatePortCallback(ioConfigName, portName, newName);
            }
          });
        });
      }
    });
  };

  /**
   * Open Callback
   * @param {string} callbackName : Callback name
   */
  const handleOpenCallback = callbackName => {
    // If no callback name is passed -> returns
    if (!callbackName) return;
    // Open existing callback
    const scope = CallbackModel.SCOPE;
    call("docManager", "read", { scope, name: callbackName }).then(doc => {
      call("tabs", "openEditor", {
        id: doc.getUrl(),
        name: doc.getName(),
        scope
      });
    });
  };

  /**
   * Handle Open SelectScopeModal
   * @param {object} modalData : Props to pass to SelectScopeModal
   * @param {string} ioConfigName : I/O Config Name
   * @param {string} portName : Port name
   */
  const handleOpenSelectScopeModal = (modalData, ioConfigName, portName) => {
    call("dialog", "selectScopeModal", {
      ...modalData,
      onSubmit: selectedCallback => {
        const splitURL = selectedCallback.split("/");
        const callback = splitURL.length > 1 ? splitURL[2] : selectedCallback;
        // Set new callback in Node Port
        updatePortCallback(ioConfigName, portName, callback);
      }
    });
  };

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
  const validateName = (paramName, type, previousData) => {
    const re = ROS_VALID_NAMES;
    try {
      if (!paramName) throw new Error(`${type} name is mandatory`);
      else if (type === "ports" && !re.test(paramName)) {
        throw new Error(`Invalid ${type} name`);
      }

      // Validate against repeated names
      const checkNewName = !previousData && data[type][paramName];
      const checkNameChanged =
        previousData &&
        previousData.name !== paramName &&
        data[type][paramName];
      if (checkNameChanged || checkNewName) {
        throw new Error(`Cannot have 2 entries with the same name`);
      }
    } catch (error) {
      return { result: false, error: error.message };
    }
    return { result: true, error: "" };
  };

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
      if (!value.template) throw new Error("No Transport and Protocol chosen");
      else if (!value.msgPackage) throw new Error("No Package chosen");
      else if (!value.message) throw new Error("No Message chosen");

      if (previousData) {
        // Update port
        if (instance.current)
          instance.current.updatePort(previousData.name, value);
      } else {
        // Proceed with saving
        const dataToSave = { [value.name]: value };
        if (instance.current) instance.current.setPort(dataToSave);
      }
      resolve();
    } catch (err) {
      // Show alert
      alert({ message: err.message, severity: "error" });
      // Reject promise
      reject();
    }
  };

  const deletePort = (port, resolve) => {
    if (instance.current) instance.current.deletePort(port.name);
    resolve();
  };

  const updatePortCallback = (ioConfigId, portName, callback) => {
    instance.current.setPortCallback(ioConfigId, portName, callback);
  };

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

  const updateKeyValue = (varName, newData, oldData, isNew) => {
    try {
      const keyName = newData.name;
      const dataToSave = { [keyName]: newData };
      const previousData = !isNew && data[varName]?.[keyName];
      // Validate port name
      const validation = validateName(keyName, varName, previousData);
      if (!validation.result) {
        throw new Error(validation.error);
      }
      if (isNew) {
        // update key value
        if (instance.current) instance.current.setKeyValue(varName, dataToSave);
      } else {
        // add key value
        if (instance.current)
          instance.current.updateKeyValueItem(varName, oldData.name, newData);
      }
    } catch (err) {
      if (err.message) alert({ message: err.message, severity: "error" });
    }
  };

  const deleteKeyValue = (varName, key) => {
    return new Promise((resolve, reject) => {
      if (instance.current) instance.current.deleteKeyValue(varName, key);
      if (instance.current.getKeyValue(varName, key)) reject();
      else resolve();
    });
  };

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

export default withEditorPlugin(Node);
export { Node as NodeComponent };

Node.scope = "Node";

Node.propTypes = {
  profile: PropTypes.object.isRequired,
  data: PropTypes.object,
  editable: PropTypes.bool,
  alert: PropTypes.func
};
