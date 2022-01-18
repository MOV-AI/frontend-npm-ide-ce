import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Collapse, Divider, ListItem, ListItemText } from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import MenuDetails from "./sub-components/MenuDetails";
import { useTranslation, DEFAULT_FUNCTION } from "../../../_shared/mocks";
import ParametersSection from "./sub-components/collapsibleSections/ParametersSection";

const ContainerMenu = props => {
  // Props
  const { nodeInst, call, openDoc, editable } = props;
  // State hooks
  const [templateData, setTemplateData] = React.useState({});
  const [expanded, setExpanded] = React.useState(false);
  // Other hooks
  const { t } = useTranslation();
  const data = nodeInst.data;

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

  const handleParamEdit = useCallback(paramData => {
    console.log("debug handleParamEdit", paramData);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    const name = data?.ContainerFlow;
    if (!name) return;
    // Read node template
    call("docManager", "read", { name, scope: data.model }).then(doc => {
      setTemplateData(doc.serializeToDB());
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
        <ParametersSection
          editable={editable}
          instanceValues={data.Parameter}
          templateValues={templateData.Parameter}
          handleParamEdit={handleParamEdit}
        />
        <Divider />
      </Collapse>
    </>
  );
};

ContainerMenu.propTypes = {
  call: PropTypes.func,
  openDoc: PropTypes.func,
  editable: PropTypes.bool,
  nodeInst: PropTypes.object
};

ContainerMenu.defaultProps = {
  editable: false,
  nodeInst: { data: {} },
  call: () => DEFAULT_FUNCTION("call"),
  openDoc: () => DEFAULT_FUNCTION("openDoc")
};

export default ContainerMenu;
