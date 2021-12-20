import React from "react";
import PropTypes from "prop-types";
import Model from "../../../../models/Node/Node";
import { useTranslation } from "../_shared/mocks";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import InfoIcon from "@material-ui/icons/Info";
import Menu from "./Menu";
import Loader from "../_shared/Loader/Loader";
import Description from "./components/Description/Description";
import ExecutionParameters from "./components/ExecutionParameters/ExecutionParameters";
import ParametersTable from "./components/ParametersTable/ParametersTable";
import KeyValueTable from "./components/KeyValueTable/KeyValueTable";
import KeyValueEditorDialog from "./components/KeyValueTable/KeyValueEditorDialog";
import useKeyValueMethods from "./components/KeyValueTable/useKeyValueMethods";

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
  const {
    id,
    name,
    call,
    instance,
    data = new Model({}).serialize(),
    editable = true
  } = props;
  // State Hooks
  const [loading, setLoading] = React.useState(true);
  // Hooks
  const classes = useStyles();
  const { t } = useTranslation();
  const { getColumns, renderValueEditor } = useKeyValueMethods();
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

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = React.useCallback(() => {
    const details = data.details ?? {};
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: <Menu id={id} name={name} details={details}></Menu>
      }
    });
  }, [call, id, name, data.details]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  React.useEffect(() => {
    console.log("debug data changed", data);
    if (data.id && loading) setLoading(false);
  }, [data, loading]);

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
        onSubmit: updateKeyValue,
        renderValueEditor: renderValueEditor,
        title: DIALOG_TITLE[varName],
        disableName: !isNew,
        data: obj,
        varName,
        isNew,
        call
      },
      DialogComponent
    );
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

  const updateKeyValue = (varName, keyValueData) => {
    const formatData = { [keyValueData.name]: keyValueData };
    if (instance.current) instance.current.setKeyValue(varName, formatData);
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

  const renderNodeEditor = () => {
    if (loading) return <Loader />;
    return (
      <Typography component="div" className={classes.container}>
        <Description
          onChangeDescription={updateDescription}
          editable={editable}
          nodeType={data.type}
          value={data.description}
        ></Description>
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

  return (
    <Typography component="div" className={classes.root}>
      {renderNodeEditor()}
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
