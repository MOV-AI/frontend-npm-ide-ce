import ClassicNode from "./ClassicNode";
import ContainerNode from "./ContainerNode";
import TemporaryContainerNode from "./TemporaryContainerNode";
import TemporaryNode from "./TemporaryNode";
import { DOCS_MNG } from "./constants";

/**
 * Factory class to produce Nodes and Containers (aka Sub-Flows)
 */
class Factory {
  constructor(docManager, output) {
    this.docManager = docManager;
    this.output = output;
  }

  /**
   * Returns a template object
   * @param {string} name : The name of the template
   * @returns {object} : The template data
   */
  async getTemplate(name) {
    const { scope } = this.output;
    const obj = await this.docManager(DOCS_MNG.NAME, DOCS_MNG.ACTION.READ, {
      scope,
      name
    });

    return obj.serializeToDB();
  }

  /**
   * Creates Nodes/Containers
   * @param {function} docManager : A function to load documents
   * @param {object} output : One of Factory.OUTPUT
   * @param {object} args : Arguments to forward to the output instance
   * @returns
   */
  static async create(docManager, output, args) {
    const { node } = args;
    const name = node.Template ?? node.ContainerFlow;

    const fact = new Factory(docManager, output);
    const template = await fact.getTemplate(name);

    // Injecting the factory so that sub-flows can load other sub-flows and node templates
    const obj = new output.cls({
      ...args,
      template,
      factory: { factory: Factory, docManager }
    });

    if (output.cls === Factory.OUTPUT.CONTAINER.cls) {
      await obj.aInit();
    }

    return obj;
  }

  static OUTPUT = {
    NODE: { cls: ClassicNode, scope: "Node" },
    TMP_NODE: { cls: TemporaryNode, scope: "Node" },
    CONTAINER: { cls: ContainerNode, scope: "Flow" },
    TMP_CONTAINER: { cls: TemporaryContainerNode, scope: "Flow" }
  };
}

export default Factory;
