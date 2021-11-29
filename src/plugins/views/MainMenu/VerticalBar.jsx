import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

const useStyles = makeStyles(theme => ({
  container: {
    width: 65,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: props => props.backgroundColor
  },
  logoArea: {
    padding: "14px",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  navigationArea: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  accountArea: {
    padding: props => (props.unsetAccountAreaPadding ? "unset" : "14px"),
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  divider: {
    borderColor: "gray",
    width: "100%"
  }
}));

const VerticalBar = props => {
  const classes = useStyles(props);
  return (
    <div className={classes.container}>
      <div className={classes.logoArea}>{props.upperElement}</div>
      <hr className={classes.divider} />
      {props.creatorElement && (
        <div>
          <div className={classes.logoArea}>{props.creatorElement}</div>
          <hr className={classes.divider} />
        </div>
      )}
      <div className={classes.navigationArea}>
        {props.navigationList.map((element, index) => {
          return (
            <div key={index} style={{ padding: "15px 0px" }}>
              {element}
            </div>
          );
        })}
        <hr className={classes.divider} />
      </div>
      <div className={classes.accountArea}>{props.lowerElement}</div>
    </div>
  );
};

VerticalBar.propTypes = {
  upperElement: PropTypes.node,
  creatorElement: PropTypes.node,
  navigationList: PropTypes.array,
  lowerElement: PropTypes.node.isRequired,
  backgroundColor: PropTypes.string,
  unsetAccountAreaPadding: PropTypes.bool
};
VerticalBar.defaultProps = {
  upperElement: <div></div>,
  creatorElement: null,
  navigationList: [<div></div>],
  lowerElement: <div></div>,
  backgroundColor: "#424242",
  unsetAccountAreaPadding: false
};

export default VerticalBar;
