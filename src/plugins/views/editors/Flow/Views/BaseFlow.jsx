import React, { useRef, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import useMainInterface from "./hooks/useMainInterface";
import styles from "./styles";
import Loader from "../../_shared/Loader/Loader";
import { EVT_NAMES } from "../events";
import { usePluginMethods } from "../../../../../engine/ReactPlugin/ViewReactPlugin";

const useStyles = makeStyles(styles);

const BaseFlow = React.forwardRef((props, ref) => {
  const classes = useStyles(props);
  const { call, instance, id, name, type, model, dataFromDB } = props;
  const readOnly = false;

  // State Hooks
  const [loading, setLoading] = useState(true);

  const containerId = useRef(`base-${id.replace(/\//g, "-")}`);
  const container = useRef();

  const handleEvents = useCallback((evt, data) => {
    if (evt === EVT_NAMES.LOADING) {
      setLoading(data);
    }
  }, []);

  const { mainInterface } = useMainInterface({
    classes,
    instance,
    name,
    data: dataFromDB,
    type,
    width: "400px",
    height: "200px",
    container,
    model,
    readOnly,
    handleEvents,
    call
  });

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
        id={containerId.current}
        ref={container}
        tagindex="0"
      ></div>
    </div>
  );
});

BaseFlow.propTypes = {};

export default BaseFlow;
