import { maxMovingPixels } from "../Constants/constants";

/**
 * Function to format data based on node type
 *@param {object}  flow object with name and type
 *@param {object}  node object
 *@param {string}  type values: "Container" or any
 *@return {object} node data formated
 */
export function formatNodeData(flow, node, type = "Node") {
  // label keys
  const instLabels = { flow: "NodeLabel", sm: "StateLabel" };

  // in case the node is a container
  const node_label =
    type === "Container" ? "ContainerLabel" : instLabels[flow.type];
  const node_template = type === "Container" ? "ContainerFlow" : "Template";

  const data = {
    flow: flow.name,
    type: type,
    node: {
      [node_label]: node.id,
      [node_template]: node[node_template],
      ...formatNodeVisualization(node, type)
    }
  };
  return data;
}

/**
 *
 * Convert position value to the legacy scale
 * Can be removed once everyone updates the flow editor to the new version
 */
function posLegacyConvertion(value) {
  let output = value;
  if (value > 1) {
    output = value * (1 / maxMovingPixels);
  }
  return output;
}

/**
 *
 * @param {node} node node object
 * @param {type} type node type
 * @return node position formated
 */
export function formatNodeVisualization(node, type) {
  const vis = {
    Container: {
      Visualization: [
        posLegacyConvertion(node.Visualization[0]),
        posLegacyConvertion(node.Visualization[1])
      ]
    },
    NodeInst: {
      Visualization: {
        x: { Value: posLegacyConvertion(node.Visualization[0]) },
        y: { Value: posLegacyConvertion(node.Visualization[1]) }
      }
    },
    State: {
      Visualization: {
        x: { Value: posLegacyConvertion(node.Visualization[0]) },
        y: { Value: posLegacyConvertion(node.Visualization[1]) }
      }
    }
  };
  //@TODO: change to type after review callback Backend.FlowApi
  return vis["NodeInst"];
}
