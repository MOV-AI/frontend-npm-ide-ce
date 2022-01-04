import * as d3 from "d3";
import lodash from "lodash";

/**
 * convert Visualization.x.Value, Visualization.y.Value to [x,y]
 * @param {obj}  Visualization object or [x,y]
 * @return {array}  Array with position x,y
 */
export function convert_visualization(obj) {
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

export function convert_type_css(template, isMiniature = false) {
  let css;
  const clickableAreaClass = !isMiniature ? " node-inst-click-area" : "";
  const type = lodash.get(template, "template.Type", undefined);
  const id = lodash.get(template, "id", "");
  css = type ? type.replace("/", "-") : "unknown";
  css = id === "start" ? "start" : css;
  return css + clickableAreaClass;
}

export function port_convert_type_css(message) {
  return `port-default port-${message.replace("/", "-")}`.toLowerCase();
}

export function getBaseTemplate(type) {
  const baseTemplate = {
    start: { id: type },
    flow: { template: { Type: "MovAI/Flow" } }
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
