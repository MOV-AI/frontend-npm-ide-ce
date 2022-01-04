import React, { Component } from "react";
import PropTypes from "prop-types";
import { Document } from "@mov-ai/mov-fe-lib-core";
//import Monitoring from "./Views/Monitoring";
import BaseFlow from "./Views/BaseFlow";
// import LNodesMenu from "./Components/Menus/LNodesMenu";
// import RMainMenu from "./Components/Menus/RMainMenu";
// import RLinkMenu from "./Components/Menus/RLinkMenu";
// import RNodeMenu from "./Components/Menus/RNodeMenu";
// import RContainerMenu from "./Components/Menus/RContainerMenu";
// import RDebugNodeMenu from "./Components/Menus/RDebugNodeMenu";
import ContextMenu from "./Components/Menus/ContextMenu";
// import FlowTopBar from "./Components/flowTopBar/FlowTopBar";
// import FlowBottomBar from "./Components/FlowBottomBar/FlowBottomBar";

import { FLOW_VIEW_MODE } from "./Constants/constants";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import { withStyles } from "@material-ui/core/styles";
import { withTranslation } from "react-i18next";

const styles = theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.backdrop.color,
    backgroundColor: theme.backdrop.background,
    position: "absolute",
    height: "100%",
    width: "100%"
  },
  flowContainer: {
    height: "calc(100% - 75px)",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative"
  }
});

class Flow extends Component {
  state = {
    viewMode: FLOW_VIEW_MODE.default,
    robotSelected: "Default",
    portHasCallback: true,
    runningFlow: null,
    warnings: [],
    monitoringNodeOptions: {
      start: true,
      stop: true,
      startFlow: null,
      stopFlow: null
    }
  };
  type = "flow";
  shouldRenderMenus = true;
  RNodeMenuRendered = false;
  RLinkMenuRendered = false;
  isEditableComponent = true;
  mainMenu = {};
  _baseFlow = React.createRef();
  _monitoring = React.createRef();
  nodeContextMenu = React.createRef();
  canvasContextMenu = React.createRef();
  linkContextMenu = React.createRef();
  portContextMenu = React.createRef();

  //========================================================================================
  /*                                                                                      *
   *                                    React lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  componentDidUpdate(prevProps) {
    // updateId = -1 => request to open tab without selecting it
    if (
      this.props.updateId !== prevProps.updateId &&
      this.props.updateId !== -1
    ) {
      this.shouldRenderMenus = true;
      this.renderMenus();
      this.setMode("default", {}, true);
    }
  }

  //========================================================================================
  /*                                                                                      *
   *                             Properties, Setters, Getters                             *
   *                                                                                      */
  //========================================================================================

  get baseFlow() {
    return this._baseFlow.current;
  }

  get monitoring() {
    return this._monitoring.current;
  }

  get mainInterface() {
    if (this.baseFlow) return this.baseFlow.mainInterface;
    return this.monitoring?.interface;
  }

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  setMode = (mode, props, force) => {
    this.mainInterface.setMode(mode, props, force);
  };

  addNodeToCanvas = node_id => {
    if (!node_id || !this.props.editable) return;

    this.setMode("addNode", node_id, true);
  };

  addFlowToCanvas = flow_id => {
    if (!flow_id || !this.props.editable) return;

    this.setMode("addFlow", flow_id, true);
  };

  addRMainMenu = () => {
    const { editable } = this.props;

    this.mainMenuOpen = true;
    const layers = this.mainInterface?.document?.Layers || {};
    const user = this.mainInterface?.document?.LastUpdate?.user || "N/A";
    const lastDate = this.mainInterface?.document?.LastUpdate?.date || "N/A";
    const description = this.mainInterface?.document?.Description || "N/A";
    const parameters = this.mainInterface?.document?.Parameter || {};

    const { id, name, workspace, version } = this.props;
  };

  updateRMainMenu = () => {
    if (this.mainMenuOpen === true) {
      this.addRMainMenu();
    }
  };

  addRNodeMenu = node => {
    const { editable } = this.props;
    this.mainMenuOpen = false;
  };

  addRDebugNodeMenu = node => {
    const { editable } = this.props;
    this.mainMenuOpen = false;
    this.RNodeMenuRendered = false;
    // TODO: When click canvas, need to select mainmenu again
  };

  addRContainerMenu = container => {
    const { editable } = this.props;
    this.mainMenuOpen = false;
  };

  updateNodeContextMenu = () => {
    const node = this.mainInterface.mode.current.props.node;
    const nodeStatus = node.status;
    const nodeReady = node.isReady;
    const currentFlow = `${this.props.workspace}/${this.props.scope}/${this.props.id}/${this.props.version}`;
    const flowStatus = currentFlow === this.state.runningFlow && nodeReady;
    const { monitoringNodeOptions } = this.state;
    // Update state variable
    monitoringNodeOptions.start =
      node._type === "container" ? null : flowStatus && !nodeStatus;
    monitoringNodeOptions.stop =
      node._type === "container" ? null : flowStatus && nodeStatus;
    // TODO: Implement start/stop flow
    monitoringNodeOptions.startFlow = node._type === "container" ? false : null;
    monitoringNodeOptions.stopFlow = node._type === "container" ? false : null;
    this.setState({ monitoringNodeOptions });
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  onViewModeChange = viewMode => {
    this.setState({ viewMode });
    this.isEditableComponent = viewMode === FLOW_VIEW_MODE.default;
    // Set mode loading after changing view mode
    setImmediate(() => {
      this.setMode("loading");
      // Force update to show running flow in new component (BaseFlow or Monitoring)
      this.forceUpdate();
    });
  };

  onRobotChange = robot => {
    this.setState({ robotSelected: robot });
  };

  onFlowValidated = warnings => {
    this.setState(warnings);
  };

  onNodeSelected = node => {
    if (
      (this.shouldRenderMenus || (!this.RNodeMenuRendered && !node)) &&
      !this.RLinkMenuRendered
    )
      return;
    this.RNodeMenuRendered = node;
    this.RLinkMenuRendered = false;
    const menus = {
      NodeInst: data => this.addRNodeMenu(data),
      Container: data => this.addRContainerMenu(data)
    };

    node ? menus[node.data.type](node.data) : this.addRMainMenu();
  };

  onLinkSelected = event => {
    // updated selected link (or reset to null if any)
    this.mainInterface.selectedLink = event?.data || null;
    // The flow right menu should render when you click in canvas
    if (!event) return;
    const { id, name, editable } = this.props;
    this.shouldRenderMenus = false;
    this.RNodeMenuRendered = true;
    this.RLinkMenuRendered = true;
  };

  onDblClick = data => {
    const { node } = data;
    const args = Document.parsePath(node._template.url, node.data.model);

    node.data.type === "NodeInst"
      ? this.openDoc({
          ...args,
          id: node._template.name
        })
      : this.openDoc({ ...args, id: args.name });
  };

  setLayersOn = data => {
    this.mainInterface.onLayersChange(data);
  };

  onToggleWarnings = isVisible => {
    this.mainInterface.onToggleWarnings({ data: isVisible });
  };

  openCallback = (callbackName, ctrlKey) => {
    const data = Document.parsePath(callbackName, "Callback");
    this.openDoc({ ...data, id: data.name, ctrlKey });
  };

  setPortHasCallBack = bool => {
    this.setState({ portHasCallback: bool });
  };

  onNodeStatusUpdate = (node_status, robotStatus) => {
    if (this.baseFlow)
      this.baseFlow.mainInterface.nodeStatusUpdated(node_status, robotStatus);
  };

  onMonitoringNodeStatusUpdate = (node_status, robotStatus) => {
    if (this.monitoring)
      this.monitoring.interface.nodeStatusUpdated(node_status, robotStatus);
  };

  onStartStopFlow = flow => {
    const { runningFlow } = this.state;
    if (runningFlow && !flow && this.monitoring) this.monitoring.stopFlow();
    // Update state variable
    this.setState({ runningFlow: flow });
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  renderMenus = () => {
    const { editable } = this.props;
    // updateId = -1 => request to open tab without selecting it
    if (this.props.updateId !== -1) {
      // add initial right menu
      this.addRMainMenu();

      if (this.shouldRenderMenus) {
        this.shouldRenderMenus = false;

        const { id, name } = this.props;
      }
    }
  };

  _renderBaseFlow = () => {
    const { t } = this.props;
    const readOnly = !this.props.editable;
    return (
      <React.Fragment>
        <BaseFlow
          {...this.props}
          ref={this._baseFlow}
          type={this.type}
          nodeContextMenu={this.nodeContextMenu}
          canvasContextMenu={this.canvasContextMenu}
          linkContextMenu={this.linkContextMenu}
          portContextMenu={this.portContextMenu}
          onFlowValidated={warnings => this.onFlowValidated(warnings)}
          onNodeSelected={node => this.onNodeSelected(node)}
          onLinkSelected={event => this.onLinkSelected(event)}
          onDblClick={node => this.onDblClick(node)}
          updateRMainMenu={() => this.updateRMainMenu()}
          renderRMenu={() => this.renderMenus()}
          renderRDebugNodeMenu={this.addRDebugNodeMenu}
          readOnly={readOnly}
          setPortHasCallBack={this.setPortHasCallBack}
          t={this.props.t}
        ></BaseFlow>

        <ContextMenu ref={this.nodeContextMenu}>
          <MenuItem onClick={node => this.baseFlow.addNodeToClipboard(node)}>
            {t("Copy")}
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={node => this.baseFlow.deleteNode(node)}
            disabled={readOnly}
          >
            {t("Delete")}
          </MenuItem>
          <Divider />
          <MenuItem onClick={node => this.baseFlow.debugNode(node)}>
            {t("Debug")}
          </MenuItem>
        </ContextMenu>
        <ContextMenu ref={this.canvasContextMenu}>
          <MenuItem
            onClick={data => this.baseFlow.pasteNode(data)}
            disabled={readOnly}
          >
            {t("Paste")}
          </MenuItem>
        </ContextMenu>
        <ContextMenu ref={this.linkContextMenu}>
          <MenuItem
            onClick={data => this.baseFlow.deleteLink(data)}
            disabled={readOnly}
          >
            {t("Delete")}
          </MenuItem>
          <MenuItem onClick={data => this.baseFlow.debugTopic(data)}>
            {t("Debug")}
          </MenuItem>
        </ContextMenu>
        <ContextMenu ref={this.portContextMenu}>
          <MenuItem
            onClick={data => this.baseFlow.toggleExposed(data)}
            disabled={readOnly}
          >
            {t("Toggle Exposed")}
          </MenuItem>
          {this.state.portHasCallback ? (
            <MenuItem
              onClick={data => {
                this.openCallback(data.port.data.callback, data.event.ctrlKey);
              }}
            >
              {t("Open Callback")}
            </MenuItem>
          ) : (
            <></>
          )}
        </ContextMenu>
      </React.Fragment>
    );
  };

  renderBaseFlow() {
    return (
      <React.Fragment>
        <BaseFlow
          {...this.props}
          ref={this._baseFlow}
          type={this.type}
          // nodeContextMenu={this.nodeContextMenu}
          // canvasContextMenu={this.canvasContextMenu}
          // linkContextMenu={this.linkContextMenu}
          // portContextMenu={this.portContextMenu}
          // onFlowValidated={warnings => this.onFlowValidated(warnings)}
          // onNodeSelected={node => this.onNodeSelected(node)}
          // onLinkSelected={event => this.onLinkSelected(event)}
          // onDblClick={node => this.onDblClick(node)}
          // updateRMainMenu={() => this.updateRMainMenu()}
          // renderRMenu={() => this.renderMenus()}
          // renderRDebugNodeMenu={this.addRDebugNodeMenu}
          // readOnly={readOnly}
          // setPortHasCallBack={this.setPortHasCallBack}
          // t={this.props.t}
        ></BaseFlow>
      </React.Fragment>
    );
  }

  render() {
    const { viewMode, robotSelected, runningFlow, warnings } = this.state;
    const { workspace, model, id, version } = this.props;
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          flexGrow: 1
        }}
      >
        <div id="flow-top-bar">
          {/* <FlowTopBar
            defaultViewMode={viewMode}
            nodeStatusUpdated={this.onNodeStatusUpdate}
            nodeCompleteStatusUpdated={this.onMonitoringNodeStatusUpdate}
            onStartStopFlow={this.onStartStopFlow}
            onViewModeChange={this.onViewModeChange}
            onRobotChange={this.onRobotChange}
            openFlow={data => this.openDoc(data)}
            interfaceMode={this.mainInterface?.mode?.mode}
            graph={this.mainInterface?.graph}
            warnings={warnings}
            workspace={workspace}
            type={model}
            id={id}
            version={version}
          ></FlowTopBar> */}
        </div>
        {this.renderBaseFlow()}
        {/* <FlowBottomBar
          openFlow={data => this.openDoc(data)}
          onToggleWarnings={this.onToggleWarnings}
          robotSelected={robotSelected}
          runningFlow={runningFlow}
          warnings={warnings}
        /> */}
      </div>
    );
  }

  //========================================================================================
  /*                                                                                      *
   *                                         Utils                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Open a document
   *
   * @param {object} props Object with the required props for the Editor component
   *  props
   *    @param {string} id  The id of the document
   *    @param {string} workspace  The workspace where the document is
   *    @param {string} type  The scope of the document (Node, Flow)
   *    @param {string} name  The name of the document
   *    @param {string} version  The version to load ex.: 0.0.1
   *    @param {boolean} ctrlKey  If ctrl Key is pressed
   */
  openDoc = props => {
    const { type, workspace, name, version, ctrlKey } = props;
    // TODO: open document using tabs plugin
  };

  /**
   * Update container (sub-flow) parameters
   * @param {*} nodeId
   * @param {*} params
   */
  updateContainerParams = (nodeId, params) => {
    this.mainInterface.graph.updateContainerParams(nodeId, params);
  };
}

Flow.propTypes = {
  fetching: PropTypes.bool,
  updateId: PropTypes.number, // TODO: check if is required
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  editable: PropTypes.bool,
  workspace: PropTypes.string,
  version: PropTypes.string
};

Flow.defaultProps = {
  fetching: false,
  editable: true,
  workspace: "global",
  version: "__UNVERSIONED__"
};

export default withStyles(styles, { withTheme: true })(withTranslation()(Flow));
