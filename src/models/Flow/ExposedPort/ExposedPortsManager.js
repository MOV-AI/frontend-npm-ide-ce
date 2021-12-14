import NodeExposedPorts from "./NodeExposedPorts";

class ExposedPorts {
  // Map objects:
  // {<node template name>: {
  //      <node instance name>: <NodeExposedPorts>
  // }}
  ports = new Map();

  getExposedPortsByTemplate(nodeTemplate) {
    return this.ports.get(nodeTemplate);
  }

  addNodeInstance(nodeInstances, nodeInstance) {
    debugger;
    const obj = new NodeExposedPorts();
    obj.setData({ name: nodeInstance });
    nodeInstances[nodeInstance] = obj;

    return obj;
  }

  addTemplate(nodeTemplate) {
    return this.ports.set(nodeTemplate, {}).get(nodeTemplate);
  }

  removeEmpties() {
    for (const exposed of this.ports) {
      const [template, value] = exposed;
      const newValues = {};

      Object.entries(value).forEach(([nodeInstanceName, exposedPorts]) => {
        // node instance has exposed ports
        // exposedPorts: (NodeExposedPorts objects)
        if (exposedPorts.count() > 0) {
          newValues[nodeInstanceName] = exposedPorts;
        }
      });

      if (Object.keys(newValues).length === 0) {
        // template does not have any node instances
        this.ports.delete(template);
      }
    }
  }

  getOrCreateByNodeInstance(nodeInstances, nodeInstanceName) {
    debugger;
    return (
      nodeInstances[nodeInstanceName] ||
      this.addNodeInstance(nodeInstances, nodeInstanceName)
    );
  }

  getOrCreateByTemplate(nodeTemplate) {
    return (
      this.getExposedPortsByTemplate(nodeTemplate) ||
      this.addTemplate(nodeTemplate)
    );
  }

  toggleExposedPort(nodeTemplate, nodeInstanceName, port) {
    const obj = this.getOrCreateByNodeInstance(
      this.getOrCreateByTemplate(nodeTemplate),
      nodeInstanceName
    );
    debugger;

    obj.togglePort(port);

    this.removeEmpties();
  }

  serializeToDB() {
    const output = {};

    for (const exposedPorts of this.ports) {
      const [templateName, value] = exposedPorts;

      Object.entries(value).forEach(([nodeInstanceName, nodeInstanceObj]) => {
        output[templateName] = {
          ...output[templateName],
          ...nodeInstanceObj.serializeToDB()
        };
      });
    }

    return output;
  }
}

export default ExposedPorts;
