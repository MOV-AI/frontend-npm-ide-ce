import { flattenObject } from "../../../_shared/Utils/Utils";

/**
 * shouldUpdateExposedPorts - compare exposed ports states and update only what changed
 * @param {object} _prevState exposed ports previous state
 * @param {object} _newState exposed ports new state
 * @param {boolean} updatedAll update all ports
 */
const shouldUpdateExposedPorts = (_prevState, _newState, updatedAll) => {
  const separator = ",";
  const prevState = flattenObject(_prevState, "", separator);
  const newState = flattenObject(_newState, "", separator);
  const output = []; // array with nodes and respective ports that should be updated

  /**
   * transform path and exposed value in object
   * @param {string} obj "<template_name>.<node_name>.<array_index>.<port_name>"
   * @param {bool} value port is exposed
   *
   * @returns {object} {node: <node_name>, port: <port_name>, value: <exposed>}
   */
  const format = (obj, value) => {
    const [, node, , port] = obj.split(separator);
    return { node, port, value: value };
  };

  /**
   * Push node and port to array of nodes to update
   * @param {string} key Object path without port name
   * @param {string} value port name
   * @param {bool} exposed  port is exposed
   */
  const update = (key, value, exposed) => {
    output.push(format([key, value].join(separator), exposed));
  };

  const inObject = (key, arr) => key in arr;

  Object.entries({ ...prevState, ...newState }).forEach(([key, value]) => {
    if (!(key in prevState) || !(key in newState) || updatedAll) {
      format(
        key,
        update(key, value, inObject(key, newState) || updatedAll),
        output
      );
    }
  });

  return output;
};

export { shouldUpdateExposedPorts };
