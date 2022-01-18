import { Subject } from "rxjs";
import StartNode from "../../Components/Nodes/StartNode";
import BaseLink from "../../Components/Links/BaseLink";
import GraphValidator from "./GraphValidator";
import { InvalidLink } from "../../Components/Links/Errors";
import { FLOW_VIEW_MODE } from "../../Constants/constants";
import { shouldUpdateExposedPorts } from "./Utils";
import _debounce from "lodash/debounce";
import { NODE_TYPES } from "./constants";
import Factory from "../../Components/Nodes/Factory";

// to remove
const t = v => v;

export default class Graph {
  constructor({ mInterface, canvas, id, docManager }) {
    this.mInterface = mInterface;
    this.canvas = canvas;
    this.id = id;
    this.docManager = docManager;

    this.initialize();
  }

  //========================================================================================
  /*                                                                                      *
   *                                      Properties                                      *
   *                                                                                      */
  //========================================================================================

  nodes = new Map(); // <node name> : {obj: <node instance>, links: []}
  links = new Map(); // linkId : <link instance>
  exposedPorts = {};
  selectedNodes = [];
  selectedLink = null;
  tempNode = null;
  warnings = [];
  warningsVisibility = true;
  validator = new GraphValidator(this);
  onFlowValidated = new Subject();
  invalidLinks = [];

  //========================================================================================
  /*                                                                                      *
   *                                    Initialization                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * @private
   */
  initialize = () => {
    this.addSubscribers().addEvents();
  };

  /**
   * @private
   */
  addSubscribers = () => {
    this.mode.default.onEnter.subscribe({
      next: () => this.reset()
    });
    this.mode.addNode.onEnter.subscribe({
      next: () => this.reset()
    });

    return this;
  };

  /**
   * @private
   */
  addEvents = () => {
    this.canvas.el.addEventListener("onEnterDefault", this.reset);
    return this;
  };

  /**
   * @private
   */
  update() {
    for (const node of this.nodes.values()) {
      node.obj.addToCanvas();
    }
    this.validateFlow();
  }

  /**
   * @private
   */
  destroy = () => {
    // Clear nodes
    this.nodes.forEach(node => node.obj.destroy());
    this.nodes.clear();
    // Clear links
    this.links.forEach(link => link.destroy());
    this.links.clear();
  };

  /**
   * @private
   */
  async loadNodes(nodes = {}, nodeType = NODE_TYPES.NODE, startNode = true) {
    const pNodes = Object.entries(nodes).map(([id, value]) => {
      return this.addNode({ ...value, id }, nodeType);
    });

    await Promise.all(pNodes);

    if (startNode) this.addStartNode();
    return this;
  }

  /**
   * @private
   */
  loadLinks(links = {}) {
    Object.entries(links).forEach(([id, value]) => {
      this.addLink({ id, ...value });
    });
    this.removeLinksModal();

    return this;
  }

  /**
   * @private
   */
  removeLinksModal = () => {
    // TODO: implement
    return this;
  };

  /**
   * @private
   */
  getRemoveInvalidLinks = () => () => {
    // TODO: implement
  };

  /**
   * @private
   * Open confirm alert to inform if there is any sub-flow with invalid params
   *
   * @param {Array} invalidContainerParams : array of containers id that has invalid params
   * @returns this graph instance
   */
  invalidContainerParamModal = invalidContainerParams => {
    // TODO: implement
    return this;
  };

  /**
   * @private
   */
  loadExposedPorts = (exposedPorts, updateAll) => {
    const updates = shouldUpdateExposedPorts(
      this.exposedPorts,
      exposedPorts,
      updateAll
    );

    updates.forEach(obj => {
      const node = this.nodes.get(obj.node);
      node
        ? node.obj.setExposedPort(obj.port, obj.value)
        : console.error(
            `${t("Exposed port: node")} ${obj.node} ${t("not found")}`
          );
    });
    this.exposedPorts = exposedPorts;
    return this;
  };

  get mode() {
    return this.mInterface.mode;
  }

  get viewMode() {
    return FLOW_VIEW_MODE.default;
  }

  /**
   * @private
   */
  updateContainersWithTemplate = templateName => {
    const containers = [...this.nodes]
      .filter(([id, node]) => node.obj.data.type === "Container")
      .map(([id, node]) => node.obj);
    // update container with templateName
    containers.forEach(subFlow => {
      const container = this.flows.getFlow(subFlow.templateName);
      const containerNodes = container?.NodeInst || {};
      const hasTemplate = Object.values(containerNodes).filter(
        el => el.Template === templateName
      ).length;
      if (hasTemplate) subFlow.onTemplateUpdate(subFlow.templateName);
    });
  };

  /**
   * @private
   */
  debounceToValidateFlow = _debounce(() => {
    this.validateFlow();
  }, 500);

  onNodeDrag = (draggedNode, d) => {
    const allNodes = this.nodes;
    const allLinks = this.links;
    let nodes = [...this.selectedNodes];

    if (draggedNode) {
      const gnode = this.nodes.get(draggedNode.data.id);
      nodes = new Set([gnode.obj].concat(nodes));
    }

    if (this.canvas.inBoundaries(d.x, d.y)) {
      this.selectedNodes.forEach(node => {
        node.setPositionDelta(d.dx, d.dy);
      });
    }

    function update() {
      nodes.forEach(node => {
        const nodeLinks = allNodes.get(node.data.id)?.links || [];
        nodeLinks.forEach(linkId => {
          const _link = allLinks.get(linkId);
          const sourceNode = allNodes.get(_link.data.sourceNode);
          const targetNode = allNodes.get(_link.data.targetNode);
          if (sourceNode && targetNode) {
            _link.update(
              sourceNode.obj.getPortPos(_link.data.sourcePort),
              targetNode.obj.getPortPos(_link.data.targetPort)
            );
          }
        });
      });
    }
    requestAnimationFrame(update);
  };

  onTemplateUpdate = _debounce(templateName => {
    this.nodes.forEach(node => node.obj.onTemplateUpdate(templateName));
    setTimeout(() => {
      this.loadExposedPorts(this.exposedPorts, true);
      this.updateContainersWithTemplate(templateName);
      this.debounceToValidateFlow();
    }, 100);
  });

  /**
   * Event triggered on mouse over link
   *  Fade out all other links
   * @param {BaseLink} link : hovered link
   */
  onMouseOverLink = link => {
    this.links.forEach(
      value => (value.transparent = value.id !== link.data.id)
    );
  };

  /**
   * Event triggered on mouse leave link
   *  Remove transparency from all links (let all active)
   */
  onMouseOutLink = () => {
    this.links.forEach(value => (value.transparent = false));
  };

  loadData(flow) {
    this.destroy();

    return Promise.allSettled([
      this.loadNodes(flow.NodeInst),
      this.loadNodes(flow.Container, NODE_TYPES.CONTAINER, false)
    ]).then(() => {
      this.loadLinks(flow.Links)
        .loadExposedPorts(flow.ExposedPorts || {})
        .update();
    });
  }

  /**
   * Validate flow : get warnings
   */
  validateFlow = () => {
    const { warnings, invalidContainersParam } = this.validator.validateFlow();
    this.onFlowValidated.next({ warnings: warnings });
    this.warnings = warnings;
    // Validate sub-flows parameters
    this.invalidContainerParamModal(invalidContainersParam);
  };

  /**
   * updateNode is called when the subscriber gets changes
   *  if noId is not yet part of the graph means we are
   *  getting a new node
   *
   * @param {string} nodeId node's unique id
   * @param {obj} data node's data that has changed
   */
  updateNode = (event, nodeId, data, nodeType = NODE_TYPES.NODE) => {
    const node = this.nodes.get(nodeId);

    if (node) {
      // node already exists
      const isValid =
        event !== "del" ? node.obj.update(data) : node.obj.deleteKey(data);
      if (!isValid) {
        node.obj.destroy();
        this.nodes.delete(nodeId);
      }
    } else {
      // node is not yet part of the graph
      if (event !== "del") {
        try {
          this.addNode({ id: nodeId, ...data }, nodeType);
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  updateExposedPorts = exposedPorts => {
    this.loadExposedPorts(exposedPorts);
  };

  addStartNode = () => {
    const { canvas } = this;
    const inst = new StartNode({ canvas });
    const value = { obj: inst, links: [] };
    this.nodes.set(inst.data.id, value);
  };

  /**
   * Adds a new node
   * @param {object} node : Object describing the node
   * @param {string} nodeType : One of the types in NODE_TYPES
   */
  async addNode(node, nodeType = NODE_TYPES.NODE) {
    const events = { onDrag: this.onNodeDrag };

    try {
      const inst = await Factory.create(
        this.docManager,
        Factory.OUTPUT[nodeType],
        { canvas: this.canvas, node, events }
      );

      this.nodes.set(node.id, { obj: inst, links: [] });

      return inst;
    } catch (error) {
      console.log("Error creating node", error);
    }
  }

  addLink = data => {
    // link already exists, update
    const link = this.links.get(data.id);
    if (link) {
      link.updateData({ Dependency: data.Dependency });
      return;
    }

    try {
      const parsedLink = BaseLink.parseLink(data);

      const [sourceNode, targetNode] = ["sourceNode", "targetNode"].map(key => {
        const node = this.nodes.get(parsedLink[key]);
        if (!node) throw new Error(`Node ${parsedLink[key]} not found`);
        return node;
      });

      const sourcePortPos = sourceNode.obj.getPortPos(parsedLink.sourcePort);
      const targetPortPos = targetNode.obj.getPortPos(parsedLink.targetPort);

      if (!sourcePortPos || !targetPortPos) {
        throw new InvalidLink(parsedLink);
      }

      // create link instance
      const obj = new BaseLink(
        this.canvas,
        sourcePortPos,
        targetPortPos,
        parsedLink,
        this.toggleTooltip
      );

      // add link to map
      this.links.set(parsedLink.id, obj);

      // add link to nodes map
      const linkNodes = [parsedLink.sourceNode, parsedLink.targetNode];
      this.nodes.forEach((value, key) => {
        if (linkNodes.includes(key)) {
          value.links.push(parsedLink.id);
        }
      });

      // render link
      this.canvas.append(() => {
        return obj.el;
      }, "links");
    } catch (error) {
      if (error instanceof InvalidLink) {
        this.invalidLinks.push(error.link);
      }
      console.error(error.message);
    }
  };

  /**
   * @param {array} links array of ids to KEEP
   */
  deleteLinks = linksToKeep => {
    // get which links we need to delete
    // links to delete = existing links - links to keep
    const linksToDelete = Array.from(this.links.keys()).filter(
      val => !linksToKeep.includes(val)
    );

    // delete the links
    linksToDelete.forEach(linkId => {
      this.links.get(linkId).destroy();
      this.links.delete(linkId);
    });

    // remove linksToDelete from array with links in nodes
    Array.from(this.nodes.entries()).forEach(entry => {
      // entry: [key, value]
      // value: {obj: <node instance>, links: <[]>}
      entry[1].links = entry[1].links.filter(
        val => !linksToDelete.includes(val)
      );
    });
  };

  /**
   * Show/Hide flow tooltip
   * @param {*} data : onChangeMouseOver data event
   */
  toggleTooltip = (data, type) => {
    this.canvas.events.next({
      name: "onChangeMouseOver",
      type: type,
      data
    });
  };

  setPermanentWarnings = () => {
    this.warnings = this.warnings.map(wn => ({ ...wn, isPersistent: true }));
    this.onFlowValidated.next({ warnings: this.warnings });
  };

  /**
   * Update container (sub-flow) parameters
   * @param {String} containerId : Container ID
   * @param {Object} params : new container parameter
   */
  updateContainerParams = (containerId, params) => {
    const container = this.nodes.get(containerId);
    container?.obj?.setParams(params);
  };

  updateWarningsVisibility = isVisible => {
    this.warningsVisibility = isVisible;
  };

  nodeStatusUpdated(nodes) {
    Object.keys(nodes).forEach(nodeName => {
      const status = nodes[nodeName];
      const node = this.nodes.get(nodeName);
      if (node)
        node.obj.status = [1, true, "true"].includes(status) ? true : false;
    });
  }

  reset() {
    // Reset all selected nodes
    this.nodes.forEach(node => {
      node.obj.selected = false;
    });
    // Reset selected link
    if (this.selectedLink) {
      this.selectedLink.onSelected(false);
      this.selectedLink = null;
    }
  }
}
