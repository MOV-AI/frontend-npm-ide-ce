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
  const { id, call, scope, name, instance, data, alert } = props;
  // State Hooks
  const [dataFromDB, setDataFromDB] = useState();
  // Other Hooks
  const classes = useStyles();

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

  useEffect(() => {
    if (instance.current) {
      console.log("debug plugin instance", data);
      const _data = instance.current.serializeToDB();
      setDataFromDB(_data);
    }
  }, [instance, data]);

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
          scope={scope}
          // defaultViewMode={viewMode}
          // nodeStatusUpdated={this.onNodeStatusUpdate}
          // nodeCompleteStatusUpdated={this.onMonitoringNodeStatusUpdate}
          // onStartStopFlow={this.onStartStopFlow}
          // onViewModeChange={this.onViewModeChange}
          // onRobotChange={this.onRobotChange}
          // openFlow={data => this.openDoc(data)}
          // interfaceMode={this.mainInterface?.mode?.mode}
          // graph={this.mainInterface?.graph}
          // warnings={warnings}
          // workspace={workspace}
          // type={model}
          // version={version}
        ></FlowTopBar>
      </div>
      <BaseFlow {...props} id={id} dataFromDB={dataFromDB} />
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
