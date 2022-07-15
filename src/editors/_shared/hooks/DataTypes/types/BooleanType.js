import React from "react";
import { Checkbox } from "@material-ui/core";
import { DATA_TYPES } from "../../../../../utils/Constants";
import { pythonToBool, boolToPython } from "../../../../../utils/Utils";
import DataType from "../AbstractDataType";

class BooleanType extends DataType {
  // Boolean type properties definition
  key = DATA_TYPES.BOOLEAN;
  label = "Boolean";
  default = boolToPython(false);

  editComponent = (props, mode = "row") => {
    let pyValue = this.toString(props.rowData.value).toLowerCase();
    const editor = {
      row: () => this.booleanEditComponent(props, pyValue),
      dialog: () => this.booleanEditComponent(props, pyValue, true)
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
        const parsed = pythonToBool(value);
        const isValid = typeof parsed === DATA_TYPES.BOOLEAN;

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
   * Render Boolean Type edit component
   * @param {*} props
   * @param {*} pyValue
   * @param {*} usePythonValue
   * @returns
   */
  booleanEditComponent(props, pyValue, usePythonValue) {
    let parsedValue = false;
    try {
      parsedValue = JSON.parse(pyValue);
      if (typeof parsedValue === DATA_TYPES.STRING)
        parsedValue = JSON.parse(parsedValue);
    } catch (e) {
      parsedValue = false;
    }

    // On change checkbox value
    const onChangeCheckbox = event => {
      const boolValue = event.target.checked;
      const value = usePythonValue ? boolToPython(boolValue) : boolValue;
      props.onChange(value);
    };

    return (
      <Checkbox
        color={"primary"}
        style={{ width: "fit-content" }}
        checked={parsedValue}
        onChange={onChangeCheckbox}
        disabled={props.disabled}
      />
    );
  }
}

export default BooleanType;
