import React, { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import clsx from "clsx";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";
import { amber, green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/styles";

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const useStyles = makeStyles(theme => ({
  root: {
    position: "absolute",
    top: "20px",
    right: "50px"
  },
  snackbar: {
    margin: "5px",
    minWidth: "200px"
  },
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
}));

const Warnings = React.forwardRef((props, ref) => {
  // Props
  const { domNode, warnings = [], isVisible } = props;
  // Other hooks
  const classes = useStyles();
  // Ref
  const el = useRef(document.createElement("div"));

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   *
   * @returns
   */
  const createSnacks = useCallback(() => {
    return warnings.map((warning, index) => {
      const { type, message } = warning;
      const Icon = variantIcon[type];
      const html = warning.html
        ? warning.html
        : () => {
            /* empty */
          };
      return (
        <SnackbarContent
          key={index}
          className={`${clsx(classes[type])} ${classes.snackbar}`}
          message={
            <span className={classes.message}>
              <Icon className={clsx(classes.icon, classes.iconVariant)} />
              {message}
              {html()}
            </span>
          }
        />
      );
    });
  }, [classes, warnings]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    el.current.classList.add(classes.root);
    domNode.current.appendChild(el.current);
  }, [classes.root, domNode]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return isVisible ? createPortal(createSnacks(), el.current) : <></>;
});

Warnings.propTypes = {
  warnings: PropTypes.array.isRequired,
  domNode: PropTypes.object
};

Warnings.defaultProps = {
  warnings: [],
  domNode: null
};

export default Warnings;
