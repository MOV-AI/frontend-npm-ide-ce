import React from "react";
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
  const { warnings = [], isVisible } = props;
  // Other hooks
  const classes = warningsStyles();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   *
   * @returns
   */
  const createSnacks = () => {
    return warnings.map((warning, index) => {
      const { type, message, onClick } = warning;
      const Icon = variantIcon[type];
      const html = warning.html
        ? warning.html
        : () => {
            /* empty */
          };
      const handleOnSnackClick = () => {
        onClick && onClick(warning);
      };
      return (
        <SnackbarContent
          key={index}
          className={`${clsx(classes[type])} ${classes.snackbar} ${
            onClick ? classes.clickableSnack : ""
          }`}
          onClick={handleOnSnackClick}
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
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <>{isVisible && <div className={classes.root}>{createSnacks()}</div>}</>
  );
};

Warnings.propTypes = {
  warnings: PropTypes.array.isRequired,
  isVisible: PropTypes.bool
};

export default Warnings;
