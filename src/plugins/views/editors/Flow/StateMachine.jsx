import React, { Component } from "react";
import PropTypes from "prop-types";
import BaseFlow from "./Views/BaseFlow";
import { MasterDB } from "@mov-ai/mov-fe-lib-core";

import MasterComponent from "../MasterComponent/MasterComponent";
import LNodesMenu from "./Components/Menus/LNodesMenu";
import RMainMenu from "./Components/Menus/RMainMenu";
import RStateMenu from "./Components/Menus/RStateMenu";
import ContextMenu from "./Components/Menus/ContextMenu";

import {
  handleDocumentCreationError,
  validateDocumentName
} from "../_shared/Utils/Utils";
import NewWidgetModal from "../_shared/Modal/NewWidgetModal";

import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";
import { withStyles } from "@material-ui/core/styles";
import Editor, { EXTENSION } from "../Editor/Editor";
import { SCOPES } from "../_shared/constants";

const styles = theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff"
  }
});

class StateMachine extends Component {
  model = "StateMachine";
  type = "sm";
  shouldRenderMenus = true;
  RStateMenuRendered = false;
  _baseFlow = React.createRef();
  nodeContextMenu = React.createRef();
  canvasContextMenu = React.createRef();
  linkContextMenu = React.createRef();

  //========================================================================================
  /*                                                                                      *
   *                                    React lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  componentDidUpdate(prevProps) {
    // updateId = -1 => request to open tab whitout selecting it
    if (
      this.props.updateId !== prevProps.updateId &&
      this.props.updateId !== -1
    ) {
      this.shouldRenderMenus = true;
    }
    this.renderMenus();
    this.setMode("default", {}, true);
  }

  //========================================================================================
  /*                                                                                      *
   *                             Properties, Setters, Getters                             *
   *                                                                                      */
  //========================================================================================

  get baseFlow() {
    return this._baseFlow.current;
  }

  get mainInterface() {
    return this.baseFlow.mainInterface;
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
    this.setMode("addState", node_id, true);
  };

  addRMainMenu = () => {
    MasterComponent.addRightContextMenu(
      this.props.label,
      <RMainMenu
        type={this.type}
        uid={this.props.id}
        _layers={{}}
        setLayersOn={() => {}}
        workspace={this.props.workspace}
        name={this.props.name}
        version={this.props.version}
      />,
      SCOPES.StateMachine
    );
  };

  addRStateMenu = state => {
    MasterComponent.addRightContextMenu(
      state.stateLabel,
      <RStateMenu
        flowName={this.props.id}
        state={state}
        nodeInstName={state.name}
        parent={this.props}
        //openFlow={data => this.openFlow(data)}
      />,
      SCOPES.StateMachine
    );
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  onNodeSelected = node => {
    if (this.shouldRenderMenus || (!this.RStateMenuRendered && !node)) return;
    this.RStateMenuRendered = node;
    node ? this.addRStateMenu(node) : this.addRMainMenu();
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  renderMenus = () => {
    // updateId = -1 => request to open tab whitout selecting it
    if (this.props.updateId !== -1) {
      // add initial right menu
      this.addRMainMenu();

      if (this.shouldRenderMenus) {
        this.shouldRenderMenus = false;

        const { id, name } = this.props;

        // add left menu
        MasterComponent.addLeftContextMenu([
          <LNodesMenu
            icon={<i className="fab fa-wpforms" />}
            addNodeToCanvas={node_id => this.addNodeToCanvas(node_id)}
            addFlowToCanvas={() => {}}
            parentType={this.type}
            parentId={id}
            parentLabel={name}
          />
        ]);

        MasterComponent.selectLeftContextMenu(1);
      }
    }
  };

  render() {
    this.renderMenus();
    const readOnly = !this.props.editable;
    return (
      <React.Fragment>
        <BaseFlow
          {...this.props}
          ref={this._baseFlow}
          model={this.model}
          openFlow={data => this.openFlow(data)}
          cls={StateMachine}
          type={this.type}
          nodeContextMenu={this.nodeContextMenu}
          canvasContextMenu={this.canvasContextMenu}
          linkContextMenu={this.linkContextMenu}
          portContextMenu={this.portContextMenu}
          onNodeSelected={node => this.onNodeSelected(node)}
          readOnly={readOnly}
        ></BaseFlow>
        <ContextMenu ref={this.nodeContextMenu}>
          <MenuItem onClick={node => this.baseFlow.addNodeToClipboard(node)}>
            Copy
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={node => this.baseFlow.deleteNode(node)}
            disabled={readOnly}
          >
            Delete
          </MenuItem>
        </ContextMenu>
        <ContextMenu ref={this.canvasContextMenu}>
          <MenuItem
            onClick={data => this.baseFlow.pasteNode(data)}
            disabled={readOnly}
          >
            Paste
          </MenuItem>
        </ContextMenu>
        <ContextMenu ref={this.linkContextMenu}>
          <MenuItem
            onClick={data => this.baseFlow.deleteLink(data)}
            disabled={readOnly}
          >
            Delete
          </MenuItem>
        </ContextMenu>
      </React.Fragment>
    );
  }

  static addNewSM() {
    MasterComponent.createNewApp(
      "New State Machine",
      widgetName => {
        if (!widgetName) {
          return;
        }
        let data_post = { Label: "" };
        data_post.Label = widgetName;
        MasterDB.post(
          "StateMachine",
          undefined,
          "",
          data_post,
          (data, status) => {
            if (data === undefined) {
              MasterComponent.alert(
                handleDocumentCreationError(status),
                MasterComponent.ALERTS.warning
              );
            } else {
              const menuObj = { id: data.name, name: data.name };
              MasterComponent.onItemClick(
                props => (
                  <Editor {...props} {...menuObj} scope="StateMachine"></Editor>
                ),
                menuObj.name + EXTENSION.StateMachine
              );
            }
          }
        );
      },
      NewWidgetModal.WrappedComponent.defaultProps.onCancel,
      value => validateDocumentName(value)
    );
  }

  static EXTENSION = ".sm";
}

StateMachine.propTypes = {
  fetching: PropTypes.bool,
  updateId: PropTypes.number, // TODO: check if is required
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  editable: PropTypes.bool,
  workspace: PropTypes.string,
  version: PropTypes.string
};

StateMachine.defaultProps = {
  fetching: false,
  editable: true,
  workspace: "global",
  version: "-"
};

export default withStyles(styles, { withTheme: true })(StateMachine);
