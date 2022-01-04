const maxMovingPixels = 15000;
const canvasLimits = [
  [10, maxMovingPixels - 75],
  [25, maxMovingPixels - 75]
];
const FLOW_VIEW_MODE = {
  default: "default",
  treeView: "treeView"
};

const TRANSITION_LINK = "movai_msgs/Transition";

export { maxMovingPixels, canvasLimits, FLOW_VIEW_MODE, TRANSITION_LINK };
