import DataType from "../AbstractDataType";

class ArrayType extends DataType {
  // Array type properties definition
  key = "array";
  label = "Array";
  editComponent = (props, mode = "row") => {
    const editor = {
      row: _props => this.stringEditComponent(_props, "[]"),
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
    value = value.replace(/'/g, '"');
    return new Promise(resolve => {
      try {
        const parsed = this.getParsedValue(value);
        resolve({ success: Array.isArray(parsed), value });
      } catch (e) {
        resolve({ success: false, value });
      }
    });
  }
}

export default ArrayType;
