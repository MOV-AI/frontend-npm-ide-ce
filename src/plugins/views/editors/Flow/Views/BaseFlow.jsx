import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import { usePluginMethods } from "../../../../../engine/ReactPlugin/ViewReactPlugin";
import Loader from "../../_shared/Loader/Loader";
import { generateContainerId } from "../Constants/constants";
import useMainInterface from "./hooks/useMainInterface";
import styles from "./styles";

const useStyles = makeStyles(styles);

const BaseFlow = React.forwardRef((props, ref) => {
  const classes = useStyles(props);
  const {
    call,
    instance,
    id,
    name,
    type,
    model,
    dataFromDB,
    off,
    on,
    onNodeSelected,
    onReady
  } = props;
  const readOnly = false;

  // State Hooks
  const [loading, setLoading] = useState(true);

  const containerId = useMemo(() => generateContainerId(id), [id]);

  const { mainInterface } = useMainInterface({
    classes,
    instance,
    name,
    data: dataFromDB,
    type,
    width: "400px",
    height: "200px",
    containerId,
    model,
    readOnly,
    call
  });

  const getMainInterface = useCallback(() => {
    return mainInterface.current;
  }, [mainInterface]);

  // Enter in add node/sub-flow mode
  useEffect(() => {
    on("FlowExplorer", "addNode", node => {
      const scopes = {
        Node: "addNode",
        Flow: "addFlow"
      };
      const templateId = node.name;
      // If user tries to add the flow as a sub-flow to itself,
      //  it's considered a forbidden operation
      if (dataFromDB.Label === templateId) return;
      // Add interface mode to add node/sub-flow
      getMainInterface()?.setMode(scopes[node.scope], { templateId }, true);
    });

    return () => off("FlowExplorer", "addNode");
  }, [getMainInterface, off, on, dataFromDB]);

  useEffect(() => {
    const mInt = getMainInterface();
    if (!mInt) return;

    // Subscribe to on loading exit (finish) event
    mInt.mode.loading.onExit.subscribe(() => {
      setLoading(false);
    });

    // Dispatch on ready event
    onReady(mInt);
  }, [getMainInterface, dataFromDB, onNodeSelected, onReady]);

  usePluginMethods(ref, { mainInterface });

  return (
    <div id={`flow-main-${id}`} className={classes.flowContainer}>
      {loading && (
        <Backdrop className={classes.backdrop} open={loading}>
          <Loader />
        </Backdrop>
      )}
      <div className={classes.flowCanvas} id={containerId} tagindex="0"></div>
    </div>
  );
});

BaseFlow.propTypes = {
  call: PropTypes.func.isRequired,
  instance: PropTypes.object,
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  model: PropTypes.string,
  dataFromDB: PropTypes.object
};

BaseFlow.defaultProps = {
  onReady: () => console.warning("On ready prop not received")
};

export default BaseFlow;
