import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
  memo
} from "react";
import PropTypes from "prop-types";
import Backdrop from "@material-ui/core/Backdrop";
import { usePluginMethods } from "../../../../../engine/ReactPlugin/ViewReactPlugin";
import Loader from "../../_shared/Loader/Loader";
import { FLOW_VIEW_MODE, generateContainerId } from "../Constants/constants";
import Warnings from "../Components/Warnings/Warnings";
import GraphTreeView from "../Core/Graph/GraphTreeView";
import useMainInterface from "./hooks/useMainInterface";

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
  const containerId = useMemo(
    () => `${FLOW_VIEW_MODE.treeView}-${generateContainerId(id)}`,
    [id]
  );

  // const { mainInterface } = useMainInterface({
  //   classes,
  //   instance,
  //   name,
  //   data: dataFromDB,
  //   graphCls: GraphTreeView,
  //   type,
  //   width: "400px",
  //   height: "200px",
  //   containerId,
  //   model,
  //   readOnly,
  //   call
  // });

  console.log("tree view loading", loading);

  // const getMainInterface = useCallback(
  //   () => mainInterface.current,
  //   [mainInterface]
  // );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // useEffect(() => {
  //   const mInt = getMainInterface();
  //   console.log("here 1");

  //   if (!mInt || isMountedRef.current) return;
  //   isMountedRef.current = true;
  //   console.log("here 2");

  //   // Subscribe to on loading exit (finish) event
  //   mInt.mode.loading.onExit.subscribe(() => {
  //     console.log("Subscribe to on loading exit (finish) event");
  //     setLoading(false);
  //   });

  //   // Dispatch on ready event
  //   onReady(mInt);

  //   return () => {
  //     getMainInterface().graph.destroy();
  //     isMountedRef.current = false;
  //   };
  // }, [getMainInterface, dataFromDB, onReady]);

  useEffect(() => {
    setLoading(false);
  }, [dataFromDB]);

  // usePluginMethods(ref, { mainInterface });

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div
      id={`${FLOW_VIEW_MODE.treeView}-${id}`}
      className={classes.flowContainer}
    >
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
  onReady: () => console.warn("On ready prop not received")
};

export default memo(TreeView);
