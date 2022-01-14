import React, { useRef, useState, useEffect, useMemo } from "react";
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

  useEffect(() => {
    const mInt = mainInterface.current;
    if (!mInt) return;

    // Subscribe to on loading exit (finish) event
    mInt.mode.loading.onExit.subscribe(() => {
      setLoading(false);
    });

    // Dispatch on ready event
    onReady(mInt);
  }, [mainInterface, dataFromDB, onNodeSelected, onReady]);

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

BaseFlow.propTypes = {};
BaseFlow.defaultProps = {
  onReady: () => console.warning("On ready prop not received")
};

export default BaseFlow;
