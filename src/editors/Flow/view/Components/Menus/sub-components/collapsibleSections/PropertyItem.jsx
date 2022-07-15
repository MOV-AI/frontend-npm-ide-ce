import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select
} from "@material-ui/core";

import { propertiesStyles } from "../../styles";

const PropertyItem = ({
  name,
  title,
  options,
  value,
  templateValue,
  editable,
  onChangeProperties
}) => {
  // Other hooks
  const { t } = useTranslation();
  const classes = propertiesStyles();

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle On Change Event
   * @param {object} evt : Event
   */
  const handleOnChange = useCallback(
    evt => {
      const prop = evt.currentTarget.dataset.prop;
      onChangeProperties(prop, evt.target.value);
    },
    [onChangeProperties]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get default text for properties template value
   * @param {boolean} isDefault : If option is default value
   * @returns {string} string to concatenate with label
   */
  const getDefaultText = useCallback(
    isDefault => (isDefault ? `(${t("Default")})` : ""),
    [t]
  );

  return (
    <Grid item xs={12} className={classes.gridAlign}>
      <FormControl fullWidth={true}>
        <InputLabel>{title}</InputLabel>
        <Select value={value} onChange={handleOnChange} disabled={!editable}>
          {options.map((option, optIndex) => {
            return (
              <MenuItem
                key={"properties-options-" + optIndex}
                value={option.value}
                data-prop={name}
              >
                {`${option.text} ${getDefaultText(
                  option.value === templateValue
                )}`}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Grid>
  );
};

PropertyItem.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChangeProperties: PropTypes.func.isRequired,
  name: PropTypes.string,
  options: PropTypes.array,
  templateValue: PropTypes.any,
  editable: PropTypes.bool
};

export default PropertyItem;
