import lodash from "lodash";
import { BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import { NODE_TYPES, TYPES } from "../../Constants/constants";
import Graph from "../../Core/Graph/GraphBase";
import { EVT_NAMES } from "../../events";
import StartNode from "../Nodes/StartNode";
import InterfaceModes from "./InterfaceModes";
import Events from "./Events";
import Canvas from "./canvas";

const NODE_PROPS = {
  Node: {
    LABEL: "NodeLabel",
    MODEL_ADD_METHOD: "addNode",
    MODEL_DEL_METHOD: "deleteNode",
    TYPE: NODE_TYPES.NODE
  },
  Flow: {
    LABEL: "ContainerLabel",
    MODEL_ADD_METHOD: "addSubFlow",
    MODEL_DEL_METHOD: "deleteSubFlow",
    TYPE: NODE_TYPES.CONTAINER
  }
};

export default class MainInterface {
  constructor({
    id,
    containerId,
    modelView,
    width,
    height,
    data,
    classes,
    call,
    graphCls
  }) {
    //========================================================================================
    /*                                                                                      *
     *                                      Properties                                      *
     *                                                                                      */
    //========================================================================================
    this.id = id;
    this.containerId = containerId;
    this.width = width;
    this.height = height;
    this.modelView = modelView;
    this.data = data;
    this.graphCls = graphCls ?? Graph;
    this.classes = classes;
    this.docManager = call;
    this.stateSub = new BehaviorSubject(0);
    this.events = new Events();
    this.mode = new InterfaceModes(this);
    this.api = null;
    this.canvas = null;
    this.graph = null;
    this.shortcuts = null;

    this.initialize();
  }

  //========================================================================================
  /*                                                                                      *
   *                                    Initialization                                    *
   *                                                                                      */
  //========================================================================================

  initialize = () => {
    const { classes, containerId, docManager, height, id, width } = this;

    // Set initial mode as loading
    this.setMode(EVT_NAMES.LOADING);

    this.canvas = new Canvas({
      mInterface: this,
      containerId,
      width,
      height,
      classes,
      docManager
    });

    this.graph = new this.graphCls({
      id,
      mInterface: this,
      canvas: this.canvas,
      docManager
    });

    // Load document and add subscribers
    this.addSubscribers()
      .loadDoc()
      .then(() => {
        this.canvas.el.focus();
        this.setMode(EVT_NAMES.DEFAULT);
      });
  };

  /**
   * @private
   * Loads the document in the graph
   * @returns {MainInterface} : The instance
   */
  loadDoc = async () => {
    await this.graph.loadData(this.modelView.current.serializeToDB());
  };

  //========================================================================================
  /*                                                                                      *
   *                                  Setters and Getters                                 *
   *                                                                                      */
  //========================================================================================

  get selectedNodes() {
    return this.graph.selectedNodes;
  }

  set selectedNodes(nodes) {
    this.graph.selectedNodes = nodes;
    if (this.selectedLink) this.selectedLink.onSelected(false);
  }

  get selectedLink() {
    return this.graph.selectedLink;
  }

  set selectedLink(link) {
    if (this.graph.selectedLink) this.graph.selectedLink.onSelected(false);
    this.graph.selectedLink = link;
  }

  setMode = (mode, props, force) => {
    this.mode.setMode(mode, props, force);
  };

  setPreviousMode = () => {
    this.mode.setPrevious();
  };

  nodeStatusUpdated = (nodeStatus, robotStatus) => {
    this.graph.nodeStatusUpdated(nodeStatus, robotStatus);
  };

  addLink = () => {
    const { src, trg, link, toCreate } = this.mode.linking.props;

    if (toCreate && link.isValid(src, trg, this.graph.links)) {
      // create new link
      const newLink = this.modelView.current.addLink(link.toSave(src, trg));

      // render new link localy
      this.graph.addLink(newLink);
      this.graph.validateFlow();

      this.events.onAddLink.next(newLink);
    }
  };

  deleteLink = linkId => {
    this.modelView.current.deleteLink(linkId);
    this.graph.deleteLinks([linkId]);
    this.graph.validateFlow();
  };

  addNode = name => {
    const node = {
      ...this.mode.current.props.node.data,
      NodeLabel: name,
      name: name,
      id: name
    };
    this.modelView.current.addNode(node);
    this.graph.addNode(node, NODE_TYPES.NODE).then(() => {
      this.graph.update();
      this.setMode(EVT_NAMES.DEFAULT);
    });

    return this;
  };

  addFlow = name => {
    const node = {
      ...this.mode.current.props.node.data,
      ContainerLabel: name,
      name: name,
      id: name
    };
    this.modelView.current.addSubFlow(node);
    this.graph.addNode(node, NODE_TYPES.CONTAINER).then(() => {
      this.graph.update();
      this.setMode(EVT_NAMES.DEFAULT);
    });

    return this;
  };

  /**
   * Paste node/sub-flow
   *  Add it to model data and to canvas
   * @param {string} name : Copy new name
   * @param {*} nodeData : Node original data
   * @param {{x: number, y: number}} position : Position to paste node
   */
  pasteNode = (name, nodeData, position) => {
    // Gather information from model
    const NODE_PROP_DATA = NODE_PROPS[nodeData.model];
    // Set node in canvas boundaries
    const nodePos = this.canvas.getPositionInBoundaries(position.x, position.y);
    // Build node data
    const node = {
      ...nodeData,
      Visualization: nodePos,
      [NODE_PROP_DATA.LABEL]: name,
      Label: name,
      name: name,
      id: name
    };
    // Add node to model data
    this.modelView.current[NODE_PROP_DATA.MODEL_ADD_METHOD](node);
    // Add node to canvas
    this.graph.addNode(node, NODE_PROP_DATA.TYPE).then(() => {
      this.graph.update();
      this.setMode(EVT_NAMES.DEFAULT);
    });
  };

  /**
   * Delete Nodes/Sub-Flows
   * @param {*} node : Node data
   */
  deleteNode = node => {
    // Gather information from model
    const NODE_PROP_DATA = NODE_PROPS[node.model];
    // Delete from model data
    this.modelView.current[NODE_PROP_DATA.MODEL_DEL_METHOD](node.id);
    // Delete from canvas
    this.graph.deleteNode(node.id);
    // Remove from selected nodes
    this.selectedNodes = this.selectedNodes.filter(
      el => el.data.id !== node.id
    );
  };

  toggleExposedPort = port => {
    const templateName = port.node.getExposedName();
    const nodeName = port.node.name;
    const portName = port.name;

    this.graph.updateExposedPorts(
      this.modelView.current.toggleExposedPort(templateName, nodeName, portName)
    );
  };

  searchNode = node => {
    return node.name && this.graph.nodes.get(node.name)?.obj;
  };

  //========================================================================================
  /*                                                                                      *
   *                                      Subscribers                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * @private
   * Initializes the subscribers
   * @returns {MainInterface} : The instance
   */
  addSubscribers = () => {
    this.mode.default.onEnter.subscribe(this.onDefault);

    // drag mode -> onExit event
    this.mode.drag.onExit.subscribe(this.onDragEnd);

    // Node click and double click events
    this.mode.selectNode.onEnter.subscribe(this.onSelectNode);

    this.mode.onDblClick.onEnter.subscribe(() => {
      this.setMode(EVT_NAMES.DEFAULT);
    });

    // Linking mode events
    this.mode.linking.onEnter.subscribe(this.onLinkingEnter);
    this.mode.linking.onExit.subscribe(this.onLinkingExit);

    // Canvas events (not modes)
    // toggle warnings
    this.canvas.events
      .pipe(filter(event => event.name === EVT_NAMES.ON_TOGGLE_WARNINGS))
      .subscribe(this.onToggleWarnings);

    return this;
  };

  //========================================================================================
  /*                                                                                      *
   *                                    Helper Methods                                    *
   *                                                                                      */
  //========================================================================================

  hideLinks = (node, visitedLinks) => {
    node.links.forEach(linkId => {
      const link = this.graph.links.get(linkId);
      if (
        // link was not yet visited or is visible
        !visitedLinks.has(linkId) ||
        link.visible
      ) {
        link.visibility = node.obj.visible;
      }
      visitedLinks.add(linkId);
    });
  };

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  onDefault = () => {
    this.selectedNodes.length = 0;
  };

  onDragEnd = draggedNode => {
    const selectedNodesSet = new Set([draggedNode].concat(this.selectedNodes));
    const nodes = Array.from(selectedNodesSet).filter(obj => obj);

    nodes.forEach(node => {
      const { id } = node.data;
      const [x, y] = node.data.Visualization;

      const items =
        node.data.type === TYPES.CONTAINER
          ? this.modelView.current.getSubFlows()
          : this.modelView.current.getNodeInstances();

      items.getItem(id).setPosition(x, y);
    });
  };

  onLinking = data => {
    this.graph.nodes.forEach(node => node.obj.linking(data));
  };

  onLinkingEnter = () => {
    const { data } = this.mode.current.props.src;
    this.onLinking(data);
  };

  onLinkingExit = () => {
    this.onLinking();
    this.addLink();
  };

  onSelectNode = data => {
    const { nodes, shiftKey } = data;
    const { selectedNodes } = this;
    const filterNodes = nodes.filter(n => n.data.model !== StartNode.model);

    this.selectedLink = null;

    if (!shiftKey) selectedNodes.length = 0;

    filterNodes.forEach(node => {
      node.selected
        ? selectedNodes.push(node)
        : lodash.pull(selectedNodes, node);
    });
  };

  onToggleWarnings = event => {
    // show/hide warnings
    this.graph.updateWarningsVisibility(event.data);
  };

  onStateChange = fn => {
    return this.stateSub.subscribe(fn);
  };

  onGroupsChange = groups => {
    const visitedLinks = new Set();
    this.graph.nodes.forEach(node => {
      node.obj.onGroupsChange(groups);
      this.hideLinks(node, visitedLinks);
    });
  };

  onGroupChange = (groupId, visibility) => {
    const visitedLinks = new Set();
    this.graph.nodes.forEach(node => {
      if (node.obj.data.NodeLayers?.includes(groupId)) {
        node.obj.visibility = !visibility;
        this.hideLinks(node, visitedLinks);
      }
    });
  };

  /**
   * Resets all Node status (Turns of the center)
   */
  resetAllNodeStatus = () => {
    this.graph.resetStatus && this.graph.resetStatus();
  };

  onResetZoom = () => {
    this.canvas.onResetZoom();
  };

  onMoveNode = event => {
    const currentZoom = this.canvas.currentZoom?.k ?? 1;
    const step = 2 / currentZoom + 1;
    const delta = {
      ArrowRight: [1 * step, 0],
      ArrowLeft: [-1 * step, 0],
      ArrowUp: [0, -1 * step],
      ArrowDown: [0, 1 * step]
    };
    const [dx, dy] = delta[event.code];
    const [x, y] = [50, 50]; // skip boundaries validation used when dragging a node
    this.graph.onNodeDrag(null, { x, y, dx, dy });
    this.onDragEnd();
  };

  onFocusNode = node => {
    const { xCenter, yCenter } = node.getCenter();
    this.setMode(EVT_NAMES.DEFAULT, null, true);
    node.selected = true;
    if (node.data.id !== "start") {
      this.setMode(
        EVT_NAMES.SELECT_NODE,
        { nodes: [node], shiftKey: false },
        true
      );
    }
    this.canvas.zoomToCoordinates(xCenter, yCenter);
  };

  destroy = () => {
    // Nothing to do
  };
}
