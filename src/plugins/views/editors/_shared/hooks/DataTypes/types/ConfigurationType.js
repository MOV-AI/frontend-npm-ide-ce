import { Rest } from "@mov-ai/mov-fe-lib-core";
import DataType from "../AbstractDataType";

class ConfigurationType extends DataType {
  // Configuration type properties definition
  key = "config";
  label = "Configuration";
  editComponent = this.defaultStringEditor;

  /**
   * Validate configuration value
   * @param {*} value
   * @returns
   */
  validate(value) {
    return Rest.cloudFunction({
      cbName: "backend.viewer",
      func: "validateConfiguration",
      args: value
    })
      .then(res => {
        const isValid = res.success && res.result;
        return { success: isValid, error: "ConfigurationNotFound" };
      })
      .catch(err => {
        console.log("Configuration validation err", err);
        return { success: false };
      });
  }
}

export default ConfigurationType;
