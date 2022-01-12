import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import InfoIcon from "@material-ui/icons/Info";
import BaseFlow from "./Views/BaseFlow";
import Menu from "../Configuration/Menu";
import FlowTopBar from "./Components/FlowTopBar/FlowTopBar";
import FlowBottomBar from "./Components/FlowBottomBar/FlowBottomBar";
import "./Resources/css/Flow.css";

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
  // Other Hooks
  const classes = useStyles();
  // Refs
  const baseFlowRef = React.useRef();
  const mainInterfaceRef = React.useRef();

  //========================================================================================
  /*                                                                                      *
   *                               Right menu initialization                              *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = React.useCallback(() => {
    const details = props.data?.details || {};
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: (
          <Menu id={id} name={name} details={details} model={instance}></Menu>
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
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * On Robot selection change
   * @param {*} robotId
   */
  const onRobotChange = React.useCallback(robotId => {
    setRobotSelected(robotId);
  }, []);

  /**
   * On change running flow
   * @param {*} flow
   */
  const onStartStopFlow = React.useCallback(flow => {
    // Update state variable
    setRunningFlow(prevState => {
      if (prevState === flow) return prevState;
      return flow;
    });
  }, []);

  /**
   * On flow validation
   * @param {*} validationWarnings
   */
  const onFlowValidated = React.useCallback(validationWarnings => {
    setWarnings(validationWarnings);
  }, []);

  /**
   * Open document in new tab
   * @param {*} docData
   */
  const openDoc = React.useCallback(
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
   * Toggle Warnings
   * @param {boolean} isVisible
   */
  const onToggleWarnings = React.useCallback(isVisible => {
    mainInterfaceRef.current.onToggleWarnings({ data: isVisible });
  }, []);

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
          version={instance.current?.version}
          mainInterface={mainInterfaceRef}
          onRobotChange={onRobotChange}
          onStartStopFlow={onStartStopFlow}
          openFlow={openDoc}
          // nodeStatusUpdated={this.onNodeStatusUpdate}
          // nodeCompleteStatusUpdated={this.onMonitoringNodeStatusUpdate}
          // onViewModeChange={this.onViewModeChange}
        ></FlowTopBar>
      </div>
      <BaseFlow
        {...props}
        ref={baseFlowRef}
        dataFromDB={dataFromDB}
        onFlowValidated={onFlowValidated}
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
