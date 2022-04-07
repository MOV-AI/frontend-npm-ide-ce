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
  DIALOG_TITLE
} from "../../../../../../utils/Constants";
import ParameterEditorDialog from "../../../_shared/KeyValueTable/ParametersEditorDialog";
import KeyValuesSection from "./sub-components/collapsibleSections/KeyValuesSection";
import MenuDetails from "./sub-components/MenuDetails";

const ContainerMenu = props => {
  // Props
  const { nodeInst, call, openDoc, flowModel, editable, activateEditor } =
    props;
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

  const getFlowData = useCallback(
    () => flowModel.current.getSubFlowItem(data.id).serialize(),
    [data.id, flowModel]
  );

  /**
   * @param {Object} formData : Data to Save
   */
  const handleSubmitParameter = useCallback(
    formData => {
      const varName = formData.varName;
      const containerInstance = flowModel.current.getSubFlowItem(data.id);
      if (containerInstance.getKeyValue(varName, formData.name)) {
        if (formData.value === "") {
          containerInstance.deleteKeyValue(varName, formData.name);
        } else {
          containerInstance.updateKeyValueItem(varName, formData);
        }
      } else {
        containerInstance.addKeyValue(varName, formData);
      }
      setFlowData(getFlowData());
    },
    [flowModel, data.id, getFlowData]
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
   * @param {ReactComponent} DialogComponent : Dialog component to render
   */
  const handleKeyValueDialog = useCallback(
    (keyValueData, param) => {
      const paramType = t(DIALOG_TITLE[param.toUpperCase()]);
      const obj = {
        ...keyValueData,
        varName: param,
        type: keyValueData.type ?? DATA_TYPES.ANY,
        name: keyValueData.key,
        paramType
      };

      const args = {
        onClose: activateEditor,
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

      call(
        PLUGINS.DIALOG.NAME,
        PLUGINS.DIALOG.CALL.CUSTOM_DIALOG,
        args,
        ParameterEditorDialog
      );
    },
    [call, handleSubmitParameter, activateEditor, t]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // Component Did Mount
  useEffect(() => {
    setFlowData(getFlowData());
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
    <>
      <MenuDetails
        id={data.id}
        model={data.model}
        template={data.ContainerFlow}
        label={"Template Name:"}
        type={"Sub-Flow"}
        openDoc={openDoc}
      />
      {/* =========================== PARAMETERS =========================== */}
      <ListItem button onClick={toggleExpanded}>
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
        />
        <Divider />
      </Collapse>
    </>
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
