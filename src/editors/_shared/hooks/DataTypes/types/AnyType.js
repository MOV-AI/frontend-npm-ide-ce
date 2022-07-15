import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";

class AnyType extends DataType {
  // Any type properties definition
  key = DATA_TYPES.ANY;
  label = "Any";
  editComponent = this.defaultStringEditor;

  /**
   * Validate value
   * @param {*} value
   * @returns
   */
  validate(value) {
    return Promise.resolve({ success: true, value });
  }
}

export default AnyType;
