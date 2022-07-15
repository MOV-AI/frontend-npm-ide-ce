import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Collapse, Divider, ListItem, ListItemText } from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import {
  DATA_TYPES,
  PLUGINS,
  TABLE_KEYS_NAMES,
  DIALOG_TITLE,
  DEFAULT_VALUE
} from "../../../../../utils/Constants";
import ParameterEditorDialog from "../../../../_shared/KeyValueTable/ParametersEditorDialog";
import KeyValuesSection from "./sub-components/collapsibleSections/KeyValuesSection";
import MenuDetails from "./sub-components/MenuDetails";

const ContainerMenu = props => {
  // Props
  const { nodeInst, call, openDoc, flowModel, editable } = props;
  // State hooks
  const [templateData, setTemplateData] = useState({});
  const [flowData, setFlowData] = useState({});
  const [expanded, setExpanded] = useState(false);
  // Other hooks
  const { t } = useTranslation();
  const data = nodeInst.data;

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get the node instance item
   * @param {string} id : Node instance Item Id
   * @returns {NodeInstance}
   */
  const getFlowData = useCallback(async () => {
    const containerInstance = flowModel.current.getSubFlowItem(data.id);
    if (containerInstance) {
      return containerInstance;
    }

    const subFlowInst = await call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.READ,
      {
        scope: "Flow",
        name: nodeInst.parent.data.ContainerFlow
      }
    );

    return subFlowInst.getSubFlowItem(data.id);
  }, [data.id, nodeInst, flowModel, call]);

  const setFlowDataInst = containerInstance => {
    setFlowData(containerInstance.serialize());
  };

  /**
   * @param {Object} formData : Data to Save
   */
  const handleSubmitParameter = useCallback(
    async formData => {
      const varName = formData.varName;
      const containerInstance = await getFlowData();

      if (containerInstance.getKeyValue(varName, formData.name)) {
        if (formData.value === DEFAULT_VALUE) {
          containerInstance.deleteKeyValue(varName, formData.name);
        } else {
          containerInstance.updateKeyValueItem(varName, formData);
        }
      } else {
        containerInstance.addKeyValue(varName, formData);
      }
      setFlowDataInst(containerInstance);
    },
    [getFlowData]
  );

  /**
   * @private Handle Delete invalid parameters
   * @param {string} paramName : Parameter name
   * @param {string} varName : keyValue type (parameters, envVars or cmdLine)
   */
  const handleDeleteParameter = useCallback(
    async (paramName, varName) => {
      const containerInstance = await getFlowData();
      containerInstance.deleteKeyValue(varName, paramName);
      setFlowDataInst(containerInstance);
    },
    [getFlowData]
  );

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Toggle expanded state of Parameter collapsible section
   */
  const toggleExpanded = useCallback(() => {
    setExpanded(prevState => !prevState);
  }, []);

  /**
   * Open dialog to edit/add new Parameter
   * @param {string} dataId : Unique identifier of item (undefined when not created yet)
   * @param {string} varName : keyValue type (parameters, envVars or cmdLine)
   * @param {boolean} viewOnly : Disable all inputs if True
   */
  const handleKeyValueDialog = useCallback(
    (keyValueData, varName, viewOnly) => {
      const paramType = t(DIALOG_TITLE[varName.toUpperCase()]);
      const obj = {
        ...keyValueData,
        varName: varName,
        type: keyValueData.type ?? DATA_TYPES.ANY,
        name: keyValueData.key,
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
        preventRenderType: varName !== TABLE_KEYS_NAMES.PARAMETERS,
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

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // Component Did Mount
  useEffect(() => {
    // Get node data
    const fetchData = async () => {
      // get the data from the api
      const containerInstance = await getFlowData();

      // set state with the result
      setFlowDataInst(containerInstance);
    };

    fetchData();
  }, [getFlowData]);

  useEffect(() => {
    const name = data?.ContainerFlow;
    if (!name) return;
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
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div data-testid="section_flow-container-menu">
      <MenuDetails
        id={data.id}
        model={data.model}
        template={data.ContainerFlow}
        label="TemplateName-Colon"
        type={"Sub-Flow"}
        openDoc={openDoc}
      />
      {/* =========================== PARAMETERS =========================== */}
      <ListItem
        data-testid="input_toggle-expanded-parameters"
        button
        onClick={toggleExpanded}
      >
        <ListItemText primary={t("Parameters")} />
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={expanded} unmountOnExit>
        <KeyValuesSection
          editable={editable}
          varName={TABLE_KEYS_NAMES.PARAMETERS}
          instanceValues={flowData[TABLE_KEYS_NAMES.PARAMETERS] || {}}
          templateValues={templateData.parameters}
          handleTableKeyEdit={handleKeyValueDialog}
          handleTableKeyDelete={handleKeyValueDelete}
        />
        <Divider />
      </Collapse>
    </div>
  );
};

ContainerMenu.propTypes = {
  flowModel: PropTypes.object.isRequired,
  call: PropTypes.func.isRequired,
  openDoc: PropTypes.func.isRequired,
  nodeInst: PropTypes.object.isRequired,
  editable: PropTypes.bool
};

ContainerMenu.defaultProps = {
  editable: false
};

export default ContainerMenu;
