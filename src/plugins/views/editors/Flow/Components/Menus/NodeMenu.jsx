import React, { useCallback, useEffect, useState, memo } from "react";
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
import {
  DATA_TYPES,
  TABLE_KEYS_NAMES,
  DIALOG_TITLE
} from "../../../../../../utils/Constants";
import ParameterEditorDialog from "../../../_shared/KeyValueTable/ParametersEditorDialog";
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
const NodeMenu = memo(
  ({
    nodeInst,
    openDialog,
    call,
    openDoc,
    editable,
    flowModel,
    groupsVisibilities
  }) => {
    const data = nodeInst.data;
    // State hooks
    const [templateData, setTemplateData] = useState({});
    const [activeItem, setActiveItem] = useState(0);
    const [nodeData, setNodeData] = useState({});
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
    const getNodeData = useCallback(
      () => flowModel.current.getNodeInstanceItem(data.id).serialize(),
      [data.id, flowModel]
    );

    /**
     * @param {Object} formData : Data to Save
     */
    const handleSubmitParameter = useCallback(
      formData => {
        const varName = formData.varName;
        const nodeInstance = flowModel.current.getNodeInstanceItem(data.id);

        if (nodeInstance.getKeyValue(varName, formData.name)) {
          if (formData.value === "") {
            nodeInstance.deleteKeyValue(varName, formData.name);
          } else {
            nodeInstance.updateKeyValueItem(varName, formData);
          }
        } else {
          nodeInstance.addKeyValue(varName, formData);
        }

        setNodeData(getNodeData());
      },
      [data.id, flowModel, getNodeData]
    );

    //========================================================================================
    /*                                                                                      *
     *                                    React Lifecycle                                   *
     *                                                                                      */
    //========================================================================================

    useEffect(() => {
      setNodeData(getNodeData());
    }, [getNodeData]);

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
        flowModel.current
          .getNodeInstanceItem(data.id)
          .updateKeyValueProp(prop, value);

        setNodeData(getNodeData());
      },
      [flowModel, data.id, getNodeData]
    );

    /**
     * Open dialog to edit/add new Parameter
     * @param {object} objData : data to construct the object
     * @param {ReactComponent} DialogComponent : Dialog component to render
     */
    const handleKeyValueDialog = useCallback(
      (objData, param) => {
        const paramType = t(DIALOG_TITLE[param.toUpperCase()]);
        const obj = {
          ...objData,
          varName: param,
          type: objData.type ?? DATA_TYPES.ANY,
          name: objData.key,
          paramType
        };

        const method = "customDialog";
        const args = {
          onSubmit: handleSubmitParameter,
          title: t("Edit {{paramType}}", { paramType }),
          data: obj,
          showDefault: true,
          showValueOptions: true,
          disableName: true,
          disableType: true,
          disableDescription: true,
          preventRenderType: param !== TABLE_KEYS_NAMES.PARAMETERS,
          call
        };

        openDialog({ method, args }, ParameterEditorDialog);
      },
      [openDialog, call, handleSubmitParameter, t]
    );

    /**
     * Handle toggle belong to a group
     * @param {string} groupId : The id of the group to add / remove
     * @param {boolean} checked : The flag controling if we should add or remove
     */
    const handleBelongGroup = useCallback(
      (groupId, checked) => {
        const nodeInstance = flowModel.current.getNodeInstanceItem(data.id);
        if (checked) nodeInstance.addGroup(groupId);
        else nodeInstance.removeGroup(groupId);

        groupsVisibilities();
        setNodeData(getNodeData());
      },
      [data.id, flowModel, groupsVisibilities, getNodeData]
    );

    //========================================================================================
    /*                                                                                      *
     *                                        Render                                        *
     *                                                                                      */
    //========================================================================================

    /**
     * Simple extract method to lower complex cognitivity
     * @param {string} thisItem : to check if this is the active item
     */
    const renderExpandIcon = useCallback(
      thisItem => {
        return activeItem === thisItem ? <ExpandLess /> : <ExpandMore />;
      },
      [activeItem]
    );

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
          {renderExpandIcon(ACTIVE_ITEM.PROPERTIES)}
        </ListItem>
        <Collapse in={activeItem === ACTIVE_ITEM.PROPERTIES} unmountOnExit>
          <Grid container className={classes.gridContainer}>
            <PropertiesSection
              editable={editable}
              templateData={templateData}
              nodeInstance={nodeData}
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
          {renderExpandIcon(ACTIVE_ITEM.PARAMETERS)}
        </ListItem>
        <Collapse in={activeItem === ACTIVE_ITEM.PARAMETERS} unmountOnExit>
          <KeyValuesSection
            editable={editable}
            varName={TABLE_KEYS_NAMES.PARAMETERS}
            instanceValues={nodeData[TABLE_KEYS_NAMES.PARAMETERS] || {}}
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
          {renderExpandIcon(ACTIVE_ITEM.ENVVARS)}
        </ListItem>
        <Collapse in={activeItem === ACTIVE_ITEM.ENVVARS} unmountOnExit>
          <KeyValuesSection
            editable={editable}
            varName={TABLE_KEYS_NAMES.ENVVARS}
            instanceValues={nodeData[TABLE_KEYS_NAMES.ENVVARS] || {}}
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
          {renderExpandIcon(ACTIVE_ITEM.CMDLINE)}
        </ListItem>
        <Collapse in={activeItem === ACTIVE_ITEM.CMDLINE} unmountOnExit>
          <KeyValuesSection
            editable={editable}
            varName={TABLE_KEYS_NAMES.CMDLINE}
            instanceValues={nodeData[TABLE_KEYS_NAMES.CMDLINE] || {}}
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
          {renderExpandIcon(ACTIVE_ITEM.GROUP)}
        </ListItem>
        <Collapse in={activeItem === ACTIVE_ITEM.GROUP} unmountOnExit>
          <NodeGroupSection
            flowGroups={flowModel.current.getGroups().serialize()}
            nodeGroups={nodeData.groups}
            handleBelongGroup={handleBelongGroup}
          />
          <Divider />
        </Collapse>
      </Typography>
    );
  }
);

NodeMenu.propTypes = {
  nodeInst: PropTypes.object.isRequired,
  flowModel: PropTypes.object.isRequired,
  call: PropTypes.func.isRequired,
  openDoc: PropTypes.func.isRequired,
  groupsVisibilities: PropTypes.func.isRequired,
  editable: PropTypes.bool
};

NodeMenu.defaultProps = {
  editable: true
};

export default NodeMenu;
