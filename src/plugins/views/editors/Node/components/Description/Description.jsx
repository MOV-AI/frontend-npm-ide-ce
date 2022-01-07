import React, { memo } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import { useTranslation } from "../../../_shared/mocks";
import CollapsibleHeader from "../_shared/CollapsibleHeader";

// Node colors: Each node type has one specific correspondent color
const NODE_COLORS = {
  "ROS1/Nodelet": "#ef5b5b",
  "ROS1/Node": "#684551",
  "ROS1/Plugin": "#20a39e",
  "ROS1/StateM": "#006494",
  "MovAI/Node": "#be2424",
  "MovAI/State": "#52528c",
  "MovAI/Server": "#dec5e3",
  "MovAI/Flow": "#252125",
  "ROS2/Node": "#f7b05b",
  "ROS2/LifecycleNode": "#a5907e"
};

const useStyles = makeStyles(theme => ({
  root: {
    padding: "5px 0px 5px 0px",
    width: "100%"
  },
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  input: {
    margin: theme.spacing(1),
    fontFamily: "inherit",
    width: "80%",
    fontWeight: "bold"
  },
  text: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  center: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap"
  },
  nodeTypeMini: {
    width: "12px",
    height: "12px",
    marginRight: "6px",
    borderRadius: "3px"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  typeContainer: {
    display: "flex",
    alignItems: "center",
    position: "absolute",
    right: "100px",
    top: "20px"
  },
  details: { display: "flex", flexDirection: "column" },
  row: { display: "flex", flexDirection: "row" },
  heading: { fontSize: "1.5rem" },
  column: { flexBasis: "90%" }
}));

const Description = props => {
  // Props
  const { onChangeDescription, value, nodeType, editable } = props;
  // Hooks
  const { t } = useTranslation();
  const classes = useStyles();

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
    <CollapsibleHeader title={renderTitleSection()} defaultExpanded={true}>
      {/* ---------------- Description -------------------*/}
      <TextField
        disabled={!editable}
        className={classes.textField}
        label={t("Description")}
        rows="4"
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
