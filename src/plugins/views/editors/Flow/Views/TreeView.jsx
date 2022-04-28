import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef
} from "react";
import PropTypes from "prop-types";
import Backdrop from "@material-ui/core/Backdrop";
import { usePluginMethods } from "../../../../../engine/ReactPlugin/ViewReactPlugin";
import { generateContainerId } from "../Constants/constants";
import { EVT_NAMES } from "../events";
import Loader from "../../_shared/Loader/Loader";
import Warnings from "../Components/Warnings/Warnings";
import useMainInterface from "./hooks/useMainInterface";
import { PLUGINS } from "../../../../../utils/Constants";
// import GraphTreeView from "../Core/Graph/GraphTreeView";

import { baseFlowStyles } from "./styles";

const TreeView = forwardRef((props, ref) => {
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
    warnings,
    warningsVisibility,
    onReady
  } = props;
  const readOnly = false;

  // State Hooks
  const [loading, setLoading] = useState(true);
  // Refs
  const containerRef = useRef();
  const isMountedRef = useRef(false);
  // Other hooks
  const classes = baseFlowStyles();
  const containerId = useMemo(() => generateContainerId(id), [id]);

  const { mainInterface } = useMainInterface({
    classes,
    instance,
    name,
    data: dataFromDB,
    // graphCls: GraphTreeView,
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

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    const mInterface = getMainInterface();
    console.log("debug getMainInterface", mInterface);
  }, [getMainInterface]);

  usePluginMethods(ref, { mainInterface });

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

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
        <Warnings
          warnings={warnings}
          isVisible={warningsVisibility}
          domNode={containerRef}
        />
      </div>
    </div>
  );
});

TreeView.propTypes = {
  call: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  instance: PropTypes.object,
  name: PropTypes.string,
  type: PropTypes.string,
  model: PropTypes.string,
  dataFromDB: PropTypes.object
};

TreeView.defaultProps = {
  onReady: () => console.warning("On ready prop not received")
};

export default TreeView;
