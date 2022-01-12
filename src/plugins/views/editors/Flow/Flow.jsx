import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import InfoIcon from "@material-ui/icons/Info";
import BaseFlow from "./Views/BaseFlow";
import Menu from "../Configuration/Menu";
import FlowTopBar from "./Components/FlowTopBar/FlowTopBar";
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
          version={instance.current?.version}
          mainInterface={mainInterfaceRef}
          // nodeStatusUpdated={this.onNodeStatusUpdate}
          // nodeCompleteStatusUpdated={this.onMonitoringNodeStatusUpdate}
          // onStartStopFlow={this.onStartStopFlow}
          // onViewModeChange={this.onViewModeChange}
          // onRobotChange={this.onRobotChange}
          // openFlow={data => this.openDoc(data)}
          // warnings={warnings}
          // workspace={workspace}
          // type={model}
          // version={version}
        ></FlowTopBar>
      </div>
      <BaseFlow {...props} ref={baseFlowRef} dataFromDB={dataFromDB} />
      {/* <FlowBottomBar
          openFlow={data => this.openDoc(data)}
          onToggleWarnings={this.onToggleWarnings}
          robotSelected={robotSelected}
          runningFlow={runningFlow}
          warnings={warnings}
        /> */}
    </div>
  );
};

Flow.defaultProps = {
  name: "a6"
};

export default withEditorPlugin(Flow);
