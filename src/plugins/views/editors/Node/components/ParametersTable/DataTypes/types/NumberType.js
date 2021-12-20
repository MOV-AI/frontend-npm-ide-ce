import React from "react";
import { TextField } from "@material-ui/core";
import DataType from "../AbstractDataType";

class NumberType extends DataType {
  // Number type properties definition
  key = "number";
  label = "Number";
  editComponent = props => {
    return (
      <TextField
        fullWidth
        type="number"
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
        const parsed = this.getParsedValue(value);
        const isValid = typeof parsed === "number" && !isNaN(parsed);
        resolve({ success: isValid });
      } catch (e) {
        resolve({ success: false });
      }
    });
  }
}

export default NumberType;
