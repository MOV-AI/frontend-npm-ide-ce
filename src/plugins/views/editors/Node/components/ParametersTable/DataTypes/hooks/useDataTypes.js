import { useTheme } from "@material-ui/core/styles";
import DataTypeManager from "../DataTypeManager";

const useDataTypes = () => {
  // Hooks
  const theme = useTheme();
  const dataTypeManager = new DataTypeManager({ theme });

  //========================================================================================
  /*                                                                                      *
   *                                    Exposed Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Get list of valid data types to be displayed in the select box
   * @param {Array} excluded : Excluded keys
   * @returns {Array} List of valid data types to be displayed in the select box
   */
  const getDataTypes = (excluded = ["config"]) => {
    return dataTypeManager
      .getTypeKeys()
      .filter(type => !excluded.includes(type));
  };

  /**
   * Get data type label
   * @param {string} dataType
   * @returns {string} Type Label
   */
  const getLabel = dataType => {
    return dataTypeManager.getType(dataType)?.getLabel();
  };

  /**
   * Get edit component
   * @param {string} dataType : Data type
   * @returns {ReactElement} Data Type Editor Component
   */
  const getEditComponent = dataType => {
    return dataTypeManager.getType(dataType)?.getEditComponent();
  };

  /**
   * Validation method of data
   * @param {{type: string, value: *}} data : Data to be validated
   * @returns {Promise} Async validation of data
   */
  const validate = data => {
    const dataType = dataTypeManager.getType(data.type);
    if (!dataType) return Promise.resolve({ success: true, data });
    return dataType.validate(data.value);
  };

  return { getLabel, getDataTypes, getEditComponent, validate };
};

export default useDataTypes;
