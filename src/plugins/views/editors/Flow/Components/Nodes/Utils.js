import * as d3 from "d3";
import lodash from "lodash";
import { MOVAI_FLOW_TYPES } from "../../Constants/constants";

/**
 * convert Visualization.x.Value, Visualization.y.Value to [x,y]
 * @param {obj}  Visualization object or [x,y]
 * @return {array}  Array with position x,y
 */
export function convertVisualization(obj) {
  if (!obj) return undefined;
  let output;

  try {
    const x = lodash.get(obj, "x.Value", obj[0]);
    const y = lodash.get(obj, "y.Value", obj[1]);
    output = [x, y];
  } catch (error) {
    console.error(error);
  }

  return output;
}

export function convertTypeCss(template, isMiniature = false) {
  const clickableAreaClass = !isMiniature ? " node-inst-click-area" : "";
  const templateClass = template.Type?.replace(/\//g, "-") || "unknown";
  const css = template.Label === "start" ? "start" : templateClass;

  return `${css}${clickableAreaClass}`;
}

export function portConvertTypeCss(message) {
  return `port-default port-${message.replace(/\//g, "-")}`.toLowerCase();
}

export function getBaseTemplate(type) {
  const baseTemplate = {
    start: { id: type },
    container: { Type: MOVAI_FLOW_TYPES.NODES.MOVAI_FLOW }
  };
  return baseTemplate[type];
}

export function belongLineBuilder({ x1, y1, x2, y2 }) {
  return d3
    .create("svg")
    .append("line")
    .style("stroke", "white")
    .style("stroke-width", 1)
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2)
    .node();
}
