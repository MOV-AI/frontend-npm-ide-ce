import DataType from "../AbstractDataType";

class ObjectType extends DataType {
  // Object type properties definition
  key = "object";
  label = "Object";
  default = "{}";

  editComponent = (props, mode = "row") => {
    const editor = {
      row: _props => this.stringEditComponent(_props, "{}"),
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
        const parsed = JSON.parse(value);
        resolve({ success: parsed.constructor === Object });
      } catch (e) {
        resolve({ success: false });
      }
    });
  }
}

export default ObjectType;
