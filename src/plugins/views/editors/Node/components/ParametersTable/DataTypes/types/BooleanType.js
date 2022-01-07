import React from "react";
import { Checkbox } from "@material-ui/core";
import DataType from "../AbstractDataType";

class BooleanType extends DataType {
  // Boolean type properties definition
  key = "boolean";
  label = "Boolean";
  default = "False";

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
        const parsed = this.pythonToBool(value);
        const isValid = typeof parsed === "boolean";

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
   * Convert boolean to Python string
   * @param {boolean} value
   * @returns {string} : A string representing a Python boolean
   */
  boolToPython(value) {
    const options = {
      true: "True",
      false: "False"
    };

    return options[value] ?? options[false];
  }

  /**
   * Convert from Python string to boolean
   * @param {string} value : A string representing a Python boolean
   * @returns {boolean}
   */
  pythonToBool(value) {
    const options = {
      True: true,
      False: false
    };

    return options[value];
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
