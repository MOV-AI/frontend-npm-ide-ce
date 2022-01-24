import React, { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import useMainInterface from "./hooks/useMainInterface";
import styles from "./styles";
import Loader from "../../_shared/Loader/Loader";
import { usePluginMethods } from "../../../../../engine/ReactPlugin/ViewReactPlugin";

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

  const containerId = useMemo(() => `base-${id.replace(/\//g, "-")}`, [id]);

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

  useEffect(() => {
    on("FlowExplorer", "addNode", node => {
      const scopes = {
        Node: "addNode",
        Flow: "addFlow"
      };
      const templateId = node.name;
      getMainInterface()?.setMode(scopes[node.scope], { templateId }, true);
    });

    return () => off("FlowExplorer", "addNode");
  }, [getMainInterface, off, on]);

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
      <div
        style={{
          width: "100%",
          height: "100%",
          flexGrow: 1
        }}
        id={containerId}
        tagindex="0"
      ></div>
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
