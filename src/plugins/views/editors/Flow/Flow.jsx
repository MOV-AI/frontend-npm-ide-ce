import React, { useEffect, useState, useCallback } from "react";
import { filter } from "rxjs/operators";
import { makeStyles } from "@material-ui/core/styles";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import { FLOW_VIEW_MODE } from "./Constants/constants";
import InfoIcon from "@material-ui/icons/Info";
import BaseFlow from "./Views/BaseFlow";
import Menu from "./Components/Menus/Menu";
import NodeMenu from "./Components/Menus/NodeMenu";
import FlowTopBar from "./Components/FlowTopBar/FlowTopBar";
import FlowBottomBar from "./Components/FlowBottomBar/FlowBottomBar";
import "./Resources/css/Flow.css";
import { EVT_NAMES, EVT_TYPES } from "./events";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    height: "100%",
    flexGrow: 1
  }
}));

const Flow = (props, ref) => {
  // Props
  const { id, call, scope, name, instance, data, alert, confirmationAlert } =
    props;
  // State Hooks
  const [dataFromDB, setDataFromDB] = useState();
  const [robotSelected, setRobotSelected] = useState("");
  const [runningFlow, setRunningFlow] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [viewMode, setViewMode] = useState(FLOW_VIEW_MODE.default);
  // Other Hooks
  const classes = useStyles();
  // Refs
  const baseFlowRef = React.useRef();
  const mainInterfaceRef = React.useRef();
  const isEditableComponentRef = React.useRef(true);

  //========================================================================================
  /*                                                                                      *
   *                               Right menu initialization                              *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = useCallback(() => {
    const details = props.data?.details || {};
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: (
          <Menu
            id={id}
            name={name}
            details={details}
            model={instance}
            editable={isEditableComponentRef.current}
          ></Menu>
        )
      }
    });
  }, [call, id, name, instance, props.data]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Initialize data
   */
  useEffect(() => {
    const model = instance.current;

    if (model) {
      setDataFromDB(model.serializeToDB());
    }
  }, [instance, data]);

  /**
   * Initialize main interface
   */
  useEffect(() => {
    mainInterfaceRef.current = baseFlowRef.current?.mainInterface;
  }, [baseFlowRef.current?.mainInterface]);

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get main interface instance
   */
  const getMainInterface = () => {
    return mainInterfaceRef.current?.current;
  };

  /**
   * Set mode
   * @param {string} mode : Interface mode
   */
  const setMode = useCallback(mode => {
    getMainInterface().setMode(mode);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * On Robot selection change
   * @param {*} robotId
   */
  const onRobotChange = useCallback(robotId => {
    setRobotSelected(robotId);
  }, []);

  /**
   * On change running flow
   * @param {*} flow
   */
  const onStartStopFlow = useCallback(flow => {
    // Update state variable
    setRunningFlow(prevState => {
      if (prevState === flow) return prevState;
      return flow;
    });
  }, []);

  /**
   * Open document in new tab
   * @param {*} docData
   */
  const openDoc = useCallback(
    docData => {
      call("docManager", "read", {
        scope: docData.type,
        name: docData.name
      }).then(doc => {
        call("tabs", "openEditor", {
          id: doc.getUrl(),
          name: doc.getName(),
          scope: doc.getScope()
        });
      });
    },
    [call]
  );

  /**
   * On view mode change
   * @param {string} newViewMode : One of the following "default" or "treeView"
   */
  const onViewModeChange = useCallback(
    newViewMode => {
      setViewMode(prevState => {
        if (prevState === newViewMode) return prevState;
        isEditableComponentRef.current = newViewMode === FLOW_VIEW_MODE.default;
        // Set mode loading after changing view mode
        setMode("loading");
        return newViewMode;
      });
    },
    [setMode]
  );

  /**
   * Toggle Warnings
   * @param {boolean} isVisible
   */
  const onToggleWarnings = useCallback(isVisible => {
    getMainInterface()?.onToggleWarnings({ data: isVisible });
  }, []);

  /**
   * Update node active status
   * @param {object} nodeStatus : Nodes to update status
   * @param {{activeFlow: string, isOnline: boolean}} robotStatus : Robot current status
   */
  const onNodeStatusUpdate = useCallback((nodeStatus, robotStatus) => {
    getMainInterface()?.nodeStatusUpdated(nodeStatus, robotStatus);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                  Handle Flow Events                                  *
   *                                                                                      */
  //========================================================================================

  /**
   * On flow validation
   * @param {*} validationWarnings
   */
  const onFlowValidated = useCallback(validationWarnings => {
    console.log("TODO: fix warnings", validationWarnings);
    setWarnings(validationWarnings);
  }, []);

  /**
   * On Node Selected
   * @param {*} node
   */
  const onNodeSelected = useCallback(
    node => {
      const nodeMenuName = `${id}-node-menu`;
      if (!node) call("rightDrawer", "removeBookmark", nodeMenuName);
      else {
        call(
          "rightDrawer",
          "addBookmark",
          {
            icon: <i className="icon-Nodes" />,
            name: nodeMenuName,
            view: (
              <NodeMenu
                id={id}
                name={name}
                nodeInst={node}
                model={instance}
                editable={isEditableComponentRef.current}
              ></NodeMenu>
            )
          },
          true
        );
      }
    },
    [call, id, instance, name]
  );

  /**
   * Subscribe to mainInterface and canvas events
   */
  const onReady = useCallback(
    mainInterface => {
      // Subscribe to on node select event
      mainInterface.mode.selectNode.onEnter.subscribe(() => {
        const selectedNodes = mainInterface.selectedNodes;
        const node = selectedNodes.length !== 1 ? null : selectedNodes[0];
        onNodeSelected(node);
      });

      // Subscribe to flow validations
      mainInterface.graph.onFlowValidated.subscribe(evtData => {
        const persistentWarns = evtData.warnings.filter(el => el.isPersistent);
        onFlowValidated({ warnings: persistentWarns });
      });

      // When enter default mode remove other node/sub-flow bookmarks
      mainInterface.mode.default.onEnter.subscribe(() => {
        onNodeSelected(null);
      });

      mainInterface.mode.addNode.onClick.subscribe(evtData =>
        console.log("dlgNewNode", evtData)
      );
      mainInterface.mode.addFlow.onClick.subscribe(evtData =>
        console.log("dlgNewFlow", evtData)
      );
      mainInterface.mode.nodeCtxMenu.onEnter.subscribe(evtData =>
        console.log("onNodeCtxMenu", evtData)
      );
      mainInterface.mode.canvasCtxMenu.onEnter.subscribe(evtData =>
        console.log("onCanvasCtxMenu", evtData)
      );
      mainInterface.mode.linkCtxMenu.onEnter.subscribe(evtData =>
        console.log("onLinkCtxMenu", evtData)
      );
      mainInterface.mode.portCtxMenu.onEnter.subscribe(evtData =>
        console.log("onPortCtxMenu", evtData)
      );
      mainInterface.events.onAddLink.subscribe(evtData =>
        alert({
          location: "snackbar",
          message: "Link created"
        })
      );

      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_MOUSE_OVER &&
              event.type === EVT_TYPES.LINK
          )
        )
        .subscribe(evtData => mainInterface.graph.onMouseOverLink(evtData));

      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_MOUSE_OUT &&
              event.type === EVT_TYPES.LINK
          )
        )
        .subscribe(evtData => mainInterface.graph.onMouseOutLink(evtData));

      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_MOUSE_OVER &&
              event.type === EVT_TYPES.PORT
          )
        )
        .subscribe(evtData => console.log("onPortMouseOver", evtData));

      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_MOUSE_OUT &&
              event.type === EVT_TYPES.PORT
          )
        )
        .subscribe(evtData => console.log("onPortMouseOver", evtData));

      mainInterface.canvas.events
        .pipe(
          filter(
            event =>
              event.name === EVT_NAMES.ON_CHG_MOUSE_OVER &&
              event.type === EVT_TYPES.LINK
          )
        )
        .subscribe(evtData => console.log("onLinkErrorMouseOver", evtData));
    },
    [onNodeSelected, onFlowValidated, alert]
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div className={classes.root}>
      <div id="flow-top-bar">
        <FlowTopBar
          id={id}
          call={call}
          alert={alert}
          confirmationAlert={confirmationAlert}
          scope={scope}
          warnings={warnings}
          defaultViewMode={viewMode}
          version={instance.current?.version}
          mainInterface={mainInterfaceRef}
          openFlow={openDoc}
          onRobotChange={onRobotChange}
          onStartStopFlow={onStartStopFlow}
          nodeStatusUpdated={onNodeStatusUpdate}
          onViewModeChange={onViewModeChange}
          onReady={onReady}
          // nodeCompleteStatusUpdated={this.onMonitoringNodeStatusUpdate}
        ></FlowTopBar>
      </div>
      <BaseFlow
        {...props}
        ref={baseFlowRef}
        dataFromDB={dataFromDB}
        onReady={onReady}
      />
      <FlowBottomBar
        openFlow={openDoc}
        onToggleWarnings={onToggleWarnings}
        robotSelected={robotSelected}
        runningFlow={runningFlow}
        warnings={warnings}
      />
    </div>
  );
};

Flow.defaultProps = {
  name: "a6"
};

export default withEditorPlugin(Flow);
