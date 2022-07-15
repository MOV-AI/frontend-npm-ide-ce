import { flattenObject } from "../../Utils/utils";

const SEPARATOR = ",";

/**
 * Transform path and exposed value in object
 * @param {string} obj : "<template name>,<node name>,<port name>"
 * @param {bool} value : Port is exposed
 *
 * @returns {object} {node: <node name>, port: <port name>, value: <exposed>}
 */
const format = (obj, value) => {
  const [, node, port] = obj.split(SEPARATOR);
  return { node, port, value };
};

/**
 * Returns an array with the state flattened
 * @param {object} state :
 * @returns {array}
 */
const normalize = state => {
  return Object.entries(flattenObject(state, "", SEPARATOR)).map(
    ([key, value]) => {
      // remove index added by flatten method
      return [...key.split(SEPARATOR).slice(0, -1), value].join(SEPARATOR);
    }
  );
};

/**
 * Returns an array with the symmetric difference
 * @param {array} arr1 : Array to diff
 * @param {array} arr2 : Array to diff
 * @returns {array}
 */
const arrDiff = (arr1, arr2) => {
  return arr1
    .filter(v => !arr2.includes(v))
    .concat(arr2.filter(v => !arr1.includes(v)));
};

/**
 * shouldUpdateExposedPorts - compare exposed ports states and update only what changed
 * @param {object} prevState exposed ports previous state
 * @param {object} newState exposed ports new state
 * @param {boolean} updateAll update all ports
 */
const shouldUpdateExposedPorts = (prevState, newState, updateAll) => {
  const _prevState = normalize(prevState);
  const _newState = normalize(newState);
  const state = updateAll
    ? [...new Set([..._prevState, ..._newState])]
    : arrDiff(_prevState, _newState);

  return state.map(key => format(key, _newState.includes(key)));
};

export { shouldUpdateExposedPorts };
