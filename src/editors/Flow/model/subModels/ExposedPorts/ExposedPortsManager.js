import ExposedPorts from "./ExposedPorts";
import Manager from "../../../../../models/Manager";
import EVENTS from "../../../../../models/Manager/events";

/**
 * Class to manage the exposed ports of the node instances in a Flow
 */
class ExposedPortsManager extends Manager {
  // Map objects:
  // { <node template name>:
  //      { <node instance name>: <ExposedPorts> }
  // }

  //========================================================================================
  /*                                                                                      *
   *                                     Data Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Creates a new item
   * Emits the CREATE event
   * @param {object} param0 : An object with the name of the item and the content
   * @returns : The instance
   */
  setItem({ name, content }) {
    this.data.set(name, content);

    this.emit(EVENTS.CREATE);

    return this;
  }

  /**
   * Deletes an item
   * @param {string} key The name of the item
   * @returns : True on success, false otherwise
   */
  deleteItem(name) {
    Object.values(this.getItem(name) ?? {}).forEach(val => {
      val.destroy();
    });

    const res = this.data.delete(name);

    this.emit(EVENTS.DELETE);

    return res;
  }

  /**
   * Creates one or more items
   * @param {object} json : An object with the items to create
   * @returns : The instance
   */
  setData(json) {
    // clean up any items added previously
    this.destroy();

    Object.entries(json ?? {}).forEach(([nodeTemplate, nodeInstances]) => {
      Object.entries(nodeInstances ?? {}).forEach(([nodeInstanceName, obj]) => {
        const ports = obj.ports ?? [];

        ports.forEach(port =>
          this.toggleExposedPort(nodeTemplate, nodeInstanceName, port)
        );
      });
    });
  }

  /**
   * Returns an item from the exposed ports
   * @param {string} nodeTemplate : The name of the template to get
   * @returns : Returns an item or undefined
   */
  getExposedPortsByTemplate(nodeTemplate) {
    return this.data.get(nodeTemplate);
  }

  /**
   * Add a new node instance with empty exposed ports
   * @param {object} nodeInstances : Object with the node instances
   * @param {string} nodeInstance : The name of the node instance
   * @returns : Returns the exposed port created
   */
  addNodeInstance(nodeInstances, nodeInstance) {
    const obj = new ExposedPorts();
    obj.setData({ name: nodeInstance });
    nodeInstances[nodeInstance] = obj;

    return obj;
  }

  /**
   * Creates a new item with the template name
   * @param {string} nodeTemplate : The name of the template
   * @returns : Returns the created item
   */
  addTemplate(nodeTemplate) {
    this.data.set(nodeTemplate, {});
    this.emit(EVENTS.CREATE);

    return this.getItem(nodeTemplate);
  }

  /**
   * @private
   * Removes templates and node instances without exposed ports
   */
  removeEmpties() {
    for (const exposed of this.data) {
      const [template, value] = exposed;
      const newValues = {};
      Object.entries(value).forEach(([nodeInstanceName, exposedPorts]) => {
        // node instance has exposed ports
        // exposedPorts: (ExposedPorts objects)
        if (exposedPorts.count() > 0) {
          newValues[nodeInstanceName] = exposedPorts;
        }
      });

      if (Object.keys(newValues).length === 0) {
        // remove the template because it does not have
        // any node instances neitheir exposed ports
        this.deleteItem(template);
      }
    }
  }

  /**
   * @private
   * Get or create a node instance
   * @param {object} nodeInstances An object with the node instances
   * @param {string} nodeInstanceName The node instance name
   * @returns Returns a node instance object
   */
  getOrCreateByNodeInstance(nodeInstances, nodeInstanceName) {
    return (
      nodeInstances[nodeInstanceName] ||
      this.addNodeInstance(nodeInstances, nodeInstanceName)
    );
  }

  /**
   * @private
   * Get or create a template
   * @param {string} nodeTemplate : The template name
   * @returns Returns a template
   */
  getOrCreateByTemplate(nodeTemplate) {
    return (
      this.getExposedPortsByTemplate(nodeTemplate) ||
      this.addTemplate(nodeTemplate)
    );
  }

  /**
   * Toggle the exposed port of a node instance
   * @param {string} nodeTemplate : The template name
   * @param {string} nodeInstanceName The node instance name
   * @param {string} port The port name
   */
  toggleExposedPort(nodeTemplate, nodeInstanceName, port) {
    const obj = this.getOrCreateByNodeInstance(
      this.getOrCreateByTemplate(nodeTemplate),
      nodeInstanceName
    );

    obj.togglePort(port);

    this.removeEmpties();

    this.emit(EVENTS.UPDATE);
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Serializers                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Returns all items serialized
   * @returns {object} : An object with all items serialized
   */
  serialize() {
    const output = {};

    for (const key of this.data.keys()) {
      const item = this.getItem(key);

      const nodeInstances = {};

      Object.entries(item).forEach(([_key, _obj]) => {
        nodeInstances[_key] = _obj.serialize();
      });

      output[key] = nodeInstances;
    }

    return output;
  }

  /**
   * Returns all items serialized for database insertion
   * @returns {object} : An object with all items serialized
   */
  serializeToDB() {
    const output = {};

    for (const exposedPorts of this.data) {
      const [templateName, value] = exposedPorts;

      Object.values(value).forEach(nodeInstanceObj => {
        output[templateName] = {
          ...output[templateName],
          ...nodeInstanceObj.serializeToDB()
        };
      });
    }

    return output;
  }

  /**
   * Returns an object serialized for the model insertion
   * @param {object} json : An object with all the items serialized from db
   * @returns {object} : An object with all items serialized
   */

  static serializeOfDB(json, model) {
    const output = {};

    Object.entries(json ?? {}).forEach(([nodeTemplate, nodeInstances]) => {
      Object.entries(nodeInstances).forEach(([nodeInstance, ports]) => {
        const content = {
          [nodeTemplate]: { [nodeInstance]: ports }
        };

        output[nodeTemplate] = {
          ...(output[nodeTemplate] ?? {}),
          [nodeInstance]: model.serializeOfDB(content)
        };
      });
    });

    return output;
  }

  destroy() {
    Array.from(this.data.values()).forEach(value => {
      Object.values(value ?? {}).forEach(ports => ports.destroy());
    });
    this.data.clear();
  }
}

export default ExposedPortsManager;
