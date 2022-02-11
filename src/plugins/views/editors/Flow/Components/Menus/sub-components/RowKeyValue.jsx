import React from "react";
import PropTypes from "prop-types";
import Edit from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import IconButton from "@material-ui/core/IconButton";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { Typography } from "@material-ui/core";

import { rowKeyValueStyles } from "../styles";
import { useCallback } from "react";

const RowKeyValue = ({
  item,
  allowEdit,
  allowDelete,
  type,
  handleParameterEditModal,
  handleParameterDeleteModal
}) => {
  const classes = rowKeyValueStyles();
  const viewOnly = !allowEdit && !allowDelete;

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Render strings with quotes and other types as it is
   * @param {*} value
   * @param {String} type
   * @returns {String} rendered value
   */
  const getValue = (value, valueType) => {
    return valueType === "string" ? JSON.stringify(value) : value;
  };

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle Key Value Edit Dialog
   */
  const handleKeyValueEditModal = useCallback(() => {
    handleParameterEditModal(item, type);
  }, [item, type, handleParameterEditModal]);

  /**
   * Handle Key Value Delete Dialog
   */
  const handleKeyValueDeleteModal = useCallback(() => {
    handleParameterDeleteModal(item, type);
  }, [item, type, handleParameterDeleteModal]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Render the Parameter row
   * @param {object} item : Item to be rendered
   * @returns {JSXElement}
   */
  const renderParamRow = useCallback(
    item => {
      if (item.value === "" || item.value === null) {
        return (
          <Typography
            component="div"
            className={`${classes.valueDefault} ${classes.valueContainer}`}
          >
            {getValue(item.defaultValue, item.type)}
          </Typography>
        );
      } else if (item.value === "None") {
        return (
          <Typography
            component="div"
            className={`${classes.valueNone} ${classes.valueContainer}`}
          >
            {getValue(item.defaultValue, item.type)}
          </Typography>
        );
      } else {
        return (
          <Typography component="div" className={classes.valueContainer}>
            {getValue(item.value, item.type)}
          </Typography>
        );
      }
    },
    [classes.valueDefault, classes.valueContainer, classes.valueNone]
  );

  return (
    <Typography component="div" className={classes.rowContainer}>
      <Typography
        component="div"
        className={`${classes.keyContainer} ${
          item.value === "None" ? classes.valueNone : ""
        }`}
      >
        {item.key}
      </Typography>
      {renderParamRow(item)}
      {(allowEdit || viewOnly) && (
        <IconButton onClick={handleKeyValueEditModal} size="small">
          {viewOnly ? <VisibilityIcon /> : <Edit></Edit>}
        </IconButton>
      )}
      {allowDelete && (
        <IconButton onClick={handleKeyValueDeleteModal} size="small">
          <DeleteIcon />
        </IconButton>
      )}
    </Typography>
  );
};

RowKeyValue.propTypes = {
  item: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  handleParameterEditModal: PropTypes.func,
  handleParameterDeleteModal: PropTypes.func,
  allowDelete: PropTypes.bool,
  allowEdit: PropTypes.bool
};

RowKeyValue.defaultProps = {
  allowDelete: false,
  allowEdit: false
};

export default RowKeyValue;
