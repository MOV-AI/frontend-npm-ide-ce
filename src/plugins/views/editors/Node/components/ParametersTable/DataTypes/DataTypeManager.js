import AnyType from "./types/AnyType";
import ArrayType from "./types/ArrayType";
import BooleanType from "./types/BooleanType";
import ConfigurationType from "./types/ConfigurationType";
import NumberType from "./types/NumberType";
import ObjectType from "./types/ObjectType";
import StringType from "./types/StringType";

class DataTypeManager {
  constructor({ theme, selfProvision = true }) {
    // Initiate types
    this.dataTypes = new Map();
    if (selfProvision) {
      this.setDataType(StringType);
      this.setDataType(NumberType);
      this.setDataType(BooleanType);
      this.setDataType(ObjectType);
      this.setDataType(ArrayType);
      this.setDataType(ConfigurationType);
      this.setDataType(AnyType);
    }
    // Hooks
    this.theme = theme;
  }

  /**
   *
   * @param {DataType} DataType : DataType class
   */
  setDataType(DataType) {
    const dataTypeInstance = new DataType({ theme: this.theme });
    this.dataTypes.set(dataTypeInstance.getKey(), dataTypeInstance);
  }

  /**
   * Get all dataTypes
   * @returns {array} List of all data types
   */
  getTypeKeys() {
    return [...this.dataTypes.keys()];
  }

  /**
   * Get data types
   * @param {string} type
   * @returns
   */
  getType(type) {
    return this.dataTypes.get(type);
  }
}

export default DataTypeManager;
