import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import styles from "../../styles";
import TableKeyValue from "../TableKeyValue";
import { DEFAULT_FUNCTION, useTranslation } from "../../../../../_shared/mocks";
import {
  EMPTY_MESSAGE,
  TABLE_KEYS_NAMES
} from "../../../../Constants/constants";

const useStyles = makeStyles(styles);

const ParametersSection = props => {
  // Props
  const { editable, handleParamEdit, instanceValues, templateValues } = props;
  // State hooks
  const [params, setParams] = React.useState([]);
  // Other hooks
  const classes = useStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get parameters to render in menu
   * @returns {array} Formatted parameters to render in right menu
   */
  const getParameters = useCallback(() => {
    const output = [];
    const allParams = [
      ...Object.keys(instanceValues),
      ...Object.keys(templateValues)
    ];
    // Iterate all parameters
    allParams.forEach(param => {
      const value = instanceValues?.[param]?.Value || "";
      const type = templateValues?.[param]?.Type || "any";
      const description = templateValues?.[param]?.Description || "";
      const defaultValue = templateValues?.[param]?.Value || "";
      output.push({
        key: param,
        type,
        value,
        description,
        defaultValue
      });
    });
    setParams(output);
  }, [instanceValues, templateValues]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    getParameters();
  }, [getParameters]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return params.length > 0 ? (
    <Typography component="div" className={classes.parametersContainer}>
      <TableKeyValue
        list={params}
        allowEdit={editable}
        handleParameterEditModal={handleParamEdit}
        type="params"
        allowSearch
      />
    </Typography>
  ) : (
    <Typography className={`${classes.itemValue} ${classes.disabled}`}>
      {t(EMPTY_MESSAGE[TABLE_KEYS_NAMES.parameters])}
    </Typography>
  );
};

ParametersSection.propTypes = {
  editable: PropTypes.bool,
  handleParamEdit: PropTypes.func,
  instanceValues: PropTypes.object,
  templateValues: PropTypes.object
};

ParametersSection.defaultProps = {
  editable: false,
  instanceValues: {},
  templateValues: {},
  handleParamEdit: () => DEFAULT_FUNCTION("handleParamEdit")
};

export default ParametersSection;
