import lodash from "lodash";
import BasePort from "./BaseNode/BasePort";
import BaseContainerNode from "./BaseNode/BaseContainerNode";
import Flows from "../../Subscribers/Flows";
import _flattenDeep from "lodash/flattenDeep";

/**
 * class representing a container
 */
class ContainerNode extends BaseContainerNode {
  /**
   *
   * @param {object} canvas the canvas where the node will be added
   * @param {object} node node's data
   * @param {object} events events to be triggered inside the node
   */
  constructor(canvas, node, events, template) {
    super(canvas, node, events, template);

    // initialize the container
    this._init();
  }

  /**
   * _addPorts - add node ports
   */
  _addPorts = () => {
    // add port events
    const events = this._portEvents();

    // node already has ports; probably an update request
    if (this._ports.size > 0) {
      this._ports.forEach(port => {
        port.destroy();
      });
      this._ports.clear();
    }
    try {
      // ExposedPorts {node_template: {node_name: <[ports]>}, }
      const exp_templates =
        lodash.get(this._template, "ExposedPorts", {}) || {};

      Object.entries(exp_templates).forEach(([template_name, template_val]) => {
        Object.entries(template_val).forEach(([node_name, node_val]) => {
          node_val.forEach(port_inst_name => {
            // check if template_name is a node template or is a reference to a sub flow
            const isSubFlow = this._isFlow(template_name);
            const join_str = isSubFlow ? "__" : "/";
            const docPath = isSubFlow
              ? this._template.Container[node_name].ContainerFlow
              : this._template.NodeInst[node_name].Template;

            // get the port data
            const PortsInst = this._getPort(port_inst_name, docPath, isSubFlow);

            if (!PortsInst) {
              console.error(
                `Could not find port ${port_inst_name} in node instance "${node_name}" of sub flow "${this.data.ContainerFlow}"`
              );
              return;
            }

            Object.keys(PortsInst).forEach(type => {
              if (!["in", "out"].includes(type.toLocaleLowerCase())) return;

              const port_obj = lodash.get(PortsInst, type, {});

              Object.keys(port_obj).forEach(port => {
                if (
                  port_inst_name.search(`${PortsInst.PortsLabel}/${port}`) < 0
                )
                  return;

                const data = lodash.get(PortsInst, `${type}`, {});

                Object.keys(data).forEach(port_name => {
                  const port_data = {
                    name: `${node_name}${join_str}${port_inst_name}`,
                    type: type,
                    Template: lodash.get(PortsInst, `Template`, ""),
                    origin: node_name,
                    ...data[port_name]
                  };

                  // create port instance
                  const port = new BasePort(this, port_data, events);

                  // add port instance
                  const fmt_port_name = `${node_name}${join_str}${port_inst_name}`;

                  this._ports.set(fmt_port_name, port);
                });
              });
            });
          });
        });
      });
    } catch (error) {
      console.error(error);
    }

    return this;
  };

  /**
   * _isFlow - check if the "template name" is actually a flow instead of a node template
   * In the exposed ports, flows are marked with the prefix "__" , ex.: __demo1, to differentiate
   * from node templates
   *
   * @param {string} name the name to test
   *
   * @returns {object} PortsInst
   */
  _isFlow = name => {
    return name?.startsWith("__") || false;
  };

  /**
   * _getPort - tries to recursively get the port instance data
   * @param {string} portName port name  ex.: port_name/port_type or node_inst_name/port_name/port_type or flow_name__node_inst_name/port_name/port_type
   * @param {string} docPath the path of the document
   * @param {boolean} isSubFlow true if the doc is a sub-flow; false if it is a node template
   *
   * @returns {object} PortsInst
   */
  _getPort = (portName, docPath, isSubFlow) => {
    try {
      let _docPath = docPath;
      const portParts = portName.split("/");
      let _portName = portParts.slice(0, -1).join("/");

      if (isSubFlow) {
        // container
        _docPath = this._flowsDb.getNodeTemplate(docPath, portParts[0]);
        _portName = portParts.slice(1, -1).join("/");
      }

      return this._nodesDb.getPort(_docPath, _portName);
    } catch (error) {
      console.error(error);
    }
  };

  static builder = async (canvas, node, events) => {
    const flows = new Flows();
    const tpls = await flows.agetFlow(node.ContainerFlow);

    const tpl = tpls[0].value;

    const promises = _flattenDeep(tpls).map(subFlow => {
      return ContainerNode.cacheNodeTemplates(
        Object.values(subFlow.value?.NodeInst || {}).map(obj => obj.Template)
      );
    });
    await Promise.allSettled(promises);

    return new ContainerNode(canvas, node, events, tpl);
  };
}

export default ContainerNode;
