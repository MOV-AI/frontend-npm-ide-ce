import StartNode from "../../Components/Nodes/StartNode";
import BaseLink from "../../Components/Links/BaseLink";
import Factory from "../../Components/Nodes/Factory";
import { FLOW_VIEW_MODE, NODE_TYPES } from "../../Constants/constants";
import { InvalidLink } from "../../Components/Links/Errors";
import GraphBase from "./GraphBase";
import GraphValidator from "./GraphValidator";

export default class GraphTreeView extends GraphBase {
  constructor({ mInterface, canvas, id, docManager }) {
    super({ mInterface, canvas, id, docManager });

    //========================================================================================
    /*                                                                                      *
     *                                      Properties                                      *
     *                                                                                      */
    //========================================================================================

    this.tree = { root: null };
    this.subFlows = [];
  }

  //========================================================================================
  /*                                                                                      *
   *                                  Getters & Setters                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * rootNode - returns root node
   *
   * @returns {TreeContainerNode} Root node
   */
  get rootNode() {
    return this.tree.root;
  }

  /**
   * Get Flow visualization mode
   * @returns {String} "treeView"
   */
  get viewMode() {
    return FLOW_VIEW_MODE.treeView;
  }

  //========================================================================================
  /*                                                                                      *
   *                                   Public methods                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * @override loadData: Load initial flow data
   *  - Just create root node and the root node is responsible to add its nodes/sub-flows
   *
   * @param {Object} flow
   */
  async loadData(flow) {
    // Add root container node
    const rootNodeData = {
      id: flow.Label,
      ContainerLabel: flow.Label,
      ContainerFlow: flow.url ?? flow.Label,
      NodeInst: flow.NodeInst,
      State: flow.state,
      Container: flow.Container
    };
    // Move belong lines behind nodes in flow
    this.canvas.canvas.raise();
    // Add root node to canvas
    try {
      // Let's add the start node to the list (so links know where to start)
      this.addStartNode();
      await this._addRootNode(rootNodeData);
      this.rootNode.addToCanvas();
    } catch (e) {
      console.warn("Error trying to add root node", e);
    }

    try {
      await this.loadNodes(flow);
    } catch (e) {
      console.warn("Error trying to load all nodes", e);
    }

    try {
      this._loadLinks(flow.Links, this.rootNode);
      this.onFlowValidated.next({ warnings: [] });
    } catch (error) {
      console.warn("Error has ocurred loading links", flow, error);
    }

    return this;
  }

  /**
   * @override loadNodes : Load nodes of requested flow/sub-flow
   *  - Always receive parent node
   *
   * @param {Object} flow : Flow data
   * @param {TreeContainerNode} parent : Parent node
   */
  async loadNodes(flow, parent = this.rootNode) {
    try {
      await this._loadNodes(flow.NodeInst, NODE_TYPES.TREE_NODE, parent);
      await this._loadNodes(flow.Container, NODE_TYPES.TREE_CONTAINER, parent);

      if (flow.Container) {
        const subFlows = Object.values(flow.Container);

        for (const subFlow of subFlows) {
          const subFlowInst = this.nodes.get(subFlow.ContainerLabel).obj;
          const subFlowTemplate = subFlowInst.template;

          await this.loadNodes(subFlowTemplate, subFlowInst);
        }

        // Add parent children to canvas
        this.update(parent);
        this.subFlows.push(parent);
      }
    } catch (error) {
      console.warn("Error has ocurred loading children", flow, error);
    }
  }

  updateAllPositions = async () => {
    for (const parent of this.subFlows) {
      await parent.updateChildrenPosition();
    }
  };

  /**
   * @override addNode: Add a new node supporting async loading
   *  - Use TreeClassicNode/TreeContainerNode/TreeStateNode to create node instances
   *
   * @param {Object} node : data
   * @param {string} _type : one of NodeInst, Container, State used to get the respective class
   * @param {TreeContainerNode} parent : Container node parent
   *
   * @returns {TreeNode} Node instance based on _type
   */
  async addNode(node, nodeType, parent) {
    try {
      const inst = await Factory.create(
        this.docManager,
        Factory.OUTPUT[nodeType],
        { canvas: this.canvas, node, parent }
      );

      this.nodes.set(node.id, { obj: inst, links: [] });

      parent.addChild(inst);

      return inst;
    } catch (error) {
      console.warn("Error creating node", error);
    }
  }

  /**
   * @override reset: Reset all nodes in tree
   *  - Iterate through all nodes in tree to reset all of them
   *
   * @param {TreeNode} node: Node to be unselected
   */
  reset(node = this.rootNode) {
    if (!node) return;
    node.selected = false;
    node.children.forEach(child => {
      this.reset(child);
    });
  }

  /**
   * Reset status of all nodes
   * @param {TreeNode} node
   */
  resetStatus(node = this.rootNode) {
    if (!node) return;
    node.status = false;
    node.children.forEach(child => {
      this.resetStatus(child);
    });
  }

  /**
   * @override nodeStatusUpdated: Update node running status
   *
   * @param {Object} nodes
   * @param {*} robotStatus
   */
  nodeStatusUpdated(nodes, _) {
    Object.keys(nodes).forEach(nodeName => {
      const status = nodes[nodeName];
      this._updateNodeStatus(nodeName, status);
    });
  }

  /**
   * @override onTemplateUpdate
   *
   * @param {string} name Template name
   */
  onTemplateUpdate = name => {
    this.updateTemplates(name);
  };

  /**
   * @override addLink from GraphBase class
   * @param {Object} link : Link info
   * @param {String} nodeId : Parent node ID
   */
  addLink = (link, parent) => {
    // link already exists, update
    const _link = this.links.get(link.name);

    if (_link) {
      link.updateData({ Dependency: link.Dependency });
      return;
    }

    try {
      const parsedLink = BaseLink.parseLink(link);

      const { sourcePortPos, targetPortPos } =
        GraphValidator.extractLinkPortsPos(parsedLink, this.nodes);

      if (!sourcePortPos || !targetPortPos) {
        throw new InvalidLink(parsedLink);
      }

      // create link instance
      const obj = new BaseLink(
        this.canvas,
        sourcePortPos,
        targetPortPos,
        parsedLink,
        this.flowDebugging,
        this.toggleTooltip
      );

      parent.children.forEach(child => {
        this._addLinkToNode(child, obj);
      });
      // add links to target children
      if (obj.data.targetFullPath.length > 1) {
        this._addLinksToChildren(parent, obj);
      }
      // update local link list
      this.links.set(link.name, obj);
    } catch (error) {
      console.error(error.message);
    }
  };

  /**
   * @override updateNode is called when the subscriber gets changes
   *  if nodeId is not yet part of the graph means we are
   *  getting a new node
   *
   * @param {string} nodeId node's unique id
   * @param {obj} data node's data that has changed
   */
  updateNode = (_event, _nodeId, _data, _type = "NodeInst") => {
    // TODO: Handle changes in nodes from main flow
    return;
  };

  //========================================================================================
  /*                                                                                      *
   *                                 Private methods                                      *
   *                                                                                      */
  //========================================================================================

  /**
   * Iterate through the nodes in tree to update its running status
   *
   * @param {String} nodeName : Node instance name
   * @param {Boolean} status : True -> Running / False -> Not Running
   * @param {TreeContainerNode} parent : Flow to look for the node
   */
  _updateNodeStatus = (nodeName, status, parent = this.rootNode) => {
    if (!parent) return;

    // is this a subflow node?
    if (nodeName.indexOf("__") >= 0) {
      const nodePath = nodeName.split("__");
      const nodeParent = parent.children.find(n => n.data.id === nodePath[0]);
      const newNodeName = nodePath.splice(1).join("__");
      // let's call this function again with the newNodeName (child) and the parent is the node
      return this._updateNodeStatus(newNodeName, status, nodeParent);
    }

    const node = parent.children.find(n => n.data.id === nodeName);

    node.status = [1, true, "true"].includes(status);
  };

  /**
   * @private
   * updateTemplates: Update templates of template
   *
   * @param {String} templateName
   * @param {TreeNode} node
   */
  updateTemplates = (templateName, node = this.rootNode) => {
    // Update template with name
    if (node.templateName === templateName) node.onTemplateUpdate(templateName);
    // Check all children
    node.children.forEach(child => {
      this.updateTemplates(templateName, child);
    });
  };

  /**
   * @override _loadLinks : parse each link and add it to port
   *
   * @param {Object} links
   * @param {TreeContainerNode} parent
   *
   * @returns {GraphTreeView} instance
   */
  _loadLinks(links, parent) {
    const _links = links || {};
    Object.keys(_links).forEach(linkId => {
      const linksData = { id: linkId, name: linkId, ..._links[linkId] };
      this.addLink(linksData, parent);
    });
    return this;
  }

  /**
   * Add links information to children inside other containers
   *
   * @param {TreeNode} node : Node to search for target/source
   * @param {Object} link : link information
   * @param {Integer} level : Iteration level
   */
  _addLinksToChildren(node, link, level = 0) {
    const parentId = link.data.targetFullPath[level];
    const container = node.children.get(parentId);
    if (container?.children) {
      container.children.forEach(child => {
        this._addLinkToNode(child, link);
      });
      if (link.data.targetFullPath[level + 1])
        this._addLinksToChildren(container, link, level + 1);
    }
  }

  /**
   * Add link information to node
   *
   * @param {TreeNode} child : child node
   * @param {Object} link : link information
   */
  _addLinkToNode(child, link) {
    const childId = child.data.id;
    const linkData = link.data;

    if (
      linkData.targetFullPath.includes(childId) ||
      linkData.sourceFullPath.includes(childId)
    ) {
      linkData.sourceTemplatePath = linkData.sourceFullPath.map(
        nodeName => this.nodes.get(nodeName)?.obj?.templateName || nodeName
      );
      linkData.targetTemplatePath = linkData.targetFullPath.map(
        nodeName => this.nodes.get(nodeName)?.obj?.templateName || nodeName
      );
      child.addLink(linkData);
    }
  }

  /**
   * @override _loadNodes: Gather information about all nodes passed
   *  - Use TreeClassicNode/TreeContainerNode/TreeStateNode to create node instances
   *
   * @param {Object} nodes : List of nodes/containers
   * @param {String} _type : One of NodeInst, Container, State used to get the respective class
   * @param {TreeContainerNode} parent : Parent node
   *
   * @returns {TreeNode} Node instance based on _type
   */
  async _loadNodes(nodes, _type, parent) {
    const _nodes = nodes || {};
    const keys = Object.keys(_nodes);

    for (const nodeKey of keys) {
      const _node = { ..._nodes[nodeKey], id: nodeKey };

      try {
        await this.addNode(_node, _type, parent);
      } catch (error) {
        console.warn("Error has ocurred loading node", _node, error);
      }
    }
    // Return graph instance
    return this;
  }

  /**
   * _addRootNode : Create first root node
   *
   * @param {Object} node : data about root node
   */
  async _addRootNode(node) {
    try {
      const inst = await Factory.create(
        this.docManager,
        Factory.OUTPUT[NODE_TYPES.TREE_CONTAINER],
        { canvas: this.canvas, node }
      );

      this.nodes.set(node.id, { obj: inst, links: [] });

      this.tree.root = inst;
    } catch (error) {
      console.warn("Error creating node", error);
    }
  }

  /**
   * Add Start Node
   */
  addStartNode = () => {
    const { canvas } = this;
    const inst = new StartNode({ canvas });
    const value = { obj: inst, links: [] };
    this.nodes.set(inst.data.id, value);
  };

  /**
   * @private
   * @override update : Add to canvas all children of parent node
   *
   * @param {TreeContainerNode} parent
   */
  update(parent) {
    // Render parent children
    parent.children.forEach(node => {
      node.addToCanvas();
    });
  }

  reStrokeLinks = () => {
    /* empty on purpose */
  };
}
