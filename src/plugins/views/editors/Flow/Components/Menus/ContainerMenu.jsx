import React, { useCallback, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Collapse, Divider, ListItem, ListItemText } from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ParameterEditorDialog from "../../../_shared/KeyValueTable/ParametersEditorDialog";
import { TABLE_KEYS_NAMES } from "../../Constants/constants";
import KeyValuesSection from "./sub-components/collapsibleSections/KeyValuesSection";
import MenuDetails from "./sub-components/MenuDetails";

const ContainerMenu = props => {
  // Props
  const { nodeInst, call, openDoc, flowModel, editable } = props;
  // State hooks
  const flowRef = useRef();
  const [templateData, setTemplateData] = useState({});
  const [flow, setFlow] = useState({});
  const [expanded, setExpanded] = useState(false);
  // Other hooks
  const { t } = useTranslation();
  const data = nodeInst.data;

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  const getSubFlow = useCallback(
    id => ({ ...flowModel.current.getSubFlowItem(id) }),
    [flowModel]
  );

  /**
   * @param {Object} formData : Data to Save
   */
  const handleSubmitParameter = useCallback(
    formData => {
      const varName = formData.varName;
      if (flowRef.current.getKeyValue(varName, formData.name)) {
        flowRef.current.updateKeyValueItem(varName, formData);
      } else {
        flowRef.current.addKeyValue(varName, formData);
      }
      setFlow(getSubFlow(data.id));
    },
    [data.id, getSubFlow]
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

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // Component Did Mount
  useEffect(() => {
    flowRef.current = flowModel.current.getSubFlowItem(data.id);
    setFlow(getSubFlow(data.id));
  }, [flowModel, data.id, getSubFlow]);

  useEffect(() => {
    const name = data?.ContainerFlow;
    if (!name) return;
    // Read node template
    call("docManager", "read", { name, scope: data.model }).then(doc => {
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
          instanceValues={Object.fromEntries(
            flow[TABLE_KEYS_NAMES.PARAMETERS]?.data || []
          )}
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
