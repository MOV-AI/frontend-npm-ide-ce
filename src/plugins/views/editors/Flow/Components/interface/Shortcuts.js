// import Mousetrap from "mousetrap";
import lodash from "lodash";
import * as d3 from "d3";

// import MasterComponent from "../../../MasterComponent/MasterComponent";
import Vec2 from "../../Utils/Vec2";

export default class Shortcuts {
  constructor(mainInterface, canvas) {
    this.mainInterface = mainInterface;
    this.canvas = canvas;
    this.mtrap = null;

    this._init();
  }

  _init = () => {
    //this.mtrap = new Mousetrap(this.el);
    //this._bind();
  };

  get el() {
    return this.canvas.el;
  }

  get selectedNodes() {
    return this.mainInterface.selectedNodes;
  }

  get selectedLink() {
    return this.mainInterface.selectedLink;
  }

  get clipboard() {
    return this.mainInterface.api.clipboard;
  }

  get readOnly() {
    return this.canvas.readOnly;
  }

  set clipboard(value) {
    this.mainInterface.api.clipboard = value;
  }

  _bind = () => {
    this._bindDeleteSelectedNodes()
      ._bindCopySelectedNode()
      ._bindPasteNode()
      ._bindArrowKeys()
      ._bindZoomReset()
      ._bindEsc()
      ._bindRandomFocus();
    return this;
  };

  _eventsOn = (fn, event, availableInReadOnly = true) => {
    const { readOnly } = this;
    if (availableInReadOnly || !readOnly) {
      fn(event);
    }
  };

  _bindDeleteSelectedNodes = () => {
    const { _eventsOn, onDeleteSelectedNodes, onDeleteSelectedLink } = this;
    this.mtrap.bind(["backspace", "del"], e => {
      _eventsOn(onDeleteSelectedNodes, e, false);
      _eventsOn(onDeleteSelectedLink, e, false);
    });
    return this;
  };

  _bindCopySelectedNode = () => {
    this.mtrap.bind("ctrl+c", e => this.onCopySelectedNode(e));
    return this;
  };

  _bindPasteNode = () => {
    const { _eventsOn, onPasteNode } = this;
    this.mtrap.bind("ctrl+v", e => _eventsOn(onPasteNode, e, false));
    return this;
  };

  _bindArrowKeys = () => {
    const { _eventsOn, onArrowKeys } = this;
    this.mtrap.bind(["left", "right", "up", "down"], e =>
      _eventsOn(onArrowKeys, e, false)
    );
    return this;
  };

  _bindZoomReset = () => {
    this.mtrap.bind("ctrl+i", e => this.onZoomReset(e));
    return this;
  };

  _bindEsc = () => {
    this.mtrap.bind("esc", e => this.onSetDefault(e));
    return this;
  };

  _bindRandomFocus = () => {
    this.mtrap.bind("ctrl+m", e => this.onRandomFocus(e));
    return this;
  };

  onDeleteSelectedNodes = () => {
    const { selectedNodes, mainInterface } = this;
    if (selectedNodes.length > 1) {
      const copySelectedNodes = [...selectedNodes];
      // MasterComponent.confirmAlert(
      //   "Delete nodes",
      //   `Are you sure you want to delete all selected nodes?`,
      //   () => {
      //     copySelectedNodes.forEach(node => {
      //       mainInterface.api.deleteNode(node.data);
      //     });
      //   },
      //   () => {}
      // );
    } else {
      selectedNodes.forEach(node => {
        // MasterComponent.confirmAlert(
        //   "Delete node",
        //   `Are you sure you want to delete "${node.name}"?`,
        //   () => mainInterface.api.deleteNode(node.data),
        //   () => {}
        // );
      });
    }
    if (selectedNodes.length > 0) mainInterface.setMode("default");
  };

  onDeleteSelectedLink = () => {
    const { selectedLink, mainInterface } = this;
    if (selectedLink) {
      // MasterComponent.confirmAlert(
      //   "Delete link",
      //   `Are you sure you want to delete the selected link?`,
      //   () => {
      //     mainInterface.api.deleteLink(selectedLink.data.id);
      //     mainInterface.setMode("default", {}, true);
      //   },
      //   () => {}
      // );
    }
  };

  onCopySelectedNode = event => {
    event.preventDefault();
    const nodesPos = this.selectedNodes.map(n =>
      Vec2.of(n.center.xCenter, n.center.yCenter)
    );
    let center = nodesPos.reduce((e, x) => e.add(x), Vec2.ZERO);
    center = center.scale(1 / this.selectedNodes.length);
    this.clipboard = {
      nodesToCopy: {
        nodes: this.selectedNodes.map(n => n.data),
        flow: this.mainInterface.uid,
        nodesPosFromCenter: nodesPos.map(pos => pos.sub(center))
      }
    };
  };

  onPasteNode = event => {
    event.preventDefault();
    const nodesToCopy = lodash.get(this.clipboard, "nodesToCopy", null);
    const areNodesValidated =
      nodesToCopy?.nodes &&
      nodesToCopy?.nodes.reduce(
        (e, node) =>
          e &&
          this.mainInterface.validateNodeTocopy({
            node,
            flow: nodesToCopy.flow
          }),
        true
      );
    if (areNodesValidated) {
      (async () => {
        for (let i = 0; i < nodesToCopy.nodes.length; i++) {
          const node = nodesToCopy.nodes[i];
          const nodesPosFromCenter = nodesToCopy.nodesPosFromCenter || [
            Vec2.ZERO
          ];
          const newPos = Vec2.fromArray(this.canvas.mouse).add(
            nodesPosFromCenter[i]
          );
          await this.mainInterface.dlgPasteNode(newPos.toObject(), {
            node: node,
            flow: nodesToCopy.flow
          });
        }
      })();
    }
  };

  onArrowKeys = event => {
    const currentZoom = lodash.get(this.canvas.currentZoom, "k", 1);
    const step = 2 / currentZoom + 1;
    const delta = {
      ArrowRight: [1 * step, 0],
      ArrowLeft: [-1 * step, 0],
      ArrowUp: [0, -1 * step],
      ArrowDown: [0, 1 * step]
    };
    const [dx, dy] = delta[event.code];
    const [x, y] = [50, 50]; // skip boundaries validation used when dragging a node

    this.mainInterface.graph.onNodeDrag(null, { x, y, dx, dy });
    this.mainInterface.onDragEnd();
  };

  onZoomReset = e => {
    this.canvas
      .getSvg()
      .transition()
      .duration(750)
      .call(this.canvas.zoomBehavior.transform, d3.zoomIdentity);
  };

  onSetDefault = () => {
    this.mainInterface.setMode("default", null, true);
  };

  onRandomFocus = () => {
    const entries = Array.from(this.mainInterface.graph.nodes.entries());
    const r_index = Math.floor(Math.random() * entries.length);
    const node = entries[r_index][1].obj;
    const svg = this.canvas.getSvg();
    const { xCenter, yCenter } = node.center;
    this.mainInterface.setMode("default", null, true);
    node.selected = true;

    if (node.data.id !== "start") {
      this.mainInterface.setMode(
        "selectNode",
        { node: node, shiftKey: false },
        true
      );
    }
    svg
      .transition()
      .duration(2500)
      .call(this.canvas.zoomBehavior.translateTo, xCenter, yCenter);
  };
}
