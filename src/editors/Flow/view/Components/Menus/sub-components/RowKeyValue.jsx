import React, { useCallback } from "react";
import PropTypes from "prop-types";
import Edit from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import IconButton from "@material-ui/core/IconButton";
import VisibilityIcon from "@material-ui/icons/Visibility";
import { Typography } from "@material-ui/core";
import {
  DATA_TYPES,
  DEFAULT_VALUE,
  DISABLED_VALUE
} from "../../../../../../utils/Constants";

import { rowKeyValueStyles } from "../styles";

const RowKeyValue = ({
  item,
  allowEdit,
  allowDelete,
  type,
  handleParameterEditModal,
  handleParameterDeleteModal
}) => {
  const classes = rowKeyValueStyles();
  const viewOnly = !allowEdit;

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
    return valueType === DATA_TYPES.STRING ? JSON.stringify(value) : value;
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
    handleParameterEditModal(item, type, viewOnly);
  }, [item, type, handleParameterEditModal, viewOnly]);

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
    row => {
      if (row.value === DEFAULT_VALUE || row.value === null) {
        return (
          <Typography
            component="div"
            className={`${classes.valueDefault} ${classes.valueContainer}`}
          >
            {getValue(row.defaultValue, row.type)}
          </Typography>
        );
      } else if (row.value === DISABLED_VALUE) {
        return (
          <Typography
            component="div"
            className={`${classes.valueNone} ${classes.valueContainer}`}
          >
            {getValue(row.defaultValue, row.type)}
          </Typography>
        );
      } else {
        return (
          <Typography component="div" className={classes.valueContainer}>
            {getValue(row.value, row.type)}
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
          item.value === DISABLED_VALUE ? classes.valueNone : ""
        }`}
      >
        {item.key}
      </Typography>
      {renderParamRow(item)}
      {(allowEdit || viewOnly) && (
        <IconButton
          data-testid="input_edit"
          onClick={handleKeyValueEditModal}
          size="small"
        >
          {viewOnly ? <VisibilityIcon /> : <Edit />}
        </IconButton>
      )}
      {allowDelete && (
        <IconButton
          data-testid="input_delete"
          onClick={handleKeyValueDeleteModal}
          size="small"
        >
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
