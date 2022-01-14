import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { DEFAULT_FUNCTION } from "../../../_shared/mocks";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  itemValue: {
    padding: "15px 15px 15px 25px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    fontSize: 14
  },
  disabled: {
    color: "gray"
  },
  parametersContainer: {
    overflowY: "auto",
    overflowX: "hidden",
    padding: "0px 6px 0px 6px",
    flexGrow: 1,
    minHeight: 0
  },
  groupRow: {
    display: "flex",
    flexDirection: "row"
  },
  groupItem: {
    flexGrow: 1,
    padding: "10px 25px"
  }
}));

const RNodeMenu = props => {
  const { nodeInst } = props;
  const classes = useStyles();

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <Typography component="div" className={classes.root}>
      {JSON.stringify(nodeInst)}
    </Typography>
  );
};

RNodeMenu.propTypes = {
  flowName: PropTypes.string.isRequired,
  nodeInst: PropTypes.object.isRequired,
  layers: PropTypes.object,
  openDoc: PropTypes.func,
  editable: PropTypes.bool
};

RNodeMenu.defaultProps = {
  layers: {},
  openDoc: () => DEFAULT_FUNCTION(),
  editable: true
};

export default RNodeMenu;
