import React from "react";
import { TextField } from "@material-ui/core";
import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

class NumberType extends DataType {
  // Number type properties definition
  key = DATA_TYPES.NUMBER;
  label = "Number";
  default = "0";

  editComponent = props => {
    return (
      <TextField
        fullWidth
        type={DATA_TYPES.NUMBER}
        placeholder={"0"}
        value={props.rowData.value || ""}
        disabled={props.disabled}
        onChange={evt => props.onChange(evt.target.value)}
      ></TextField>
    );
  };

  /**
   * Validate number value
   * @param {*} value
   * @returns
   */
  validate(value) {
    return new Promise(resolve => {
      try {
        if (checkIfDefaultOrDisabled(value)) {
          return resolve({ success: true, value });
        }
        const parsed = this.parseValueToFloat(value);
        const isValid = typeof parsed === DATA_TYPES.NUMBER && !isNaN(parsed);
        resolve({ success: isValid, parsed });
      } catch (e) {
        resolve({ success: false });
      }
    });
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Parse float correctly
   * @param {string} value
   * @returns {boolean} : false if the string contains any commas (,)
   * @returns {float} : A float with the parsedFloat value
   */
  parseValueToFloat(value) {
    if (value.indexOf(",") >= 0) return false;

    return parseFloat(value);
  }
}

export default NumberType;
