import DataType from "../AbstractDataType";

class AnyType extends DataType {
  // Any type properties definition
  key = "any";
  label = "Any";
  editComponent = this.defaultStringEditor;

  /**
   * Validate value
   * @param {*} value
   * @returns
   */
  validate(value) {
    return Promise.resolve({ success: true });
  }
}

export default AnyType;
