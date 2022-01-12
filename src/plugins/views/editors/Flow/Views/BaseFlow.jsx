import React, { useRef, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import useMainInterface from "./hooks/useMainInterface";
import styles from "./styles";
import Loader from "../../_shared/Loader/Loader";
import { EVT_NAMES } from "../events";

const useStyles = makeStyles(styles);

const BaseFlow = props => {
  const classes = useStyles(props);
  const { instance, id, name, type, model, dataFromDB } = props;
  const readOnly = false;

  // State Hooks
  const [loading, setLoading] = useState(true);

  const containerId = useRef(`base-${Math.floor(Math.random() * 9999)}`);
  const container = useRef();

  const handleEvents = useCallback((evt, data) => {
    if (evt === EVT_NAMES.LOADING) {
      setLoading(data);
    }
  }, []);

  useMainInterface({
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
    handleEvents
  });

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
};

BaseFlow.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired
};

export default BaseFlow;
