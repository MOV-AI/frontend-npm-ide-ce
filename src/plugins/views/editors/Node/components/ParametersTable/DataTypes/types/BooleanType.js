import React from "react";
import { Checkbox } from "@material-ui/core";
import DataType from "../AbstractDataType";

class BooleanType extends DataType {
  // Boolean type properties definition
  key = "boolean";
  label = "Boolean";
  editComponent = (props, mode = "row") => {
    let pyValue = this.toString(props.rowData.value).toLowerCase();
    const editor = {
      row: () => this.booleanEditComponent(props, pyValue),
      dialog: () => {
        if (props.rowData.value === "None")
          return this.codeEditComponent(props);
        else return this.booleanEditComponent(props, pyValue, true);
      }
    };
    return editor[mode]();
  };

  /**
   * Validate Boolean value
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

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Convert boolean to python value
   * @param {boolean} value
   */
  boolToPython(value) {
    value = this.toString(value);
    return value.charAt(0).toLocaleUpperCase() + value.slice(1);
  }

  /**
   *
   * @param {*} props
   * @param {*} pyValue
   * @param {*} usePythonValue
   * @returns
   */
  booleanEditComponent(props, pyValue, usePythonValue) {
    let parsedValue = false;
    try {
      parsedValue = JSON.parse(pyValue);
      if (typeof parsedValue === "string")
        parsedValue = JSON.parse(parsedValue);
    } catch (e) {
      parsedValue = false;
    }

    return (
      <Checkbox
        color={"primary"}
        style={{ width: "fit-content" }}
        checked={parsedValue}
        onChange={evt => {
          const boolValue = evt.target.checked;
          const value = usePythonValue
            ? this.boolToPython(boolValue)
            : boolValue;
          props.onChange(value);
        }}
        disabled={props.disabled}
      />
    );
  }
}

export default BooleanType;
