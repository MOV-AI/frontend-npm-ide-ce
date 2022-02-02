import React, { useCallback, useEffect, useState, useRef, memo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
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
import ParameterEditorDialog from "../../../_shared/KeyValueTable/ParametersEditorDialog";
import { TABLE_KEYS_NAMES } from "../../Constants/constants";
import MenuDetails from "./sub-components/MenuDetails";
import PortsDetails from "./sub-components/PortsDetails";
import PropertiesSection from "./sub-components/collapsibleSections/PropertiesSection";
import KeyValuesSection from "./sub-components/collapsibleSections/KeyValuesSection";
import NodeGroupSection from "./sub-components/collapsibleSections/NodeGroupSection";

import { nodeMenuStyles } from "./styles";

//========================================================================================
/*                                                                                      *
 *                                       Constants                                      *
 *                                                                                      */
//========================================================================================

const ACTIVE_ITEM = {
  PROPERTIES: 1,
  PARAMETERS: 2,
  ENVVARS: 3,
  CMDLINE: 4,
  GROUP: 5
};

/**
 * Node Menu Component
 * @param {*} props : Component props
 * @returns {ReaactElement} Node Menu
 */
const NodeMenu = memo(({ nodeInst, call, openDoc, editable, flowModel }) => {
  const data = nodeInst.data;
  // State hooks
  const nodeInstanceRef = useRef();
  const [templateData, setTemplateData] = useState({});
  const [nodeInstance, setNodeInstance] = useState({});
  const [activeItem, setActiveItem] = useState(0);
  // Other hooks
  const classes = nodeMenuStyles();
  const { t } = useTranslation();

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

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Get the node instance item
   * @param {string} id : Node instance Item Id
   * @returns {NodeInstance}
   */
  const getNodeInstance = useCallback(
    id => ({ ...flowModel.current.getNodeInstanceItem(id) }),
    [flowModel]
  );

  /**
   * @param {Object} formData : Data to Save
   */
  const handleSubmitParameter = useCallback(
    formData => {
      const varName = formData.varName;
      if (nodeInstanceRef.current.getKeyValue(varName, formData.name)) {
        nodeInstanceRef.current.updateKeyValueItem(varName, formData);
      } else {
        nodeInstanceRef.current.addKeyValue(varName, formData);
      }
      setNodeInstance(getNodeInstance(data.id));
    },
    [data.id, getNodeInstance]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // Component Did Mount
  useEffect(() => {
    nodeInstanceRef.current = flowModel.current.getNodeInstanceItem(data.id);
    setNodeInstance(getNodeInstance(data.id));
  }, [flowModel, data.id, getNodeInstance]);

  useEffect(() => {
    const name = data?.Template;
    if (!data?.Template) return;
    // Read node template
    call("docManager", "read", { name, scope: data.model }).then(doc => {
      setTemplateData(doc.serialize());
    });
  }, [data, call]);

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle Change Properties
   * @param {string} prop : property name to update
   * @param {boolean} value : property value to update
   */
  const onChangeProperties = useCallback(
    (prop, value) => {
      nodeInstanceRef.current.updateKeyValueProp(prop, value);

      setNodeInstance(getNodeInstance(data.id));
    },
    [data.id, getNodeInstance]
  );

  /**
   * Open dialog to edit/add new Parameter
   * @param {string} dataId : Unique identifier of item (undefined when not created yet)
   * @param {ReactComponent} DialogComponent : Dialog component to render
   */
  const handleKeyValueDialog = useCallback(
    (data, param) => {
      const obj = {
        varName: param,
        type: "any",
        name: data.key,
        ...data
      };
      call(
        "dialog",
        "customDialog",
        {
          onSubmit: handleSubmitParameter,
          customValidation: newData =>
            Promise.resolve({ result: true, data: newData }),
          title: t("Edit {{paramName}}", { paramName: obj.name }),
          data: obj,
          showDefault: true,
          disableName: true,
          disableType: true,
          disableDescription: true,
          preventRenderType: param !== TABLE_KEYS_NAMES.PARAMETERS,
          call
        },
        ParameterEditorDialog
      );
    },
    [call, handleSubmitParameter, t]
  );

  /**
   * Handle toggle belong to a group
   * @param {string} groupId : The id of the group to add / remove
   * @param {boolean} checked : The flag controling if we should add or remove
   */
  const handleBelongGroup = useCallback(
    (groupId, checked) => {
      if (checked) nodeInstanceRef.current.addGroup(groupId);
      else nodeInstanceRef.current.removeGroup(groupId);

      setNodeInstance(getNodeInstance(data.id));
    },
    [data.id, getNodeInstance]
  );

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
        type={templateData.type}
        openDoc={openDoc}
      />
      <PortsDetails openDoc={openDoc} templateData={templateData.ports} />
      {/* =========================== PROPERTIES =========================== */}
      <ListItem
        button
        data-menu-id={ACTIVE_ITEM.PROPERTIES}
        onClick={handleExpandClick}
      >
        <ListItemText primary={t("Properties")} />
        {activeItem === ACTIVE_ITEM.PROPERTIES ? (
          <ExpandLess />
        ) : (
          <ExpandMore />
        )}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.PROPERTIES} unmountOnExit>
        <Grid container className={classes.gridContainer}>
          <PropertiesSection
            editable={editable}
            templateData={templateData}
            nodeInstance={nodeInstance}
            onChangeProperties={onChangeProperties}
          />
        </Grid>
        <Divider />
      </Collapse>
      {/* =========================== PARAMETERS =========================== */}
      <ListItem
        button
        data-menu-id={ACTIVE_ITEM.PARAMETERS}
        onClick={handleExpandClick}
      >
        <ListItemText primary={t("Parameters")} />
        {activeItem === ACTIVE_ITEM.PARAMETERS ? (
          <ExpandLess />
        ) : (
          <ExpandMore />
        )}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.PARAMETERS} unmountOnExit>
        <KeyValuesSection
          editable={editable}
          varName={TABLE_KEYS_NAMES.PARAMETERS}
          instanceValues={Object.fromEntries(
            nodeInstance[TABLE_KEYS_NAMES.PARAMETERS]?.data || []
          )}
          templateValues={templateData.parameters}
          handleTableKeyEdit={handleKeyValueDialog}
        />
        <Divider />
      </Collapse>
      {/* =========================== ENV. VARIABLES =========================== */}
      <ListItem
        button
        data-menu-id={ACTIVE_ITEM.ENVVARS}
        onClick={handleExpandClick}
      >
        <ListItemText primary={t("Env. Variables")} />
        {activeItem === ACTIVE_ITEM.ENVVARS ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.ENVVARS} unmountOnExit>
        <KeyValuesSection
          editable={editable}
          varName={TABLE_KEYS_NAMES.ENVVARS}
          instanceValues={Object.fromEntries(
            nodeInstance[TABLE_KEYS_NAMES.ENVVARS]?.data || []
          )}
          templateValues={templateData.envVars}
          handleTableKeyEdit={handleKeyValueDialog}
        />
        <Divider />
      </Collapse>
      {/* =========================== COMMAND LINES =========================== */}
      <ListItem
        button
        data-menu-id={ACTIVE_ITEM.CMDLINE}
        onClick={handleExpandClick}
      >
        <ListItemText primary={t("Command Line")} />
        {activeItem === ACTIVE_ITEM.CMDLINE ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.CMDLINE} unmountOnExit>
        <KeyValuesSection
          editable={editable}
          varName={TABLE_KEYS_NAMES.CMDLINE}
          instanceValues={Object.fromEntries(
            nodeInstance[TABLE_KEYS_NAMES.CMDLINE]?.data || []
          )}
          templateValues={templateData.commands}
          handleTableKeyEdit={handleKeyValueDialog}
        />
        <Divider />
      </Collapse>
      {/* =========================== GROUP =========================== */}
      <ListItem
        button
        data-menu-id={ACTIVE_ITEM.GROUP}
        onClick={handleExpandClick}
      >
        <ListItemText primary={t("Group")} />
        {activeItem === ACTIVE_ITEM.GROUP ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={activeItem === ACTIVE_ITEM.GROUP} unmountOnExit>
        <NodeGroupSection
          flowGroups={flowModel.current.getGroups().serialize()}
          nodeGroups={nodeInstance.groups}
          handleBelongGroup={handleBelongGroup}
        />
        <Divider />
      </Collapse>
    </Typography>
  );
});

NodeMenu.propTypes = {
  nodeInst: PropTypes.object.isRequired,
  flowModel: PropTypes.object.isRequired,
  call: PropTypes.func.isRequired,
  openDoc: PropTypes.func.isRequired,
  editable: PropTypes.bool
};

NodeMenu.defaultProps = {
  editable: true
};

export default NodeMenu;
