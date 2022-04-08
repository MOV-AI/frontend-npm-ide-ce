import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import CloseIcon from "@material-ui/icons/Close";
import { IconButton, Typography } from "@material-ui/core";
import { defaultFunction } from "../../../../utils/Utils";
import { withTheme } from "../../../../decorators/withTheme";

import { appDialogTitleStyles, appDialogStyles } from "./styles";

/**
 * Custom Dialog Title : Render close icon button
 * @param {*} props : Component props
 * @returns {ReactComponent} DialogTitle Component
 */
export const DialogTitle = props => {
  const { children, onClose, hasCloseButton } = props;
  const classes = appDialogTitleStyles();
  return (
    <MuiDialogTitle disableTypography className={classes.root}>
      <Typography variant="h6">{children}</Typography>
      {hasCloseButton ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};

/**
 * App Dialog wrapper
 * @param {*} props
 * @returns {ReactComponent} AppDialog component wrapper
 */
const AppDialog = props => {
  const { t } = useTranslation();
  const {
    actions,
    onSubmit,
    onClose,
    closeOnBackdrop,
    title = t("Are you sure?"),
    submitText = t("Submit")
  } = props;
  const [open, setOpen] = useState(true);
  const classes = appDialogStyles();

  /**
   * Handle Dialog close
   */
  const handleClose = (_, reason) => {
    if (
      !closeOnBackdrop &&
      (reason === "backdropClick" || reason === "escapeKeyDown")
    )
      return;
    setOpen(false);
    onClose();
  };

  /**
   * Handle Dialog Submit and close
   */
  const handleSubmit = () => {
    onSubmit();
    handleClose();
  };

  const getDefaultActions = () => {
    return (
      <DialogActions>
        <Button onClick={handleClose} color="default">
          {onSubmit ? t("Cancel") : t("Ok")}
        </Button>
        {onSubmit && (
          <Button onClick={handleSubmit} color="primary">
            {submitText}
          </Button>
        )}
      </DialogActions>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle onClose={handleClose} {...props}>
        {title}
      </DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        {props.children}
      </DialogContent>
      {actions ?? getDefaultActions()}
    </Dialog>
  );
};

AppDialog.propTypes = {
  title: PropTypes.string,
  submitText: PropTypes.string,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  actions: PropTypes.element,
  hasCloseButton: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool
};

AppDialog.defaultProps = {
  onClose: () => defaultFunction("onClose"),
  hasCloseButton: true,
  closeOnBackdrop: false
};

export default withTheme(AppDialog);
