import GraphBase from "./GraphBase";
import BaseLink from "../../Components/Links/BaseLink";
import TreeClassicNode from "../../Components/Nodes/TreeView/TreeClassicNode";
import TreeContainerNode from "../../Components/Nodes/TreeView/TreeContainerNode";
import { FLOW_VIEW_MODE } from "../../Constants/constants";

class GraphTreeView extends GraphBase {
  constructor() {
    super(arguments);
    this.tree = { root: null };
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
  loadData(flow) {
    this._destroy();
    // Add root container node
    const rootNodeData = {
      id: flow.Label,
      ContainerLabel: flow.Label,
      ContainerFlow: flow.url,
      NodeInst: flow.NodeInst,
      State: flow.state,
      Container: flow.Container
    };
    // Move belong lines behind nodes in flow
    this.canvas.canvas.raise();
    // Add root node to canvas
    this._addRootNode(rootNodeData).then(() => {
      this.rootNode.addToCanvas();
    });
  }

  /**
   * @override loadNodes : Load nodes of requested flow/sub-flow
   *  - Always receive parent node
   *
   * @param {Object} flow : Flow data
   * @param {TreeContainerNode} parent : Parent node
   */
  loadNodes(flow, parent = this.rootNode) {
    Promise.all([
      this._loadNodes(flow.NodeInst, "NodeInst", parent),
      this._loadNodes(flow.State, "State", parent),
      this._loadNodes(flow.Container, "Container", parent)
    ]).then(() => {
      // Add parent children to canvas
      this._loadLinks(flow.Links, parent).update(parent);
      // Update children position
      if (!flow.Container || Object.keys(flow.Container).length === 0) {
        setTimeout(() => {
          parent.updateChildrenPosition();
          setTimeout(() => {
            // Set mode to default
            this.mode.setMode("default");
            this.onFlowValidated.next({ warnings: [] });
          }, 500);
        }, 500);
      }
    });
  }

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
  async addNode(node, _type, parent) {
    const cls = {
      NodeInst: TreeClassicNode,
      Container: TreeContainerNode
    };
    let inst;
    try {
      inst = await cls[_type].builder(this.canvas, node, parent, this);
      this.nodes.set(node.id, { obj: inst, links: [] });
      parent.addChild(inst);
    } catch (error) {
      console.log("error creating node", error);
    }
    // Return created instance
    return inst;
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
   * Update node position in canvas
   * @param {TreeContainerNode} parent : Root node
   */
  updateNodePositions = (parent = this.rootNode) => {
    parent.children.forEach(child => {
      if (child._type === "container") this.updateNodePositions(child);
    });
    parent.updateChildrenPosition();
  };

  /**
   * Find node by id recursively
   *
   * @param {String} name : Node instance ID
   * @param {TreeNode} node : Node to search
   * @returns {TreeNode} The searched node
   */
  findNodeById = (name, node = this.rootNode) => {
    if (node.data.id === name) return node;
    node.children.forEach(child => {
      this.findNodeById(name, child);
    });
  };

  /**
   * @override addLink from GraphBase class
   * @param {Object} link : Link info
   * @param {String} nodeId : Parent node ID
   */
  addLink = (link, nodeId) => {
    const parent = this.findNodeById(nodeId);
    const parsedLink = BaseLink.parseLink(link);
    if (!this.links.has(parsedLink.id)) {
      parent.children.forEach(child => {
        this._addLinkToNode(child, parsedLink);
      });
      // add links to target children
      if (parsedLink.targetFullPath.length > 1) {
        this._addLinksToChildren(parent, parsedLink);
      }
      this.links.set(parsedLink.id, { data: parsedLink });
    }
  };

  /**
   * @override deleteLinks from GraphBase class
   * @param {Array} linksToKeep : Array of link ids that should keep
   * @param {String} nodeId : Parent node ID
   */
  deleteLinks = (linksToKeep, nodeId) => {
    const parent = this.findNodeById(nodeId);
    const deletedLinks = new Map([...parent.childrenLinks]);
    parent.childrenLinks.forEach(link => {
      if (linksToKeep.includes(link.id)) deletedLinks.delete(link.id);
    });
    deletedLinks.forEach(deletedLink => {
      parent.children.forEach(child => {
        if (child.links.has(deletedLink.id)) child.removeLink(deletedLink);
      });
    });
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
    // Look for node in main flow
    const nodePath = nodeName.split("__");
    const node = parent.children.get(nodePath.splice(0, 1)[0]);
    if (node && nodePath.length) {
      this._updateNodeStatus(nodePath.join("__"), status, node);
    } else if (node) {
      node.status = [1, true, "true"].includes(status) ? true : false;
    }
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
   * @override _addNode : Add node
   *  - Use TreeClassicNode/TreeContainerNode/TreeStateNode to create node instances
   *
   * @param {Object} node : data
   * @param {string} _type : one of NodeInst, Container, State used to get the respective class
   *
   * @returns {TreeNode} Node instance based on _type
   */
  _addNode(node, _type = "NodeInst") {
    const cls = {
      NodeInst: TreeClassicNode,
      Container: TreeContainerNode
    };
    const inst = new cls[_type](this.canvas, node, {});
    this.nodes.set(node.id, { obj: inst, links: [] });
    return inst;
  }

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
      const linksData = { name: linkId, ..._links[linkId] };
      const parsedLink = BaseLink.parseLink(linksData);
      parent.children.forEach(child => {
        this._addLinkToNode(child, parsedLink);
      });
      // add links to target children
      if (parsedLink.targetFullPath.length > 1) {
        this._addLinksToChildren(parent, parsedLink);
      }
      // update local link list
      this.links.set(linkId, { data: parsedLink });
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
    const parentId = link.targetFullPath[level];
    const container = node.children.get(parentId);
    if (container?.children) {
      container.children.forEach(child => {
        this._addLinkToNode(child, link);
      });
      if (link.targetFullPath[level + 1])
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
    if (
      link.targetFullPath.includes(childId) ||
      link.sourceFullPath.includes(childId)
    ) {
      link.sourceTemplatePath = link.sourceFullPath.map(
        nodeName => this.nodes.get(nodeName)?.obj?.templateName || nodeName
      );
      link.targetTemplatePath = link.targetFullPath.map(
        nodeName => this.nodes.get(nodeName)?.obj?.templateName || nodeName
      );
      child.addLink(link);
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
    const pNodes = [];
    // Gather nodes
    Object.keys(_nodes).forEach(node => {
      const _node = { ..._nodes[node], id: node };
      pNodes.push(this.addNode(_node, _type, parent));
    });
    await Promise.all(pNodes);
    // Return graph instance
    return this;
  }

  /**
   * _addRootNode : Create first root node
   *
   * @param {Object} node : data about root node
   */
  async _addRootNode(node) {
    const inst = await TreeContainerNode.builder(this.canvas, node, null, this);
    this.tree.root = inst;
  }

  /**
   * @private
   * @override update : Add to canvas all children of parent node
   *
   * @param {TreeContainerNode} parent
   */
  update(parent) {
    // Order children
    parent.children = new Map(
      [...parent.children.entries()].sort(([_aKey, a], [_bKey, b]) => {
        return b.data.type.localeCompare(a.data.type);
      })
    );
    // Render parent children
    parent.children.forEach(node => {
      node.addToCanvas();
    });
  }
}

export default GraphTreeView;
