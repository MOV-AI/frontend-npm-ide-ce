import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import styles from "../../styles";
import TableKeyValue from "../TableKeyValue";
import { DEFAULT_FUNCTION, useTranslation } from "../../../../../_shared/mocks";
import { EMPTY_MESSAGE } from "../../../../Constants/constants";

const useStyles = makeStyles(styles);

const KeyValuesSection = props => {
  const {
    editable,
    handleTableKeyEdit,
    instanceValues,
    templateValues,
    varName
  } = props;
  // State hooks
  const [keyValues, setKeyValues] = React.useState([]);
  // Other hooks
  const classes = useStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get values for Env. Variables and Command Lines
   * @returns {array} Formatted values to render in right menu
   */
  const getTableValues = useCallback(() => {
    const output = [];
    const allValues = [
      ...Object.keys(instanceValues),
      ...Object.keys(templateValues)
    ];
    allValues.forEach(key => {
      const value = instanceValues[key]?.Value || "";
      const defaultValue = templateValues[key]?.Value;
      const description = templateValues[key]?.Description || "";
      output.push({
        key,
        value,
        description,
        defaultValue
      });
    });
    // Set state
    setKeyValues(output);
  }, [instanceValues, templateValues]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    getTableValues();
  }, [getTableValues]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return keyValues.length > 0 ? (
    <Typography component="div" className={classes.parametersContainer}>
      <TableKeyValue
        list={keyValues}
        allowEdit={editable}
        handleParameterEditModal={handleTableKeyEdit}
        type={varName}
        allowSearch
      />
    </Typography>
  ) : (
    <Typography className={`${classes.itemValue} ${classes.disabled}`}>
      {t(EMPTY_MESSAGE[varName])}
    </Typography>
  );
};

KeyValuesSection.propTypes = {
  editable: PropTypes.bool,
  varName: PropTypes.string,
  handleParamEdit: PropTypes.func,
  instanceValues: PropTypes.object,
  templateValues: PropTypes.object
};

KeyValuesSection.defaultProps = {
  editable: false,
  varName: "",
  instanceValues: {},
  templateValues: {},
  handleTableKeyEdit: () => DEFAULT_FUNCTION("handleTableKeyEdit")
};

export default KeyValuesSection;
