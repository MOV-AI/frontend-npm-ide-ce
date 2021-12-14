import { Subject } from "rxjs";
import ClassicNode from "../../Components/Nodes/ClassicNode";
import StartNode from "../../Components/Nodes/StartNode";
import ContainerNode from "../../Components/Nodes/ContainerNode";
import StateNode from "../../Components/Nodes/StateNode";
import BaseLink from "../../Components/Links/BaseLink";
import GraphValidator from "./GraphValidator";
import { InvalidLink } from "../../Components/Links/Errors";
import { FLOW_VIEW_MODE } from "../../Constants/constants";
import { shouldUpdateExposedPorts } from "./Utils";
import i18n from "../../../../i18n/i18n.js";

import { NodesDB } from "../../../../api/NodesDB";
import Flows from "../../Subscribers/Flows";
import MasterComponent from "../../../MasterComponent/MasterComponent";
import { messages } from "../Api/Messages";
import _debounce from "lodash/debounce";

export default class Graph {
  constructor(mInterface, canvas, flowId) {
    this.mInterface = mInterface;
    this.canvas = canvas;
    this.flowId = flowId;
    this.templates = null;
    this.flows = null;
    this.nodes = new Map(); // node_name : {obj: node_instance, links: []}
    this.links = new Map(); // link_id : link_instance
    this.exposedPorts = {};
    this.selectedNodes = [];
    this.selectedLink = null;
    this.temp_node = null;
    this.warnings = [];
    this.warningsVisibility = true;
    this.validator = new GraphValidator(this);
    this.onFlowValidated = new Subject();
    this.invalidLinks = [];

    this._initialize();
  }

  _initialize = () => {
    this._addSubscribers()._addTemplates()._addFlows()._addEvents();
  };

  _addSubscribers = () => {
    this.mode.default.onEnter.subscribe({
      next: () => this.reset()
    });
    this.mode.addNode.onEnter.subscribe({
      next: () => this.reset()
    });

    return this;
  };

  _addTemplates = () => {
    this.templates = new NodesDB();
    this.templates.onUpdate(data => this.onTemplateUpdate(data));
    return this;
  };

  // subscriber to get ExposedPorts updates from other flows
  _addFlows = () => {
    this.flows = new Flows();
    this.flows.onUpdate(flow_id => this.onTemplateUpdate(flow_id));
    return this;
  };

  _addEvents = () => {
    this.canvas.el.addEventListener("onEnterDefault", this.reset);
    return this;
  };

  _update() {
    for (const node of this.nodes.values()) {
      node.obj.addToCanvas();
    }
    this.validateFlow();
  }

  _destroy = () => {
    // Clear nodes
    this.nodes.forEach(node => node.obj.destroy());
    this.nodes.clear();
    // Clear links
    this.links.forEach(link => link.destroy());
    this.links.clear();
  };

  async _loadNodes(nodes, _type = "NodeInst", start_node = true) {
    const _nodes = nodes || {};
    const value = Math.random();
    const pNodes = [];

    Object.keys(_nodes).forEach(node => {
      const _node = { ..._nodes[node], id: node };
      pNodes.push(this.addNode(_node, _type, value));
    });

    await Promise.all(pNodes);

    if (start_node) this.addStartNode();
    return this;
  }

  _loadLinks(links) {
    const _links = links || {};
    Object.keys(_links).forEach(link_id => {
      this.addLink({ name: link_id, ..._links[link_id] });
    });
    this._removeLinksModal();
    return this;
  }

  _removeLinksModal = () => {
    const readOnly = this.mInterface.readOnly;
    const title = i18n.t("Invalid links found");
    const message = readOnly
      ? i18n.t("Fix not available in view only mode.")
      : i18n.t("Do you want to fix this?");

    if (this.invalidLinks.length > 0) {
      MasterComponent.confirmAlert(
        title,
        message,
        readOnly ? () => {} : this._getRemoveInvalidLinks(),
        () => {},
        i18n.t("Fix"),
        "primary",
        i18n.t("Cancel"),
        "secondary",
        [],
        readOnly
      );
    }
    return this;
  };

  _getRemoveInvalidLinks = () => () => {
    const msg = messages();
    const positiveMsg = msg.onDeleteInvLinkSuccess;
    const negativeMsg = msg.onDeleteInvLinkFail;
    const { api } = this.mInterface;
    let areLinksDeleted = true;
    this.invalidLinks.forEach(({ id }) =>
      api.deleteLink(
        id,
        res => (areLinksDeleted = areLinksDeleted && res.success)
      )
    );
    if (areLinksDeleted) {
      MasterComponent.alert(positiveMsg);
      this.invalidLinks = [];
    } else MasterComponent.alert(negativeMsg, MasterComponent.ALERTS.warning);
  };

  /**
   * Open confirm alert to inform if there is any sub-flow with invalid params
   *
   * @param {Array} invalidContainerParams : array of containers id that has invalid params
   * @returns this graph instance
   */
  _invalidContainerParamModal = invalidContainerParams => {
    const title = i18n.t("Sub-flows with invalid parameters");
    let message =
      i18n.t(
        "The parameters of the sub-flow should come from the flow template."
      ) +
      i18n.t(
        "The following sub-flows contains custom parameters that are not present on its template:"
      );

    invalidContainerParams.forEach(containerId => {
      message += "\n  " + containerId;
    });

    message +=
      "\n\n" +
      i18n.t(
        "To fix it, you can either remove the custom parameter on the sub-flow or add the parameter on the template."
      );

    if (invalidContainerParams.length > 0) {
      MasterComponent.confirmAlert(
        title,
        message,
        () => {},
        () => {},
        "",
        "",
        "Ok",
        "secondary",
        [],
        true,
        true
      );
    }
    return this;
  };

  _loadExposedPorts = (exposed_ports, update_all) => {
    const updates = shouldUpdateExposedPorts(
      this.exposedPorts,
      exposed_ports,
      update_all
    );

    updates.forEach(obj => {
      const node = this.nodes.get(obj.node);
      node
        ? node.obj.setExposedPort(obj.port, obj.value)
        : console.error(
            `${i18n.t("Exposed port: node")} ${obj.node} ${i18n.t("not found")}`
          );
    });
    this.exposedPorts = exposed_ports;
    return this;
  };

  get mode() {
    return this.mInterface.mode;
  }

  get viewMode() {
    return FLOW_VIEW_MODE.default;
  }

  _updateContainersWithTemplate = template_name => {
    const containers = [...this.nodes]
      .filter(([id, node]) => node.obj.data.type === "Container")
      .map(([id, node]) => node.obj);
    // update container with template_name
    containers.forEach(subFlow => {
      const container = this.flows.getFlow(subFlow.template_name);
      const containerNodes = container?.NodeInst || {};
      const hasTemplate = Object.values(containerNodes).filter(
        el => el.Template === template_name
      ).length;
      if (hasTemplate) subFlow.onTemplateUpdate(subFlow.template_name);
    });
  };

  _debounceToValidateFlow = _debounce(() => {
    this.validateFlow();
  }, 500);

  onNodeDrag = (dragged_node, d) => {
    const all_nodes = this.nodes;
    const all_links = this.links;
    let nodes = [...this.selectedNodes];

    if (dragged_node) {
      const gnode = this.nodes.get(dragged_node.data.id);
      nodes = new Set([gnode.obj].concat(nodes));
    }

    if (this.canvas.inBoundaries(d.x, d.y)) {
      this.selectedNodes.forEach(node => {
        node.setPositionDelta(d.dx, d.dy);
      });
    }

    function update() {
      nodes.forEach(node => {
        const node_links = all_nodes.get(node.data.id)?.links || [];
        node_links.forEach(link_id => {
          const _link = all_links.get(link_id);
          const sourceNode = all_nodes.get(_link.data.sourceNode);
          const targetNode = all_nodes.get(_link.data.targetNode);
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

  onTemplateUpdate = _debounce(template_name => {
    this.nodes.forEach(node => node.obj.onTemplateUpdate(template_name));
    setTimeout(() => {
      this._loadExposedPorts(this.exposedPorts, true);
      this._updateContainersWithTemplate(template_name);
      this._debounceToValidateFlow();
    }, 100);
  });

  /**
   * Event triggered on mouse over link
   *  Fade out all other links
   * @param {BaseLink} link : hovered link
   */
  onMouseOverLink = link => {
    this.links.forEach(_link => {
      if (_link.id !== link.data.id) {
        _link.transparent = true;
      }
    });
  };

  /**
   * Event triggered on mouse leave link
   *  Remove transparency from all links (let all active)
   */
  onMouseOutLink = () => {
    this.links.forEach(_link => {
      _link.transparent = false;
    });
  };

  loadData(flow) {
    this._destroy();

    Promise.all([
      this._loadNodes(flow.NodeInst),
      this._loadNodes(flow.State, "State"),
      this._loadNodes(flow.Container, "Container", false)
    ]).then(() => {
      this._loadLinks(flow.Links)
        ._loadExposedPorts(flow.ExposedPorts || {})
        ._update();

      this.mode.setMode("default");
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
    this._invalidContainerParamModal(invalidContainersParam);
  };

  /**
   * updateNode is called when the subscriber gets changes
   *  if node_id is not yet part of the graph means we are
   *  getting a new node
   *
   * @param {string} node_id node's unique id
   * @param {obj} data node's data that has changed
   */
  updateNode = (event, node_id, data, _type = "NodeInst") => {
    const node = this.nodes.get(node_id);

    if (node) {
      // node already exists
      const isValid =
        event !== "del" ? node.obj.update(data) : node.obj.deleteKey(data);
      if (!isValid) {
        node.obj.destroy();
        this.nodes.delete(node_id);
      }
    } else {
      // node is not yet part of the graph
      if (event !== "del") {
        try {
          this._addNode({ id: node_id, ...data }, _type);
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  updateExposedPorts = exposed_ports => {
    this._loadExposedPorts(exposed_ports);
  };

  addStartNode = () => {
    const inst = new StartNode(this.canvas);
    const value = { obj: inst, links: [] };
    this.nodes.set(inst.data.id, value);
  };

  /**
   * Add a new node to the graph
   * entry format: {obj: <instance>, links: []}
   * @param {obj} node data
   * @param {str} _type one of NodeInst, Container, State used to get the respective class
   */
  _addNode(node, _type = "NodeInst") {
    const cls = {
      NodeInst: ClassicNode,
      Container: ContainerNode,
      State: StateNode
    };
    const events = { onDrag: this.onNodeDrag };
    const inst = new cls[_type](this.canvas, node, events);

    this.nodes.set(node.id, { obj: inst, links: [] });
    return inst;
  }

  /**
   * Add a new node supporting async loading
   * @param {obj} node data
   * @param {str} _type one of NodeInst, Container, State used to get the respective class
   */
  async addNode(node, _type = "NodeInst", value = 0) {
    // TODO implement archive for State
    const cls = {
      NodeInst: ClassicNode,
      Container: ContainerNode,
      State: StateNode
    };

    const events = { onDrag: this.onNodeDrag };
    let inst;

    try {
      inst = await cls[_type].builder(
        this.canvas,
        node,
        events,
        _type,
        cls[_type]
      );

      this.nodes.set(node.id, { obj: inst, links: [] });
    } catch (error) {
      console.log("error creating node", error);
    }

    return inst;
  }

  addLink = data => {
    // link already exists, update
    const link = this.links.get(data.name);
    if (link) {
      link.update_data({ Dependency: data.Dependency });
      return;
    }

    try {
      const parsed_link = BaseLink.parseLink(data);

      const [sourceNode, targetNode] = ["sourceNode", "targetNode"].map(key => {
        const node = this.nodes.get(parsed_link[key]);
        if (!node) throw new Error(`Node ${parsed_link[key]} not found`);
        return node;
      });

      const sourcePortPos = sourceNode.obj.getPortPos(parsed_link.sourcePort);
      const targetPortPos = targetNode.obj.getPortPos(parsed_link.targetPort);

      if (!sourcePortPos || !targetPortPos) {
        throw new InvalidLink(parsed_link);
      }

      // create link instance
      const obj = new BaseLink(
        this.canvas,
        sourcePortPos,
        targetPortPos,
        parsed_link,
        this.toggleTooltip
      );

      // add link to map
      this.links.set(parsed_link.id, obj);

      // add link to nodes map
      const link_nodes = [parsed_link.sourceNode, parsed_link.targetNode];
      this.nodes.forEach((value, key, map) => {
        if (link_nodes.includes(key)) {
          value.links.push(parsed_link.id);
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
  deleteLinks = links_to_keep => {
    // get which links we need to delete
    // links to delete = existing links - links to keep
    const links_to_delete = Array.from(this.links.keys()).filter(
      val => !links_to_keep.includes(val)
    );

    // delete the links
    links_to_delete.forEach(link_id => {
      this.links.get(link_id).destroy();
      this.links.delete(link_id);
    });

    // remove links_to_delete from array with links in nodes
    Array.from(this.nodes.entries()).forEach(entry => {
      // entry: [key, value]
      // value: {obj: <node instance>, links: <[]>}
      entry[1].links = entry[1].links.filter(
        val => !links_to_delete.includes(val)
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

  nodeStatusUpdated(nodes, robotStatus) {
    Object.keys(nodes).forEach(node_name => {
      const status = nodes[node_name];
      const node = this.nodes.get(node_name);
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
