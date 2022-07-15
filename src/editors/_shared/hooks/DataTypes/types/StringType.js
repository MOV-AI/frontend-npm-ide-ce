import { DATA_TYPES } from "../../../../../utils/Constants";
import DataType from "../AbstractDataType";
import { checkIfDefaultOrDisabled } from "./utils";

class StringType extends DataType {
  // String type properties definition
  key = DATA_TYPES.STRING;
  label = "String";
  default = '""';

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
        if (checkIfDefaultOrDisabled(value)) {
          return resolve({ success: true, value });
        }
        const parsed = this.getParsedValue(value);
        const isValid =
          typeof parsed === DATA_TYPES.STRING || parsed instanceof String;
        resolve({ success: isValid });
      } catch (e) {
        resolve({ success: false, error: "MandatoryStringQuotes" });
      }
    });
  }
}

export default StringType;
