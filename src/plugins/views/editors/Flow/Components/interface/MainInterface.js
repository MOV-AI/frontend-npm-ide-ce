import { throttleTime } from "rxjs/operators";
import { filter } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import lodash from "lodash";

import MasterComponent from "../../../MasterComponent/MasterComponent";
import { formatNodeData, formatNodeVisualization } from "../../Utils/Formater";
import GraphValidator from "../../Core/Graph/GraphValidator";
import RestApi from "../../Core/Api/RestApi";
import FlowSubscriber from "../../Subscribers/NewFlowSubscriber";

import Canvas from "./canvas";
import Graph from "../../Core/Graph/GraphBase";
import InterfaceModes from "./InterfaceModes";
import Shortcuts from "./Shortcuts";
import { NodesDB } from "../../../../api/NodesDB";
import FlowsDB from "../../Subscribers/Flows";
import { Document } from "@mov-ai/mov-fe-lib-core";
import _get from "lodash/get";

import { maxMovingPixels, FLOW_VIEW_MODE } from "../../Constants/constants";
import i18n from "../../../../i18n/i18n.js";

export default class MainInterface {
  constructor(
    component,
    uid,
    type,
    width,
    height,
    container,
    model,
    readOnly,
    workspace = "global",
    version = "__UNVERSIONED__",
    graphBuilder = (_interface, _canvas, _id) =>
      new Graph(_interface, _canvas, _id)
  ) {
    this.uid = uid;
    this.width = width;
    this.height = height;
    this.maxMovingPixels = maxMovingPixels;
    this.type = type;
    this.container = container;
    this.component = component;
    this.canvas = null;
    this.graph = null;
    this.flowSubscriber = null;
    this.shortcuts = null;
    this.model = model || "Flow";
    this.state_sub = new BehaviorSubject(0);
    this.loading = 2;
    this.readOnly = readOnly;
    this.graphBuilder = graphBuilder;

    this.mode = new InterfaceModes(this);
    this.api = new RestApi(this.uid, this.type, this.model);

    this.workspace = workspace;
    this.version = version;
    this.name = this.uid;
    this.document = {};

    this._waitForDB();
    //setTimeout(this._waitForDB, 1);
  }

  destroy = () => {
    if (this.flowSubscriber) {
      this.flowSubscriber.destroy();
      this.flowSubscriber = null;
    }
  };

  _initialize = () => {
    this.canvas = new Canvas(
      this,
      this.uid,
      this.type,
      this.width,
      this.height,
      this.maxMovingPixels,
      this.container,
      this.readOnly
    );

    this.graph = this.graphBuilder(this, this.canvas, this.uid);
    this.shortcuts = new Shortcuts(this, this.canvas);
    // Set initial mode as loading
    this.setMode("loading");
    // Load document and add subscribers
    this._loadDoc()._addSubscribers().state_sub.next(1);
    // Set focus to canvas
    setTimeout(() => this.canvas.el.focus(), 1000);
  };

  _waitForDB = () => {
    this.nodesDB = new NodesDB();
    this.nodesDB.onStateChange(data => this._loading(data));
    this.flowsDB = new FlowsDB();
    this.flowsDB.onStateChange(data => this._loading(data));
    return this;
  };

  _loading = data => {
    this.loading -= data;
    if (this.loading === 0) this._initialize();
  };

  reload = () => {
    this.canvas.reload();
    this.destroy();
    this._loadDoc();
  };

  _eventsOn = (fn, param) => {
    const isEditable = this.graph.viewMode === FLOW_VIEW_MODE.default;
    if (isEditable) fn(param);
  };

  _addSubscribers = () => {
    // addNode mode -> click event
    this.mode.addNode.onClick.subscribe(() =>
      this._eventsOn(this.dlgNewNode, "NodeInst")
    );
    this.mode.addFlow.onClick.subscribe(() =>
      this._eventsOn(this.dlgNewNode, "Container")
    );
    this.mode.addState.onClick.subscribe(() =>
      this._eventsOn(this.dlgNewNode, "State")
    );

    // loading mode -> onExit event
    this.mode.loading.onExit.subscribe(() => {
      this.component.setState({ loading: false });
    });

    // loading mode -> onEnter event
    this.mode.loading.onEnter.subscribe(() => {
      this.component.setState({ loading: true });
    });

    this.mode.default.onEnter.subscribe(() => this.onDefault());

    // drag mode -> onExit event
    this.mode.drag.onExit.subscribe(node => this.onDragEnd(node));

    // experimental: send new position onDrag instead of onExit
    // drag mode -> onDrag event
    this.mode.drag.onDrag
      .pipe(throttleTime(100))
      .subscribe(node => this.onDragEnd(node));

    // context menus modes -> onEnter events
    this.mode.nodeCtxMenu.onEnter.subscribe(data => this.onNodeCtxMenu(data));
    this.mode.canvasCtxMenu.onEnter.subscribe(data =>
      this.onCanvasCtxMenu(data)
    );
    this.mode.linkCtxMenu.onEnter.subscribe(data => this.onLinkCtxMenu(data));
    this.mode.portCtxMenu.onEnter.subscribe(data => this.onPortCtxMenu(data));

    // Node click and double click events
    this.mode.selectNode.onEnter.subscribe(data => this.onSelectNode(data));
    this.mode.selectNode.onExit.subscribe(data =>
      //this.onSelectNode(data, false)
      {}
    );
    this.mode.onDblClick.onEnter.subscribe(node => {
      this.setMode("default");
    });

    // Linking mode events
    this.mode.linking.onEnter.subscribe(() => this.onLinkingEnter());
    this.mode.linking.onExit.subscribe(() => this.onLinkingExit());

    // Canvas events (not modes)
    this.canvas.events
      .pipe(
        filter(event => event.name === "onMouseOver" && event.type === "Port")
      )
      .subscribe(event => this.onPortMouseOver(event));

    this.canvas.events
      .pipe(
        filter(event => event.name === "onMouseOut" && event.type === "Port")
      )
      .subscribe(event => this.onPortMouseOver(event));

    // link error events
    this.canvas.events
      .pipe(
        filter(
          event => event.name === "onChangeMouseOver" && event.type === "Link"
        )
      )
      .subscribe(event => this.onLinkErrorMouseOver(event));

    // toggle warnings
    this.canvas.events
      .pipe(filter(event => event.name === "onToggleWarnings"))
      .subscribe(event => this.onToggleWarnings(event));

    return this;
  };

  _loadDoc = () => {
    const { workspace, name, model, version } = this;
    // Get document
    const doc = new Document({ workspace, name, type: model, version }, "v2");
    doc
      .read()
      .then(data => _get(data, `${model}.${doc.name}`, null))
      .then(data => {
        if (!data) throw new Error("Data not found");
        return data;
      })
      .then(_data => {
        const data = {
          ..._data,
          url: doc.path
        };
        this.flowsDB.addFlow(workspace === "global" ? doc.name : doc.url, data);
        return data;
      })
      .then(data => this._loadData(data))
      .then(() => {
        /** only subscribe to changes when working on the global workspace (aka Redis) */
        if (workspace === "global") {
          setTimeout(() => {
            // defer events subscription bc on restore
            // del and set events are mixed causing the elements
            // to render incorrectly
            this.flowSubscriber = new FlowSubscriber(
              this.uid,
              this,
              this.graph,
              this.component,
              this.model
            );
          }, 1500);
        }
      })
      .catch(error => this.onLoadError(error));

    return this;
  };

  _loadData = data => {
    this.graph.loadData(data);

    this.document = {
      Label: data.Label,
      LastUpdate: data.LastUpdate,
      User: data.User,
      ExposedPorts: data.ExposedPorts,
      Layers: data.Layers,
      Description: data.Description,
      Parameter: data.Parameter
    };
  };

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

  setDocument(key, value) {
    this.document[key] = value;
    this.flowsDB.updateCache(this.document.Label, key, value);
  }

  /**
   * dlgNewNode - show dialog to input name of the new node
   *
   */
  dlgNewNode = type => {
    const titles = {
      NodeInst: i18n.t("Add node"),
      Container: i18n.t("Add sub flow"),
      State: i18n.t("Add state")
    };
    const node = this.mode.current.props.data;
    const nodes = this.graph.nodes;
    MasterComponent.createNewApp(
      titles[type],
      value => this.dlgSubmitNode(value, node),
      () => this.mode.setMode("default"),
      value => GraphValidator.validateNodeName(value, nodes)
    );
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
    this.setMode("default");
  }

  validateNodeTocopy = data => {
    return lodash.get(data, "node.ContainerFlow", "") !== this.uid;
  };

  /**
   * dlgPasteNode - show dialog to input name of the copy
   */
  dlgPasteNode = (position, nodeToCopy) => {
    const nodes = this.graph.nodes;
    const modalTitle = {
      NodeInst: i18n.t("Paste Node"),
      Container: i18n.t("Paste Sub-flow"),
      State: i18n.t("Paste State")
    };
    // Validate if pasted node still exists
    if (!nodes.get(nodeToCopy.node.id)) {
      return this.api.resetClipboard();
    }
    // Open modal to enter copied node name
    return new Promise((re, rej) => {
      MasterComponent.createNewApp(
        modalTitle[nodeToCopy.node.type],
        value => {
          this.dlgPSubmitNode(value, position, nodeToCopy);
          re(true);
        },
        () => {
          this.mode.setMode("default");
          re(true);
        },
        value => GraphValidator.validateNodeName(value, nodes),
        // Add input name to props
        { inputValue: `copy_${nodeToCopy.node.name}` }
      );
    });
  };

  dlgPSubmitNode(value, position, nodeToCopy) {
    this.api.copyNode(value, position, nodeToCopy);
    this.setMode("default");
  }

  addLink = () => {
    const { src, trg, link, to_create } = this.mode.linking.props;
    if (to_create && link.is_valid(src, trg, this.graph.links)) {
      const { src, trg, link } = this.mode.linking.props;
      this.api.addLink(link.to_save(src, trg));
    }
  };

  onLoadError = error => {
    const message = `Error loading flow ${this.uid}\n${error.message}`;
    MasterComponent.confirmAlert(
      "Error",
      message,
      () => {},
      () => MasterComponent.deleteTab("Flow", this.uid),
      "",
      "default",
      "Ok",
      "primary",
      [],
      true,
      true
    );
  };

  onDefault = () => {
    this.selectedNodes.length = 0;
  };

  onDragEnd = node => {
    const nodes = [...this.selectedNodes, node].filter(obj => obj);
    const updatedNodes = [];
    nodes.forEach(node => {
      const nodeId = node.data.id;
      if (updatedNodes.indexOf(nodeId) >= 0) return;
      updatedNodes.push(nodeId);
      const pos = formatNodeVisualization(node.data, node.data.type);
      // hack change after review callback Backend.FlowApi
      const nodeType =
        node.data.type === "Container" ? "MovAI/Flow" : "MovAI/State";
      this.api.setNodePosition({
        nodeId,
        data: { ...pos.Visualization },
        nodeType
      });
    });
  };

  onNodeCtxMenu = data => {
    this.component.props.nodeContextMenu.current.handleOpen(data.event, {
      ...data.node.data,
      node: data.node,
      onClose: () => {
        this.setMode("default");
      }
    });
  };

  onCanvasCtxMenu = data => {
    if (!this.component.props.canvasContextMenu) return;
    this.component.props.canvasContextMenu.current.handleOpen(data.event, {
      x: data.position.x,
      y: data.position.y,
      onClose: () => {
        this.setMode("default");
      }
    });
  };

  onLinkCtxMenu = data => {
    if (!this.component.props.linkContextMenu) return;
    this.component.props.linkContextMenu.current.handleOpen(data.event, {
      ...data,
      onClose: () => {
        this.setMode("default");
      }
    });
  };

  onPortCtxMenu = data => {
    if (!this.component.props.portContextMenu) return;
    data.exposedPorts = this.graph.exposedPorts || {};
    this.component.props.setPortHasCallBack(!!data.port.data.callback);
    this.component.props.portContextMenu.current.handleOpen(data.event, {
      ...data,
      onClose: () => {
        this.setMode("default");
      }
    });
  };

  onSelectNode = data => {
    const { nodes, shiftKey } = data;
    const selectedNodes = this.selectedNodes;
    this.selectedLink = null;
    if (!shiftKey) selectedNodes.length = 0;
    nodes.forEach(node => {
      const _selected = node.selected;
      _selected ? selectedNodes.push(node) : lodash.pull(selectedNodes, node);
    });
  };

  onLinkingEnter = () => {
    const { data } = this.mode.current.props.src;
    this.onLinking(data);
  };

  onLinkingExit = () => {
    this.onLinking();
    this.addLink();
  };

  onLinking = data => {
    this.graph.nodes.forEach(node => node.obj.linking(data));
  };

  /**
   *
   * @param {obj} data {port, mouseover}
   */
  onPortMouseOver = event => {
    // open/close the tooltip component
    this.component.tooltip.current.handleOpen(
      event.data.port,
      event.data.mouseover
    );
  };

  /**
   * Triggered to show/hide tooltip
   * @param {*} event {link, mouseover}
   */
  onLinkErrorMouseOver = event => {
    // open/close tooltip component
    this.component.flowTooltip.current.handleOpen(
      event.data.link,
      event.data.mouseover
    );
  };

  onToggleWarnings = event => {
    // show/hide warnings
    this.component.warnings.current.handleOpen(event.data);
    this.graph.updateWarningsVisibility(event.data);
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
          // link was not yet visited or was visited and is visible
          !visited_links.has(link_id) ||
          (visited_links.has(link_id) && link.visible === true)
        ) {
          link.visibility = node.obj.visible;
        }
        visited_links.add(link_id);
      });
    });
  };
}
