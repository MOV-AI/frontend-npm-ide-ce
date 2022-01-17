import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactResizeDetector from "react-resize-detector";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import lodash from "lodash";
import { filter } from "rxjs/operators";
import "../Resources/css/Flow.css";

// import MasterComponent from "../../MasterComponent/MasterComponent";

import Warnings from "../Components/Warnings/Warnings";
import Tooltip from "../Components/Tooltips/Tooltip";

import MainInterface from "../Components/interface/MainInterface";
// import TopicsDebug from "../../TopicsDebug/TopicsDebug";
import Graph from "../Core/Graph/GraphBase";
import Vec2 from "../Utils/Vec2";
import FlowTooltip from "../Components/Tooltips/FlowTooltip";

class BaseFlow extends Component {
  state = {
    loading: true,
    width: 0,
    height: 0,
    warnings: [],
    Layers: {},
    User: "",
    LastUpdate: "",
    Description: "",
    Parameter: {}
  };
  id = this.props.id;
  type = this.props.type || "flow";
  mainInterface = null;
  model = this.props.model;

  container = React.createRef();
  tooltip = React.createRef();
  flowTooltip = React.createRef();
  warnings = React.createRef();

  containerId = `base-${Math.floor(Math.random() * 9999)}`;

  componentDidMount() {
    this.mainInterface = new MainInterface(
      //this,
      this.id,
      this.type,
      this.state.width,
      this.state.height,
      this.container,
      this.model,
      this.props.readOnly,
      this.props.workspace,
      this.props.version,
      (_interface, _canvas, _uid) => new Graph(_interface, _canvas, _uid)
    );
    this.mainInterface.onStateChange(state => this.onMainInit(state));
  }

  componentWillUnmount() {
    this.mainInterface.destroy();
  }

  componentDidUpdate(prevProps, prevState) {
    // reload canvas on change theme
    const changeTheme = !lodash.isEqual(prevProps.classes, this.props.classes);
    if (changeTheme) this.mainInterface.canvas.reload();
  }

  onDocChange(key, value) {
    this.mainInterface.setDocument(key, value);
    this.props.updateRMainMenu();
  }

  get clipboard() {
    return this.mainInterface.api.clipboard;
  }

  set clipboard(value) {
    this.mainInterface.api.clipboard = value;
  }

  onMainInit = state => {
    if (state !== 1) return;
    this.mainInterface.graph.onFlowValidated.subscribe(warnings => {
      const persistentWarns = warnings.warnings.filter(el => el.isPersistent);
      this.props.onFlowValidated({ warnings: persistentWarns });
      this.setState({ warnings: persistentWarns });
    });

    // Render right menu when finish loading
    this.mainInterface.mode.loading.onExit.subscribe(() => {
      this.props.renderRMenu();
    });

    this.mainInterface.mode.selectNode.onEnter.subscribe(data => {
      const selectedNodes = this.mainInterface.selectedNodes;
      const node = selectedNodes.length !== 1 ? null : selectedNodes[0];
      this.props.onNodeSelected(node);
    });

    this.mainInterface.mode.default.onEnter.subscribe(data => {
      if (data && data.event === "onMouseDown") return;
      this.props.onNodeSelected(null);
      this.props.onLinkSelected(null);
    });

    this.mainInterface.mode.addNode.onEnter.subscribe(data => {
      this.props.onNodeSelected(null);
    });

    this.mainInterface.mode.onDblClick.onEnter.subscribe(data => {
      this.props.onDblClick(data);
    });

    this.mainInterface.canvas.events
      .pipe(filter(event => event.name === "onClick" && event.type === "Link"))
      .subscribe(event => this.props.onLinkSelected(event));

    this.mainInterface.canvas.events
      .pipe(
        filter(event => event.name === "onMouseOver" && event.type === "Link")
      )
      .subscribe(event => this.mainInterface.graph.onMouseOverLink(event));

    this.mainInterface.canvas.events
      .pipe(
        filter(event => event.name === "onMouseOut" && event.type === "Link")
      )
      .subscribe(event => this.mainInterface.graph.onMouseOutLink(event));

    this.mainInterface.canvas.events
      .pipe(filter(event => event.name === "onToggleWarnings"))
      .subscribe(event => this.onToggleWarnings(event));
  };

  reload = () => {
    this.mainInterface.reload();
  };

  onResize = (w, h) => {
    this.setState({ width: w, height: h });
  };

  deleteNode(node) {
    // const { t } = this.props;
    // MasterComponent.confirmAlert(
    //   `${t("Delete")} ${t("Node")}`,
    //   `${t("Are you sure you want to delete")} "${node.name}"?`,
    //   () => this.mainInterface.api.deleteNode(node),
    //   () => {}
    // );
  }

  addNodeToClipboard = node => {
    const selectedNodesSet = new Set(
      [node.node].concat(this.mainInterface.selectedNodes)
    );
    const selectedNodes = Array.from(selectedNodesSet);
    const nodesPos = selectedNodes.map(n =>
      Vec2.of(n.center.xCenter, n.center.yCenter)
    );
    let center = nodesPos.reduce((e, x) => e.add(x), Vec2.ZERO);
    center = center.scale(1 / selectedNodes.length);
    this.clipboard = {
      nodesToCopy: {
        nodes: selectedNodes.map(n => n.data),
        flow: this.props.id,
        nodesPosFromCenter: nodesPos.map(pos => pos.sub(center))
      }
    };
  };

  debugNode = node => {
    this.props.renderRDebugNodeMenu(node);
  };

  pasteNode = position => {
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
          const newPos = Vec2.of(position.x, position.y).add(
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

  deleteLink = data => {
    this.mainInterface.api.deleteLink(data.linkId);
  };

  debugTopic = data => {
    // TODO
  };

  toggleExposed = data => {
    this.mainInterface.api.toggleExposed(data);
  };

  addRightMenu(name, children) {
    //MasterComponent.addRightContextMenu(name, children, SCOPES.Flow);
  }

  render() {
    const { classes, id } = this.props;
    const { loading } = this.state;
    return (
      <div id={`flow-main-${id}`} className={classes.flowContainer}>
        {loading && (
          <Backdrop className={classes.backdrop} open={loading}>
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
        <div
          style={{
            width: "100%",
            height: "100%",
            flexGrow: 1
          }}
          id={this.containerId}
          ref={this.container}
          tagindex="0"
        >
          {!loading && (
            <>
              <ReactResizeDetector
                handleWidth
                handleHeight
                onResize={this.onResize}
              />
              {this.container.current && (
                <React.Fragment>
                  <Warnings
                    ref={this.warnings}
                    warnings={this.state.warnings}
                    domNode={this.container}
                  />
                  <Tooltip ref={this.tooltip} domNode={this.container} />
                  <FlowTooltip
                    ref={this.flowTooltip}
                    domNode={this.container}
                  />
                </React.Fragment>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}

BaseFlow.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  nodeContextMenu: PropTypes.object,
  canvasContextMenu: PropTypes.object,
  linkContextMenu: PropTypes.object,
  portContextMenu: PropTypes.object,
  onNodeSelected: PropTypes.func,
  onLinkSelected: PropTypes.func,
  onDblClick: PropTypes.func,
  updateRMainMenu: PropTypes.func,
  model: PropTypes.string,
  readOnly: PropTypes.bool,
  workspace: PropTypes.string,
  version: PropTypes.string
};

BaseFlow.defaultProps = {
  type: "flow",
  nodeContextMenu: {},
  canvasContextMenu: {},
  linkContextMenu: {},
  portContextMenu: {},
  onNodeSelected: () => {},
  onLinkSelected: () => {},
  onDblClick: () => {},
  updateRMainMenu: () => {},
  model: "Flow",
  readOnly: false,
  workspace: "global",
  version: "__UNVERSIONED__"
};

export default BaseFlow;
