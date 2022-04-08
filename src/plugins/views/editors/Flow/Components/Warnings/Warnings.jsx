import React, { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import clsx from "clsx";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import WarningIcon from "@material-ui/icons/Warning";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import InfoIcon from "@material-ui/icons/Info";

import { warningsStyles } from "./styles";

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon
};

const Warnings = props => {
  // Props
  const { domNode, warnings = [], isVisible } = props;
  // Other hooks
  const classes = warningsStyles();
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
};

Warnings.propTypes = {
  warnings: PropTypes.array.isRequired,
  domNode: PropTypes.object
};

Warnings.defaultProps = {
  warnings: [],
  domNode: null
};

export default Warnings;
