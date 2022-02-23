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

const NODE_TYPES = {
  NODE: "NODE",
  CONTAINER: "CONTAINER"
};

const generateContainerId = flowId => {
  return `base-${flowId?.replace(/\//g, "-")}`;
};

export {
  maxMovingPixels,
  canvasLimits,
  generateContainerId,
  FLOW_VIEW_MODE,
  TRANSITION_LINK,
  ROBOT_BLACKLIST,
  NODE_TYPES
};
