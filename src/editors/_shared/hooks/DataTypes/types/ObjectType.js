import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

class ObjectType extends DataType {
  // Object type properties definition
  key = DATA_TYPES.OBJECT;
  label = "Object";
  default = "{}";

  editComponent = (props, mode = "row") => {
    const editor = {
      row: _props => this.stringEditComponent(_props, this.default),
      dialog: this.codeEditComponent
    };
    return editor[mode](props);
  };

  /**
   * Validate object value
   * @param {*} value
   * @returns
   */
  validate(value) {
    return new Promise(resolve => {
      try {
        if (checkIfDefaultOrDisabled(value)) {
          return resolve({ success: true, value });
        }
        const parsed = JSON.parse(value);
        resolve({ success: parsed.constructor === Object });
      } catch (e) {
        resolve({ success: false });
      }
    });
  }
}

export default ObjectType;
