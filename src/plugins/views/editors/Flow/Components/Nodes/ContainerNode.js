import lodash from "lodash";
import BasePort from "./BaseNode/BasePort";
import BaseContainerNode from "./BaseNode/BaseContainerNode";

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
  constructor(args) {
    const { factory, ...otherArgs } = args;
    super(otherArgs);

    this.factory = factory;
  }

  /**
   * @override
   * Remove init method of the base class
   */
  init() {
    // Empty on purpose
  }

  /**
   * Async initialization of the sub-flow.
   * The sub-flow initialization needs to be async because it
   * depends on the flow it references.
   * @returns {ContainerNode} : The instance
   */
  aInit = async () => {
    await this.addPorts();
    this.renderBody()
      .renderHeader()
      .renderStatus()
      .renderPorts()
      .addEvents()
      .postInit();
    return this;
  };

  /**
   * Hook to run any post init action when extending the class
   */
  postInit = () => {
    return this;
  };

  /**
   * addPorts - add node ports
   */
  addPorts = async () => {
    // add port events
    const events = this.portEvents();

    // node already has ports; probably an update request
    if (this._ports.size > 0) {
      this._ports.forEach(port => {
        port.destroy();
      });
      this._ports.clear();
    }

    try {
      // ExposedPorts {<node template>: {<node name>: <[ports]>}, }
      const expTemplates = lodash.get(this._template, "ExposedPorts", {}) || {};

      const flattenData = [];
      // flatten data
      Object.entries(expTemplates).forEach(([templateName, templateValue]) => {
        Object.entries(templateValue).forEach(([nodeName, nodeVal]) => {
          nodeVal.forEach(async portInstName => {
            flattenData.push({ templateName, nodeName, portInstName });
          });
        });
      });

      await Promise.allSettled(
        flattenData.map(async value => {
          const { templateName, nodeName, portInstName } = value;

          // check if templateName is a node template or is a reference to a sub flow
          const isSubFlow = this.isFlow(templateName);
          const joinStr = isSubFlow ? "__" : "/";
          const docPath = isSubFlow
            ? this._template.Container[nodeName]?.ContainerFlow
            : this._template.NodeInst[nodeName]?.Template;

          // get the port data

          const portsInst = await this.getPort(
            portInstName,
            docPath,
            isSubFlow
          );

          if (!portsInst) {
            console.error(
              `Could not find port ${portInstName} in node instance "${nodeName}" of sub flow "${this.data.ContainerFlow}"`
            );
            return;
          }

          Object.keys(portsInst).forEach(type => {
            if (!["in", "out"].includes(type.toLocaleLowerCase())) return;

            const portObj = lodash.get(portsInst, type, {});

            Object.keys(portObj).forEach(port => {
              if (portInstName.search(`${portsInst.PortsLabel}/${port}`) < 0)
                return;

              const data = lodash.get(portsInst, `${type}`, {});

              Object.keys(data).forEach(portName => {
                const portData = {
                  name: `${nodeName}${joinStr}${portInstName}`,
                  type: type,
                  Template: lodash.get(portsInst, `Template`, ""),
                  origin: nodeName,
                  ...data[portName]
                };

                // create port instance
                const pInst = new BasePort(this, portData, events);

                // add port instance
                const fmtPortName = `${nodeName}${joinStr}${portInstName}`;

                this._ports.set(fmtPortName, pInst);
              });
            });
          });
        })
      ).catch(error => {
        console.error(error);
      });
    } catch (error) {
      console.error(error);
    }

    return this;
  };

  /**
   * @private
   * isFlow - check if the "template name" is actually a flow instead of a node template
   * In the exposed ports, flows are marked with the prefix "__" , ex.: __demo1, to differentiate
   * from node templates
   *
   * @param {string} name the name to test
   *
   * @returns {object} PortsInst
   */
  isFlow = name => {
    return name?.startsWith("__") || false;
  };

  /**
   * @private
   * getPort - tries to recursively get the port instance data
   * @param {string} portName port name  ex.:
   *  <port name>/<port type> or <node inst name>/<port name>/<port type>
   *  or <flow name>__<node inst name>/<port name>/<port type>
   * @param {string} docPath the path of the document
   * @param {boolean} isSubFlow true if the doc is a sub-flow; false if it is a node template
   *
   * @returns {object} PortsInst
   */
  getPort = async (portName, docPath, isSubFlow) => {
    try {
      const portParts = portName.split("/");
      let _docPath = docPath;
      let _portName = portParts.slice(0, -1).join("/");

      if (isSubFlow) {
        _docPath = await this.getNodeInstTemplate(docPath, portParts[0]);
        _portName = portParts.slice(1, -1).join("/");
      }

      return this.getNodePort(_docPath, _portName);
    } catch (error) {
      console.error(error);
    }
  };
  /**
   * Returns true if the name represents a NodeInst and false
   * if it represents a Container (aka sub flow)
   * A container will always have '__' for ex.: name1__name2__nodeInst1
   *
   * @param {String} nodeName node instance name
   */
  isNodeInst = nodeName => {
    return nodeName.split("__").length <= 1;
  };

  getNodeInstTemplate = async (flowName, nodeName) => {
    try {
      const { factory, docManager } = this.factory;

      const _factory = new factory(docManager, factory.OUTPUT.CONTAINER);
      const flow = await _factory.getTemplate(flowName);

      if (this.isNodeInst(nodeName)) {
        const nodeInst = flow.NodeInst[nodeName];

        if (!nodeInst)
          throw new Error(
            `Node instance "${nodeName}" does not exist in flow "${flowName}".`
          );

        // return the nodeInst Template
        return nodeInst.Template;
      } else {
        // it is a container, we need to go down to the subflow
        // to search for the nodeInst
        const [containerName, ...subNodeName] = nodeName.split("__");

        const subFlowName = flow.Container[containerName].ContainerFlow;

        return this.getNodeInstTemplate(subFlowName, subNodeName.join("__"));
      }
    } catch (error) {
      const errorMsg = `Could not find the template of the node instance "${nodeName}"`;
      console.error(`${errorMsg}; \n${error}`);
    }
  };

  getNodePort = async (nodeName, portName) => {
    const { factory, docManager } = this.factory;

    const _factory = new factory(docManager, factory.OUTPUT.NODE);
    const node = await _factory.getTemplate(nodeName);

    const port = node.PortsInst[portName] || null;

    // hack bc most of the ports do not have PortsLabel and currently PortsLabel value is equal to the name
    if (port) port["PortsLabel"] = portName;

    return port;
  };
}

export default ContainerNode;
