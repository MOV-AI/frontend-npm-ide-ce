import DataType from "../AbstractDataType";

class StringType extends DataType {
  // String type properties definition
  key = "string";
  label = "String";
  editComponent = (props, mode = "row") => {
    // Define editor by mode
    const editorByMode = {
      row: () => this.stringEditComponent(props, '""'),
      dialog: () => this.codeEditComponent(props)
    };
    // Return editor by mode
    return editorByMode[mode]();
  };

  /**
   * Validate string value
   * @param {*} value
   * @returns
   */
  validate(value) {
    return new Promise(resolve => {
      try {
        const parsed = this.getParsedValue(value);
        const isValid = typeof parsed === "string" || parsed instanceof String;
        resolve({ success: isValid });
      } catch (e) {
        console.log("debug e", e);
        resolve({ success: false, error: "String must be in quotes" });
      }
    });
  }
}

export default StringType;
