import { PLUGINS, MOVAI_FLOW_TYPES } from "../../../../../utils/Constants";
import ClassicNode from "./ClassicNode";
import ContainerNode from "./ContainerNode";
import TemporaryContainerNode from "./TemporaryContainerNode";
import TemporaryNode from "./TemporaryNode";
import TreeClassicNode from "./TreeView/TreeClassicNode";
import PreviewClassicNode from "./Preview/PreviewClassicNode";
import PreviewContainerNode from "./Preview/PreviewContainerNode";
import TreeContainerNode from "./TreeView/TreeContainerNode";

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
    const obj = await this.docManager(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.READ,
      {
        scope,
        name
      }
    );
    const finalObject = obj.serializeToDB();

    if (!obj.isNew)
      finalObject.Type = finalObject.Type ?? MOVAI_FLOW_TYPES.NODES.MOVAI_FLOW;

    return finalObject;
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

    if (
      [Factory.OUTPUT.CONTAINER.cls, Factory.OUTPUT.TMP_CONTAINER.cls].includes(
        output.cls
      )
    ) {
      await obj.aInit();
    }

    return obj;
  }

  static OUTPUT = {
    PREV_NODE: { cls: PreviewClassicNode, scope: "Node" },
    PREV_FLOW: { cls: PreviewContainerNode, scope: "Flow" },
    NODE: { cls: ClassicNode, scope: "Node" },
    TMP_NODE: { cls: TemporaryNode, scope: "Node" },
    TREE_NODE: { cls: TreeClassicNode, scope: "Node" },
    CONTAINER: { cls: ContainerNode, scope: "Flow" },
    TMP_CONTAINER: { cls: TemporaryContainerNode, scope: "Flow" },
    TREE_CONTAINER: { cls: TreeContainerNode, scope: "Flow" }
  };
}

export default Factory;
