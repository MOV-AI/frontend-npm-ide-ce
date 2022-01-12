import { throttleTime, filter } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import lodash from "lodash";
import { formatNodeData, formatNodeVisualization } from "../../Utils/Formater";
import GraphValidator from "../../Core/Graph/GraphValidator";
import RestApi from "../../Core/Api/RestApi";
import Canvas from "./canvas";
import Graph from "../../Core/Graph/GraphBase";
import InterfaceModes from "./InterfaceModes";
import Shortcuts from "./Shortcuts";
import { maxMovingPixels, FLOW_VIEW_MODE } from "../../Constants/constants";
import { EVT_NAMES, EVT_TYPES } from "../../events";

// to remove
const t = v => v;

const DEFAULT_MODE = "default";

export default class MainInterface {
  constructor(
    //component,
    uid,
    modelView,
    type,
    width,
    height,
    container,
    model,
    readOnly,
    data,
    theme,
    graphBuilder = (_interface, _canvas, _id) =>
      new Graph(_interface, _canvas, _id)
  ) {
    this.uid = uid;
    this.width = width;
    this.height = height;
    this.container = container;
    this.modelView = modelView;
    this.type = type ?? "flow";
    this.state_sub = new BehaviorSubject(0);
    this.readOnly = readOnly;
    this.data = data;
    this.graphBuilder = graphBuilder;
    this.theme = theme;

    this.mode = new InterfaceModes(this);
    this.api = new RestApi(this.uid, this.type, this.modelView.SCOPE);

    this.subscriber = null;

    this.initialize();
  }

  initialize = () => {
    this.canvas = new Canvas(
      this,
      this.uid,
      this.type,
      this.width,
      this.height,
      maxMovingPixels,
      this.container,
      this.readOnly
    );

    this.graph = this.graphBuilder(this, this.canvas, this.uid);
    this.shortcuts = new Shortcuts(this, this.canvas);

    // Set initial mode as loading
    this.setMode(EVT_NAMES.LOADING);

    // Load document and add subscribers
    this.addSubscribers()
      .loadDoc()
      .then(() => {
        this.canvas.el.focus();

        this.dispatch(EVT_NAMES.LOADING, false);
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
      this.setMode(DEFAULT_MODE);
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

  nodeStatusUpdated = (node_status, robotStatus) => {
    this.graph.nodeStatusUpdated(node_status, robotStatus);
  };

  validateNodeTocopy = data => {
    return lodash.get(data, "node.ContainerFlow", "") !== this.uid;
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
        this.setMode(DEFAULT_MODE);
      }
    });
  };

  onDefault = () => {
    this.selectedNodes.length = 0;
  };

  onDragEnd = draggedNode => {
    const nodes = this.selectedNodes;

    if (
      !this.selectedNodes.filter(node => node.data.id === draggedNode.data.id)
    ) {
      nodes.push(draggedNode);
    }

    nodes.forEach(node => {
      const { id } = node.data;
      const [x, y] = node.data.Visualization;

      this.modelView.current.getNodeInstances().getItem(id).setPosition(x, y);
    });
  };

  onLinkCtxMenu = data => {
    this.dispatch(EVT_NAMES.ON_LINK_CTX_MENU, {
      ...data,
      onClose: () => {
        this.setMode(DEFAULT_MODE);
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
        this.setMode(DEFAULT_MODE);
      }
    });
  };

  onPortCtxMenu = data => {
    data.exposedPorts = this.graph.exposedPorts || {};

    this.dispatch(EVT_NAMES.ON_PORT_CTX_MENU, {
      ...data,
      onClose: () => {
        this.setMode(DEFAULT_MODE);
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
   * Add a function to be executed every time
   * an event is triggered
   * @param {function} callback A function to execute
   */
  subscribe = callback => {
    this.subscriber = callback;
  };

  /**
   * Dispatch events to the subscriber
   * @param {string} evt The event name
   * @param {any} data Data related to the event
   * @param {function} callback A function to execute after handling the event
   */
  dispatch = (evt, data, callback) => {
    this.subscriber(evt, data, callback);
  };

  destroy = () => {
    this.subscriber = null;
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
    //   () => this.mode.setMode(DEFAULT_MODE),
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
    const flow = { name: this.uid, type: this.type };
    const data = formatNodeData(flow, _node, _node.type ? _node.type : "Node");
    this.api.addNewNode(data);
    this.setMode(DEFAULT_MODE);
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
    //       this.mode.setMode(DEFAULT_MODE);
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
    this.setMode(DEFAULT_MODE);
  }
}
