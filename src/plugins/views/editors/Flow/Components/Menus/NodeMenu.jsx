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
  DIALOG_TITLE,
  PLUGINS,
  SCOPES,
  DEFAULT_VALUE
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
  ({ nodeInst, call, openDoc, editable, flowModel, groupsVisibilities }) => {
    const data = nodeInst.data;
    // State hooks
    const [templateData, setTemplateData] = useState({});
    const [activeItem, setActiveItem] = useState(0);
    const [nodeData, setNodeData] = useState({});
    const [protectedDocs, setProtectedDocs] = useState([]);
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
     * @private Get the node instance item
     * @returns {NodeInstance}
     */
    const getNodeData = useCallback(async () => {
      const nodeInstanceItem = flowModel.current.getNodeInstanceItem(data.name);
      if (nodeInstanceItem) {
        return nodeInstanceItem;
      }

      const subFlowInst = await call(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.CALL.READ,
        {
          scope: "Flow",
          name: nodeInst.parent.data.ContainerFlow
        }
      );

      return subFlowInst.getNodeInstanceItem(data.name);
    }, [data.name, nodeInst, flowModel, call]);

    const setNodeDataInst = nodeInstance => {
      setNodeData(nodeInstance.serialize());
    };

    /**
     * @private Submit parameter change
     * @param {Object} formData : Data to Save
     */
    const handleSubmitParameter = useCallback(
      async formData => {
        const varName = formData.varName;
        const nodeInstance = await getNodeData();

        if (nodeInstance.getKeyValue(varName, formData.name)) {
          if (formData.value === DEFAULT_VALUE) {
            nodeInstance.deleteKeyValue(varName, formData.name);
          } else {
            nodeInstance.updateKeyValueItem(varName, formData);
          }
        } else {
          nodeInstance.addKeyValue(varName, formData);
        }

        setNodeDataInst(nodeInstance);
      },
      [getNodeData]
    );

    /**
     * @private Handle Delete invalid parameters
     * @param {string} paramName : Parameter name
     * @param {string} varName : keyValue type (parameters, envVars or cmdLine)
     */
    const handleDeleteParameter = useCallback(
      async (keyName, varName) => {
        const nodeInstance = await getNodeData();
        nodeInstance.deleteKeyValue(varName, keyName);
        setNodeDataInst(nodeInstance);
      },
      [getNodeData]
    );

    //========================================================================================
    /*                                                                                      *
     *                                    React Lifecycle                                   *
     *                                                                                      */
    //========================================================================================

    useEffect(() => {
      // Get node data
      const fetchData = async () => {
        // get the data from the api
        const nodeInstance = await getNodeData();

        // set state with the result
        setNodeDataInst(nodeInstance);
      };

      fetchData();

      // Get protected callbacks
      call(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.CALL.GET_STORE,
        SCOPES.CALLBACK
      ).then(store => {
        setProtectedDocs(store.protectedDocs);
      });
    }, [getNodeData, call]);

    useEffect(() => {
      const name = data?.Template;
      if (!data?.Template) return;
      // Read node template
      call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
        name,
        scope: data.model
      }).then(doc => {
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
      async (prop, value) => {
        const nodeInstance = await getNodeData();
        nodeInstance.updateKeyValueProp(prop, value);

        setNodeDataInst(nodeInstance);
      },
      [getNodeData]
    );

    /**
     * Open dialog to edit/add new Parameter
     * @param {object} objData : data to construct the object
     * @param {string} param : varName ("parameters", "envVars" or "cmdLine")
     * @param {boolean} viewOnly : Disable all inputs if True
     */
    const handleKeyValueDialog = useCallback(
      (objData, param, viewOnly) => {
        const paramType = t(DIALOG_TITLE[param.toUpperCase()]);
        const obj = {
          ...objData,
          varName: param,
          type: objData.type ?? DATA_TYPES.ANY,
          name: objData.key,
          paramType
        };

        const args = {
          onSubmit: handleSubmitParameter,
          title: t("EditParamType", { paramType }),
          data: obj,
          showDefault: !viewOnly,
          showValueOptions: true,
          showDescription: !viewOnly,
          disableName: true,
          disableType: true,
          disableDescription: true,
          preventRenderType: param !== TABLE_KEYS_NAMES.PARAMETERS,
          disabled: viewOnly,
          call
        };

        call(
          PLUGINS.DIALOG.NAME,
          PLUGINS.DIALOG.CALL.CUSTOM_DIALOG,
          args,
          ParameterEditorDialog
        );
      },
      [call, handleSubmitParameter, t]
    );

    /**
     * Show confirmation dialog before deleting parameter
     * @param {{key: string}} item : Object containing a key holding the param name
     * @param {string} varName : keyValue type (parameters, envVars or cmdLine)
     */
    const handleKeyValueDelete = useCallback(
      (item, varName) => {
        const paramName = item.key;
        call(PLUGINS.DIALOG.NAME, PLUGINS.DIALOG.CALL.CONFIRMATION, {
          submitText: t("Delete"),
          title: t("DeleteDocConfirmationTitle"),
          onSubmit: () => handleDeleteParameter(paramName, varName),
          message: t("DeleteKeyConfirmationMessage", { key: paramName })
        });
      },
      [call, handleDeleteParameter, t]
    );

    /**
     * Handle toggle belong to a group
     * @param {string} groupId : The id of the group to add / remove
     * @param {boolean} checked : The flag controling if we should add or remove
     */
    const handleBelongGroup = useCallback(
      async (groupId, checked) => {
        const nodeInstance = await getNodeData();
        if (checked) nodeInstance.addGroup(groupId);
        else nodeInstance.removeGroup(groupId);

        groupsVisibilities();
        setNodeDataInst(nodeInstance);
      },
      [groupsVisibilities, getNodeData]
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
      <Typography
        data-testid="section_flow-node-menu"
        component="div"
        className={classes.root}
      >
        <MenuDetails
          id={data.id}
          name={data.name}
          model={data.model}
          template={data.Template}
          label="TemplateName-Colon"
          type={templateData.type}
          openDoc={openDoc}
        />
        <PortsDetails
          openDoc={openDoc}
          templateData={templateData.ports}
          protectedDocs={protectedDocs}
        />
        {nodeData && (
          /* =========================== PROPERTIES =========================== */
          <>
            <ListItem
              data-testid="input_properties-expand"
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
              data-testid="input_parameters-expand"
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
                handleTableKeyDelete={handleKeyValueDelete}
              />
              <Divider />
            </Collapse>
            {/* =========================== ENV. VARIABLES =========================== */}
            <ListItem
              data-testid="input_env-var-expand"
              button
              data-menu-id={ACTIVE_ITEM.ENVVARS}
              onClick={handleExpandClick}
            >
              <ListItemText primary={t("EnvVars")} />
              {renderExpandIcon(ACTIVE_ITEM.ENVVARS)}
            </ListItem>
            <Collapse in={activeItem === ACTIVE_ITEM.ENVVARS} unmountOnExit>
              <KeyValuesSection
                editable={editable}
                varName={TABLE_KEYS_NAMES.ENVVARS}
                instanceValues={nodeData[TABLE_KEYS_NAMES.ENVVARS] || {}}
                templateValues={templateData.envVars}
                handleTableKeyEdit={handleKeyValueDialog}
                handleTableKeyDelete={handleKeyValueDelete}
              />
              <Divider />
            </Collapse>
            {/* =========================== COMMAND LINES =========================== */}
            <ListItem
              data-testid="input_cmd-line-expand"
              button
              data-menu-id={ACTIVE_ITEM.CMDLINE}
              onClick={handleExpandClick}
            >
              <ListItemText primary={t("CommandLine")} />
              {renderExpandIcon(ACTIVE_ITEM.CMDLINE)}
            </ListItem>
            <Collapse in={activeItem === ACTIVE_ITEM.CMDLINE} unmountOnExit>
              <KeyValuesSection
                editable={editable}
                varName={TABLE_KEYS_NAMES.CMDLINE}
                instanceValues={nodeData[TABLE_KEYS_NAMES.CMDLINE] || {}}
                templateValues={templateData.commands}
                handleTableKeyEdit={handleKeyValueDialog}
                handleTableKeyDelete={handleKeyValueDelete}
              />
              <Divider />
            </Collapse>
            {/* =========================== GROUP =========================== */}
            <ListItem
              data-testid="input_group-expand"
              button
              data-menu-id={ACTIVE_ITEM.GROUP}
              onClick={handleExpandClick}
            >
              <ListItemText primary={t("Group")} />
              {renderExpandIcon(ACTIVE_ITEM.GROUP)}
            </ListItem>
            <Collapse in={activeItem === ACTIVE_ITEM.GROUP} unmountOnExit>
              <NodeGroupSection
                data-testid="section_node-group-section"
                flowGroups={flowModel.current.getGroups().serialize()}
                nodeGroups={nodeData.groups}
                handleBelongGroup={handleBelongGroup}
              />
              <Divider />
            </Collapse>
          </>
        )}
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
