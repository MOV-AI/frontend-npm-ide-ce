import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback
} from "react";
import PropTypes from "prop-types";
import Backdrop from "@material-ui/core/Backdrop";
import { makeStyles } from "@material-ui/core/styles";
import { usePluginMethods } from "../../../../../engine/ReactPlugin/ViewReactPlugin";
import { generateContainerId } from "../Constants/constants";
import { EVT_NAMES } from "../events";
import Loader from "../../_shared/Loader/Loader";
import Warnings from "../Components/Warnings/Warnings";
import useMainInterface from "./hooks/useMainInterface";
import { PLUGINS } from "../../../../../utils/Constants";
import styles from "./styles";

const useStyles = makeStyles(styles);

const BaseFlow = React.forwardRef((props, ref) => {
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
    warnings,
    warningsVisibility,
    onReady
  } = props;
  const readOnly = false;

  // State Hooks
  const [loading, setLoading] = useState(true);

  const containerId = useMemo(() => generateContainerId(id), [id]);

  // Refs
  const warningsRef = useRef();
  const containerRef = useRef();
  // Other hooks
  const classes = useStyles(props);

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
    on(PLUGINS.FLOW_EXPLORER.NAME, PLUGINS.FLOW_EXPLORER.ON.ADD_NODE, node => {
      // event emitter is latching thus we need to skip
      // it while flow is loading
      const currMode = getMainInterface()?.mode.current.id ?? EVT_NAMES.LOADING;
      if (currMode === EVT_NAMES.LOADING) return;

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

    return () =>
      off(PLUGINS.FLOW_EXPLORER.NAME, PLUGINS.FLOW_EXPLORER.ON.ADD_NODE);
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

  // On before unmount
  useEffect(() => {
    return () => getMainInterface().graph.destroy();
  }, [getMainInterface]);

  usePluginMethods(ref, { mainInterface });

  return (
    <div id={`flow-main-${id}`} className={classes.flowContainer}>
      {loading && (
        <Backdrop className={classes.backdrop} open={loading}>
          <Loader />
        </Backdrop>
      )}
      <div
        className={classes.flowCanvas}
        ref={containerRef}
        id={containerId}
        tagindex="0"
      >
        <React.Fragment>
          <Warnings
            ref={warningsRef}
            warnings={warnings}
            isVisible={warningsVisibility}
            domNode={containerRef}
          />
        </React.Fragment>
      </div>
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
