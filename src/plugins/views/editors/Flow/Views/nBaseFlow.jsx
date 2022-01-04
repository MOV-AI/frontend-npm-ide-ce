import React, { useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import useMainInterface from "./hooks/useMainInterface";
import styles from "./styles";

const useStyles = makeStyles(styles);

const BaseFlow = props => {
  console.log("debug baseflow props", props);
  const classes = useStyles(props);
  const { id, name, type, model, workspace, version, data, dataFromDB } = props;
  const readOnly = false;

  const containerId = useRef(`base-${Math.floor(Math.random() * 9999)}`);
  const container = useRef();

  const handleEvents = useCallback((evt, _data) => {
    console.log("debug handle events", evt, _data);
  }, []);

  const [mainInterface, loading] = useMainInterface({
    classes,
    name,
    data: dataFromDB,
    type,
    width: "400px",
    height: "200px",
    container,
    model,
    readOnly,
    workspace,
    version,
    handleEvents
  });

  console.log("debug nBaseFlow container id", containerId.current);

  return (
    <div id={`flow-main-${id}`} className={classes.flowContainer}>
      {loading && (
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress />
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
