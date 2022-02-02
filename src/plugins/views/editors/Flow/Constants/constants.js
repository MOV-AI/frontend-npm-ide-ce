const maxMovingPixels = 15000;
const canvasLimits = [
  [10, maxMovingPixels - 75],
  [25, maxMovingPixels - 75]
];
const FLOW_VIEW_MODE = {
  default: "default",
  treeView: "treeView"
};

const ROBOT_BLACKLIST = window.SERVER_DATA?.RobotBlackList ?? [];

const TRANSITION_LINK = "movai_msgs/Transition";

const TABLE_KEYS_NAMES = {
  PARAMETERS: "parameters",
  ENVVARS: "envVars",
  CMDLINE: "commands"
};

const EMPTY_MESSAGE = {
  PARAMETERS: "No Parameters",
  ENVVARS: "No Environment Variables",
  COMMANDS: "No Command Lines"
};

const NODE_TYPES = {
  NODE: "NODE",
  CONTAINER: "CONTAINER"
};

const generateContentId = flowId => {
  return `base-${flowId?.replace(/\//g, "-")}`;
};

export {
  maxMovingPixels,
  canvasLimits,
  generateContentId,
  FLOW_VIEW_MODE,
  TRANSITION_LINK,
  TABLE_KEYS_NAMES,
  EMPTY_MESSAGE,
  ROBOT_BLACKLIST,
  NODE_TYPES
};
