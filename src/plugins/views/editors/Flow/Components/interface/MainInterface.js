import lodash from "lodash";
import { BehaviorSubject } from "rxjs";
import { throttleTime, filter } from "rxjs/operators";
import { formatNodeData } from "../../Utils/Formater";
import Canvas from "./canvas";
import Graph from "../../Core/Graph/GraphBase";
import InterfaceModes from "./InterfaceModes";
import RestApi from "../../Core/Api/RestApi";
import Shortcuts from "./Shortcuts";
import { maxMovingPixels, FLOW_VIEW_MODE } from "../../Constants/constants";
import { EVT_NAMES, EVT_TYPES } from "../../events";

import GraphValidator from "../../Core/Graph/GraphValidator";
// to remove
const t = v => v;

const TYPES = {
  NODE: "NodeInst",
  CONTAINER: "Container"
};

export default class MainInterface {
  constructor({
    id,
    containerId,
    modelView,
    type,
    width,
    height,
    data,
    classes,
    call,
    graphCls
  }) {
    this.id = id;
    this.containerId = containerId;
    this.width = width;
    this.height = height;
    this.modelView = modelView;
    this.data = data;
    this.graphCls = graphCls ?? Graph;
    this.classes = classes;
    this.docManager = call;

    // TODO: Review
    this.type = type ?? "flow";
    this.initialize();
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Properties                                      *
   *                                                                                      */
  //========================================================================================

  state_sub = new BehaviorSubject(0);
  mode = new InterfaceModes(this);
  api = null;
  canvas = null;
  graph = null;
  shortcuts = null;

  //========================================================================================
  /*                                                                                      *
   *                                    Initialization                                    *
   *                                                                                      */
  //========================================================================================

  initialize = () => {
    this.mode.setMode(EVT_NAMES.LOADING);

    const {
      classes,
      containerId,
      docManager,
      height,
      id,
      modelView,
      width,
      type
    } = this;

    this.api = new RestApi(id, type, modelView.SCOPE);
    this.canvas = new Canvas({
      mInterface: this,
      containerId,
      width,
      height,
      maxMovingPixels,
      classes,
      docManager
    });

    this.graph = new this.graphCls({
      id,
      mInterface: this,
      canvas: this.canvas,
      docManager
    });

    // Set initial mode as loading
    this.setMode(EVT_NAMES.LOADING);

    // Load document and add subscribers
    this.addSubscribers()
      .loadDoc()
      .then(() => {
        this.canvas.el.focus();

        this.mode.setMode(EVT_NAMES.DEFAULT);
      });
  };

  reload = () => {
    this.canvas.reload();
    this.destroy();
    this.loadDoc();
  };

  eventsOn = (fn, param) => {
    const isEditable = this.graph.viewMode === FLOW_VIEW_MODE.default;
    if (isEditable) fn(param);
  };

  /**
   * @private
   * Initializes the subscribers
   * @returns {MainInterface} : The instance
   */
  addSubscribers = () => {
    // addNode mode -> click event
    this.mode.addNode.onClick.subscribe(() => {
      this.dispatch(EVT_NAMES.ADD_NODE);
    });
    this.mode.addFlow.onClick.subscribe(() => {
      this.dispatch(EVT_NAMES.ADD_FLOW);
    });
    this.mode.addState.onClick.subscribe(() => {
      this.dispatch(EVT_NAMES.ADD_STATE);
    });

    // loading mode -> onExit event
    this.mode.loading.onExit.subscribe(() => {
      //this.dispatch(EVT_NAMES.LOADING, false);
    });

    // loading mode -> onEnter event
    this.mode.loading.onEnter.subscribe(() => {
      this.dispatch(EVT_NAMES.LOADING, true);
    });

    this.mode.default.onEnter.subscribe(this.onDefault);

    // drag mode -> onExit event
    this.mode.drag.onExit.subscribe(this.onDragEnd);

    // experimental: send new position onDrag instead of onExit
    // drag mode -> onDrag event
    this.mode.drag.onDrag.pipe(throttleTime(100)).subscribe(this.onDragEnd);

    // context menus modes -> onEnter events
    this.mode.nodeCtxMenu.onEnter.subscribe(this.onNodeCtxMenu);
    this.mode.canvasCtxMenu.onEnter.subscribe(this.onCanvasCtxMenu);
    this.mode.linkCtxMenu.onEnter.subscribe(this.onLinkCtxMenu);
    this.mode.portCtxMenu.onEnter.subscribe(this.onPortCtxMenu);

    // Node click and double click events
    this.mode.selectNode.onEnter.subscribe(this.onSelectNode);
    this.mode.selectNode.onExit.subscribe(data =>
      //this.onSelectNode(data, false)
      {}
    );
    this.mode.onDblClick.onEnter.subscribe(() => {
      this.setMode(EVT_NAMES.DEFAULT);
    });

    // Linking mode events
    this.mode.linking.onEnter.subscribe(this.onLinkingEnter);
    this.mode.linking.onExit.subscribe(this.onLinkingExit);

    // Canvas events (not modes)
    this.canvas.events
      .pipe(
        filter(
          event =>
            event.name === EVT_NAMES.ON_MOUSE_OVER &&
            event.type === EVT_TYPES.PORT
        )
      )
      .subscribe(this.onPortMouseOver);

    this.canvas.events
      .pipe(
        filter(
          event =>
            event.name === EVT_NAMES.ON_MOUSE_OUT &&
            event.type === EVT_TYPES.PORT
        )
      )
      .subscribe(this.onPortMouseOver);

    // link error events
    this.canvas.events
      .pipe(
        filter(
          event =>
            event.name === EVT_NAMES.ON_CHG_MOUSE_OVER &&
            event.type === EVT_TYPES.LINK
        )
      )
      .subscribe(this.onLinkErrorMouseOver);

    // toggle warnings
    this.canvas.events
      .pipe(filter(event => event.name === EVT_NAMES.ON_TOGGLE_WARNINGS))
      .subscribe(this.onToggleWarnings);

    return this;
  };

  /**
   * @private
   * Loads the document in the graph
   * @returns {MainInterface} : The instance
   */
  loadDoc = () => {
    return this.graph.loadData(this.data);
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

  validateNodeTocopy = data => {
    return data.node?.ContainerFlow !== this.id;
  };

  addLink = () => {
    const { src, trg, link, to_create } = this.mode.linking.props;

    if (to_create && link.is_valid(src, trg, this.graph.links)) {
      // TODO: add link
      this.api.addLink(link.to_save(src, trg));
    }
  };

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  onCanvasCtxMenu = data => {
    const { x, y } = data.position;

    this.dispatch(EVT_NAMES.ON_CANVAS_CTX_MENU, {
      x,
      y,
      onClose: () => {
        this.setMode(EVT_NAMES.DEFAULT);
      }
    });
  };

  onDefault = () => {
    this.selectedNodes.length = 0;
  };

  onDragEnd = draggedNode => {
    const nodes = this.selectedNodes.filter(
      node => node.data.id === draggedNode.data.id
    );
    nodes.push(draggedNode);

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

  onLinkCtxMenu = data => {
    this.dispatch(EVT_NAMES.ON_LINK_CTX_MENU, {
      ...data,
      onClose: () => {
        this.setMode(EVT_NAMES.DEFAULT);
      }
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

  onNodeCtxMenu = data => {
    this.dispatch(EVT_NAMES.ON_NODE_CTX_MENU, {
      ...data.node.data,
      node: data.node,
      onClose: () => {
        this.setMode(EVT_NAMES.DEFAULT);
      }
    });
  };

  onPortCtxMenu = data => {
    data.exposedPorts = this.graph.exposedPorts || {};

    this.dispatch(EVT_NAMES.ON_PORT_CTX_MENU, {
      ...data,
      onClose: () => {
        this.setMode(EVT_NAMES.DEFAULT);
      }
    });
  };

  onSelectNode = data => {
    const { nodes, shiftKey } = data;
    const { selectedNodes } = this;
    this.selectedLink = null;

    if (!shiftKey) selectedNodes.length = 0;

    nodes.forEach(node => {
      node.selected
        ? selectedNodes.push(node)
        : lodash.pull(selectedNodes, node);
    });
  };

  onPortMouseOver = event => {
    const { port, mouseover } = event.data;
    this.dispatch(EVT_NAMES.ON_PORT_MOUSE_OVER, { port, mouseover });
  };

  /**
   * Triggered to show/hide tooltip
   * @param {*} event {link, mouseover}
   */
  onLinkErrorMouseOver = event => {
    const { link, mouseover } = event.data;
    this.dispatch(EVT_NAMES.ON_LINK_ERROR_MOUSE_OVER, { link, mouseover });
  };

  onToggleWarnings = event => {
    // show/hide warnings
    this.graph.updateWarningsVisibility(event.data);
    this.dispatch(EVT_NAMES.ON_TOGGLE_WARNINGS, { ...event.data });
  };

  onStateChange = fn => {
    return this.state_sub.subscribe(fn);
  };

  onLayersChange = layers => {
    const visited_links = new Set();

    this.graph.nodes.forEach(node => {
      node.obj.onLayersChange(layers);

      node.links.forEach(link_id => {
        const link = this.graph.links.get(link_id);
        if (
          // link was not yet visited or is visible
          !visited_links.has(link_id) ||
          link.visible
        ) {
          link.visibility = node.obj.visible;
        }
        visited_links.add(link_id);
      });
    });
  };

  /**
   * Dispatch events to the subscriber
   * @param {string} evt The event name
   * @param {any} data Data related to the event
   * @param {function} callback A function to execute after handling the event
   */
  dispatch = (evt, data, callback) => {
    //this.subscriber(evt, data, callback);
  };

  destroy = () => {
    // Nothing to do
  };

  // ******* TO MOVE *******
  /**
   * dlgNewNode - show dialog to input name of the new node
   *
   */
  dlgNewNode = type => {
    const titles = {
      NodeInst: t("Add node"),
      Container: t("Add sub flow"),
      State: t("Add state")
    };
    const node = this.mode.current.props.data;
    const nodes = this.graph.nodes;
    // MasterComponent.createNewApp(
    //   titles[type],
    //   value => this.dlgSubmitNode(value, node),
    //   () => this.mode.setMode(EVT_NAMES.DEFAULT),
    //   value => GraphValidator.validateNodeName(value, nodes)
    // );
  };

  /**
   *  dlgSubmitNode - func to format data before calling api
   * @param {string} value Node name
   * @param {object} node Node params
   */
  dlgSubmitNode(value, node) {
    const _node = { ...node, id: value };
    const flow = { name: this.id, type: this.type };
    const data = formatNodeData(flow, _node, _node.type ? _node.type : "Node");
    this.api.addNewNode(data);
    this.setMode(EVT_NAMES.DEFAULT);
  }

  /**
   * dlgPasteNode - show dialog to input name of the copy
   */
  dlgPasteNode = (position, nodeToCopy) => {
    const nodes = this.graph.nodes;
    const modalTitle = {
      NodeInst: t("Paste Node"),
      Container: t("Paste Sub-flow"),
      State: t("Paste State")
    };
    // Validate if pasted node still exists
    if (!nodes.get(nodeToCopy.node.id)) {
      return this.api.resetClipboard();
    }
    // Open modal to enter copied node name
    // return new Promise((re, rej) => {
    //   MasterComponent.createNewApp(
    //     modalTitle[nodeToCopy.node.type],
    //     value => {
    //       this.dlgPSubmitNode(value, position, nodeToCopy);
    //       re(true);
    //     },
    //     () => {
    //       this.mode.setMode(EVT_NAMES.DEFAULT);
    //       re(true);
    //     },
    //     value => GraphValidator.validateNodeName(value, nodes),
    //     // Add input name to props
    //     { inputValue: `copy_${nodeToCopy.node.name}` }
    //   );
    // });
  };

  dlgPSubmitNode(value, position, nodeToCopy) {
    this.api.copyNode(value, position, nodeToCopy);
    this.setMode(EVT_NAMES.DEFAULT);
  }
}
