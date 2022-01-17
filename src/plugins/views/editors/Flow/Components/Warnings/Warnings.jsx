import React, { Component } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import clsx from "clsx";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import { amber, green } from "@material-ui/core/colors";
import { withStyles } from "@material-ui/styles";

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const styles = theme => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.main
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: 10
  },
  message: {
    display: "flex",
    whiteSpace: "pre",
    alignItems: "center"
  }
});

class Warnings extends Component {
  state = {
    isVisible: true
  };
  constructor(props) {
    super(props);
    this.domNode = this.props.domNode;
    this.el = document.createElement("div");
    // Update warning position
    this.el.style.position = "absolute";
    this.el.style.right = `${20}px`;
    this.el.style.top = `${20}px`;
    this.domNode.current.appendChild(this.el);
  }

  componentDidUpdate() {
    this.domNode = this.props.domNode;
  }

  handleOpen = isVisible => {
    this.setState({ isVisible });
  };

  createSnacks = () => {
    const { warnings, classes, className } = this.props;
    return warnings.map((warning, index) => {
      const { type, message } = warning;
      const Icon = variantIcon[type];
      const html = warning.html ? warning.html : () => {};
      return (
        <SnackbarContent
          key={index}
          className={clsx(classes[type], className)}
          message={
            <span className={classes.message}>
              <Icon className={clsx(classes.icon, classes.iconVariant)} />
              {message}
              {html()}
            </span>
          }
          style={{ margin: "5px", minWidth: "200px" }}
        />
      );
    });
  };

  render() {
    const isVisible = this.state.isVisible;
    return isVisible ? createPortal(this.createSnacks(), this.el) : <></>;
  }
}

Warnings.propTypes = {
  warnings: PropTypes.array.isRequired,
  domNode: PropTypes.object
};

Warnings.defaultProps = {
  warnings: [],
  domNode: null
};

export default withStyles(styles)(Warnings);
