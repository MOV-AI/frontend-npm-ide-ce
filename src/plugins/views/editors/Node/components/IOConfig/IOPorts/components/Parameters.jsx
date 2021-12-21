import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Circle from "@material-ui/icons/FiberManualRecord";
import Input from "@material-ui/core/Input";

const useStyles = makeStyles(theme => {
  return {
    gridContainer: {
      width: "100%",
      display: "flex",
      flexWrap: "wrap",
      boxSizing: "border-box",
      padding: "10px"
    },
    circle: {
      width: "0.25em",
      height: "0.25em",
      margin: "5px"
    },
    input: {
      width: "100%",
      fontSize: "0.875rem",
      padding: "0px 8px 0px 8px"
    }
  };
});

const Parameters = props => {
  // Props
  const { param, paramValue, direction, ioPort, editable } = props;
  // Hooks
  const classes = useStyles();

  return (
    <Grid className={classes.gridContainer}>
      <Grid item xs={3} style={{ margin: "auto" }}>
        <Circle className={classes.circle} />
        {`${param}:`}
      </Grid>
      <Grid item xs={9}>
        <Input
          disabled={!editable}
          value={paramValue}
          type={"text"}
          className={classes.input}
          onChange={evt =>
            props.handleIOPortsInputs(
              evt.target.value,
              props.rowData.tableData.id,
              direction,
              ioPort,
              "Parameter",
              param
            )
          }
        />
      </Grid>
    </Grid>
  );
};

export default Parameters;
