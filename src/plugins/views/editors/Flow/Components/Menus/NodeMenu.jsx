import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { DEFAULT_FUNCTION, useTranslation } from "../../../_shared/mocks";
import { TABLE_KEYS_NAMES } from "../../Constants/constants";
import {
  Collapse,
  Divider,
  Grid,
  ListItem,
  ListItemText,
  Typography
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import styles from "./styles";
import MenuDetails from "./sub-components/MenuDetails";
import PortsDetails from "./sub-components/PortsDetails";
import PropertiesSection from "./sub-components/collapsibleSections/PropertiesSection";
import ParametersSection from "./sub-components/collapsibleSections/ParametersSection";
import KeyValuesSection from "./sub-components/collapsibleSections/KeyValuesSection";
import NodeGroupSection from "./sub-components/collapsibleSections/NodeGroupSection";

//========================================================================================
/*                                                                                      *
 *                                       Constants                                      *
 *                                                                                      */
//========================================================================================

const ACTIVE_ITEM = {
  properties: 1,
  parameters: 2,
  envVars: 3,
  cmdLine: 4,
  group: 5
};

const useStyles = makeStyles(styles);

/**
 * Node Menu Component
 * @param {*} props : Component props
 * @returns {ReaactElement} Node Menu
 */
const NodeMenu = props => {
  // Props
  const { nodeInst, call, openDoc, editable, flowModel } = props;
  // State hooks
  const [templateData, setTemplateData] = React.useState({});
  const [activeItem, setActiveItem] = React.useState(0);
  // Other hooks
  const classes = useStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  const data = nodeInst.data;

  /**
   * @private Handle expand/collapse action
   *  If item is collapsed : Expand item and collapse other
   *  If item is expanded  : Collapse item and let all others collapsed as well
   * @param {*} _activeItem
   */
  const handleExpandClick = useCallback(newActiveItem => {
    setActiveItem(prevState => {
      return prevState === newActiveItem ? 0 : newActiveItem;
    });
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    const name = data?.Template;
    if (!data?.Template) return;
    // Read node template
    call("docManager", "read", { name, scope: data.model }).then(doc => {
      setTemplateData(doc.serializeToDB());
    });
  }, [data, call]);

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  const onChangeProperties = useCallback((varName, value) => {
    console.log("debug onChangeProperties", varName, value);
  }, []);

  const handleParamEdit = useCallback(() => {
    console.log("debug handleParamEdit");
  }, []);

  const handleTableKeyEdit = useCallback((varName, value) => {
    console.log("debug handleParamEdit", varName, value);
  }, []);

  const handleBelongGroup = useCallback((groupId, checked) => {
    console.log("debug handleBelongGroup", groupId, checked);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <Typography component="div" className={classes.root}>
      <MenuDetails
        id={data.id}
        model={data.model}
        template={data.Template}
        type={templateData.Type}
        openDoc={openDoc}
      />
      <PortsDetails openDoc={openDoc} templateData={templateData.PortsInst} />
      {/* =========================== PROPERTIES =========================== */}
      <ListItem
        button
        onClick={() => handleExpandClick(ACTIVE_ITEM.properties)}
      >
        <ListItemText primary={t("Properties")} />
        {activeItem === ACTIVE_ITEM.properties ? (
          <ExpandLess />
        ) : (
          <ExpandMore />
        )}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.properties} unmountOnExit>
        <Grid container style={{ padding: "10px 20px 20px" }}>
          <PropertiesSection
            editable={editable}
            launch={data.Launch}
            persistent={data.Persistent}
            remappable={data.Remappable}
            templateData={templateData}
            onChangeProperties={onChangeProperties}
          />
        </Grid>
        <Divider />
      </Collapse>
      {/* =========================== PARAMETERS =========================== */}
      <ListItem
        button
        onClick={() => handleExpandClick(ACTIVE_ITEM.parameters)}
      >
        <ListItemText primary={t("Parameters")} />
        {activeItem === ACTIVE_ITEM.parameters ? (
          <ExpandLess />
        ) : (
          <ExpandMore />
        )}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.parameters} unmountOnExit>
        <ParametersSection
          editable={editable}
          instanceValues={data.Parameter}
          templateValues={templateData.Parameter}
          handleParamEdit={handleParamEdit}
        />
        <Divider />
      </Collapse>
      {/* =========================== ENV. VARIABLES =========================== */}
      <ListItem button onClick={() => handleExpandClick(ACTIVE_ITEM.envVars)}>
        <ListItemText primary={t("Env. Variables")} />
        {activeItem === ACTIVE_ITEM.envVars ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.envVars} unmountOnExit>
        <KeyValuesSection
          editable={editable}
          varName={TABLE_KEYS_NAMES.envVars}
          instanceValues={data.EnvVar}
          templateValues={templateData.EnvVar}
          handleTableKeyEdit={handleTableKeyEdit}
        />
        <Divider />
      </Collapse>
      {/* =========================== COMMAND LINES =========================== */}
      <ListItem button onClick={() => handleExpandClick(ACTIVE_ITEM.cmdLine)}>
        <ListItemText primary={t("Command Line")} />
        {activeItem === ACTIVE_ITEM.cmdLine ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.cmdLine} unmountOnExit>
        <KeyValuesSection
          editable={editable}
          varName={TABLE_KEYS_NAMES.cmdLine}
          instanceValues={data.CmdLine}
          templateValues={templateData.CmdLine}
          handleTableKeyEdit={handleTableKeyEdit}
        />
        <Divider />
      </Collapse>
      {/* =========================== GROUP =========================== */}
      <ListItem button onClick={() => handleExpandClick(ACTIVE_ITEM.group)}>
        <ListItemText primary={t("Group")} />
        {activeItem === ACTIVE_ITEM.group ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.group} unmountOnExit>
        <NodeGroupSection
          flowGroups={flowModel.current.getGroups().serialize()}
          nodeGroups={data.NodeLayers}
          handleBelongGroup={handleBelongGroup}
        />
        <Divider />
      </Collapse>
    </Typography>
  );
};

NodeMenu.propTypes = {
  flowName: PropTypes.string.isRequired,
  nodeInst: PropTypes.object.isRequired,
  layers: PropTypes.object,
  openDoc: PropTypes.func,
  editable: PropTypes.bool
};

NodeMenu.defaultProps = {
  openDoc: () => DEFAULT_FUNCTION(),
  layers: {},
  editable: true
};

export default NodeMenu;
