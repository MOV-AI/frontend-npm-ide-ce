import * as d3 from "d3";
import { InputPort, OutputPort } from "./PortIcons";
import BaseNode from "../BaseNode";
import { TYPES } from "../../../../Constants/constants";

class TreeNodePortLink {
  constructor(link, type, node) {
    this.parentNode = node;
    this.target = {
      port: link.targetPort,
      node: link.targetNode,
      templatePath: link.targetTemplatePath
    };
    this.source = {
      port: link.sourcePort,
      node: link.sourceNode,
      templatePath: link.sourceTemplatePath
    };
    this.type = type;
    this.object = d3.create("svg").style("pointer-events", "none");
    this.render();
  }

  /**
   * @private
   * render - render the port links information
   */
  render() {
    let xPosition = 0;
    // Add port icon
    this.object.append(() => {
      const portIconBuilder = this.type === "Out" ? InputPort : OutputPort;
      const icon = portIconBuilder.getIcon();
      xPosition += icon.width.baseVal.value;
      return icon;
    });
    // Add node miniature
    const data = this.type === "Out" ? this.target : this.source;
    const templates = this.getTemplates(data);
    const [nodeName, nodePort] = this.parseNodePort(data);
    templates.forEach(item => {
      BaseNode.getMiniature(
        item.templateData ?? item.name,
        item.type,
        xPosition
      ).then(miniature => {
        this.object.append(() => {
          const mini = miniature.node();
          mini.style.pointerEvents = "all";
          // dblclick event
          mini.ondblclick = evt => {
            // stop event propagation
            evt.stopPropagation();
            evt.preventDefault();
            // trigger onDblClick canvas mode
            this.parentNode.onDblClickMini(item);
          };
          // ignore click event
          mini.onclick = evt => {
            // stop event propagation
            evt.stopPropagation();
            evt.preventDefault();
          };
          return mini;
        });
      });
      // increment starting x position
      xPosition += 25;
    });
    // Add node name
    this.textBuilder(nodeName, xPosition, 4);
    // Add port name
    this.textBuilder(nodePort, xPosition, 14);
  }

  /**
   * el: Main svg element node
   *
   * @returns {DOMElement} svg DOM element
   */
  get el() {
    return this.object.node();
  }

  //========================================================================================
  /*                                                                                      *
   *                                         Utils                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * @private
   * textBuilder - Create text element
   *
   * @param {string} text: Text content in element
   * @param {number} x: X position
   * @param {number} y: Y position
   */
  textBuilder(text, x = 55, y = 4) {
    this.object
      .append("text")
      .attr("class", "text unselectable")
      .attr("stroke-width", 0)
      .attr("x", x)
      .attr("y", y)
      .style("font-size", "10px")
      .style("dominant-baseline", "central")
      .text(text);
  }

  /**
   * @private
   * parseNodePort - Parse node name and linked port
   *
   * @param {Object} data:
   * {
   *  port: string,
   *  node: string
   * }
   */
  parseNodePort(data) {
    const pathLength = data.templatePath.length;
    const portArray = data.port.split("/");
    const port = portArray.slice(pathLength - 1).join("/");
    const node = pathLength > 1 ? portArray[0] : data.node;
    return [node, port];
  }

  /**
   * @private
   * getTemplates - Get template list from template path array
   *
   * @param {Object} data:
   * {
   *  templatePath: Array [flow, sub-flow, node]
   * }
   */
  getTemplates(data) {
    const pathLength = data.templatePath.length - 1;
    return data.templatePath.map((node, index) => {
      let type = "flow";
      let name = node;
      if (index === pathLength) type = node === "start" ? node : "node";
      const templateData =
        this.parentNode.canvas.mInterface.graph.nodes.get(data.node)?.obj
          ?.template || {};
      const info = {
        flow: { model: "Flow", nodeType: TYPES.CONTAINER },
        node: { model: "Node", nodeType: TYPES.NODE },
        start: {}
      };
      return { name, type, ...info[type], data, templateData };
    });
  }
}

export default TreeNodePortLink;
