import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

class ArrayType extends DataType {
  // Array type properties definition
  key = DATA_TYPES.ARRAY;
  label = "Array";
  default = "[]";

  editComponent = (props, mode = "row") => {
    const editor = {
      row: _props => this.stringEditComponent(_props, this.default),
      dialog: this.codeEditComponent
    };
    return editor[mode](props);
  };

  /**
   * Validate array value
   * @param {*} value
   * @returns
   */
  validate(value) {
    value = value?.replace(/'/g, '"');
    return new Promise(resolve => {
      try {
        if (checkIfDefaultOrDisabled(value)) {
          return resolve({ success: true, value });
        }
        const parsed = this.getParsedValue(value);
        resolve({ success: Array.isArray(parsed), value });
      } catch (e) {
        resolve({ success: false, value });
      }
    });
  }
}

export default ArrayType;
