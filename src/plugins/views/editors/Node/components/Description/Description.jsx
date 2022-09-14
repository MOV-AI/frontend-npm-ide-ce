import React, { memo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { MOVAI_FLOW_TYPES } from "../../../Flow/Constants/constants";
import CollapsibleHeader from "../../../_shared/CollapsibleHeader/CollapsibleHeader";

import { descriptionStyles } from "./styles";

// Node colors: Each node type has one specific correspondent color
const NODE_COLORS = {
  [MOVAI_FLOW_TYPES.NODES.ROS1_NODELETE]: "#ef5b5b",
  [MOVAI_FLOW_TYPES.NODES.ROS1_NODE]: "#684551",
  [MOVAI_FLOW_TYPES.NODES.ROS1_PLUGIN]: "#20a39e",
  [MOVAI_FLOW_TYPES.NODES.ROS1_STATEM]: "#006494",
  [MOVAI_FLOW_TYPES.NODES.MOVAI_NODE]: "#be2424",
  [MOVAI_FLOW_TYPES.NODES.MOVAI_STATE]: "#52528c",
  [MOVAI_FLOW_TYPES.NODES.MOVAI_SERVER]: "#dec5e3",
  [MOVAI_FLOW_TYPES.NODES.MOVAI_FLOW]: "#252125",
  [MOVAI_FLOW_TYPES.NODES.ROS2_NODE]: "#f7b05b",
  [MOVAI_FLOW_TYPES.NODES.ROS2_LIFECYCLENODE]: "#a5907e"
};

const Description = props => {
  // Props
  const { onChangeDescription, value, nodeType, editable } = props;
  // Hooks
  const { t } = useTranslation();
  const classes = descriptionStyles();

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Header with node type
   * @returns {ReactElement} Element to be rendered in collapsible header
   */
  const renderTitleSection = () => {
    return (
      <>
        <Typography component="span" className={classes.heading}>
          {t("Description")}
        </Typography>
        {nodeType && (
          <Typography component="span" className={classes.typeContainer}>
            <>
              <Typography
                component="span"
                className={classes.nodeTypeMini}
                style={{ backgroundColor: NODE_COLORS[nodeType] }}
              ></Typography>
              <Typography component="span">{nodeType}</Typography>
            </>
          </Typography>
        )}
      </>
    );
  };

  return (
    <CollapsibleHeader
      testId="section_description"
      title={renderTitleSection()}
      defaultExpanded={true}
    >
      {/* ---------------- Description -------------------*/}
      <TextField
        inputProps={{ "data-testid": "input_description" }}
        disabled={!editable}
        className={classes.textField}
        label={t("Description")}
        minRows="4"
        multiline
        defaultValue={value}
        onChange={evt => onChangeDescription(evt.target.value)}
        margin="normal"
        variant="outlined"
      />
    </CollapsibleHeader>
  );
};

Description.propTypes = {
  value: PropTypes.string,
  nodeType: PropTypes.string,
  onChangeDescription: PropTypes.func,
  editable: PropTypes.bool
};

Description.defaultProps = {
  nodeType: "",
  value: "",
  onChangeDescription: (evt, text) => console.log(evt.target.value, text),
  editable: false
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  const sameDescription = prevProps.value === nextProps.value;
  const sameType = prevProps.nodeType === nextProps.nodeType;
  return sameType && sameDescription;
}

export default memo(Description, arePropsEqual);
