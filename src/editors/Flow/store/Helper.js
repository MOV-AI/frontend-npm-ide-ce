import { Rest } from "@mov-ai/mov-fe-lib-core";

const data = {};
const Helper = {};
const CB_NAME = "backend.FlowTopBar";

/**
 * Call CallbackEditor callback
 * @param {string} functionName : Method name
 * @returns {Promise}
 */
const cloudFunction = async (functionName, args) => {
  return Rest.cloudFunction({
    cbName: CB_NAME,
    func: functionName,
    args
  })
    .then(res => {
      return res.success ? res.result : null;
    })
    .catch(err => console.warn("debug err", err));
};

/**
 * Get default robot id
 * @returns {Promise<string>} RobotID
 */
Helper.getDefaultRobot = async () => {
  if (data.defaultRobot) return Promise.resolve(data.defaultRobot);
  return cloudFunction("getDefaultRobot", "").then(res => {
    data.defaultRobot = res.robotName;
    return data.defaultRobot;
  });
};

/**
 * Get all callback message types
 * @returns {Promise<Array>} Callback message type available
 */
Helper.sendToRobot = async ({ action, flowPath, robotId }) => {
  return cloudFunction("sendToRobot", [action, flowPath, robotId]);
};

export default Helper;
