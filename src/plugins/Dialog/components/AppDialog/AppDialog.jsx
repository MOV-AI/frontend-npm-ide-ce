import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

function useTranslation() {
  return { t: s => s };
}

const useStyles = makeStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2)
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  }
}));

/**
 * Custom Dialog Title : Render close icon button
 * @param {*} props : Component props
 * @returns {ReactComponent} DialogTitle Component
 */
const DialogTitle = props => {
  const classes = useStyles();
  const { children, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
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
  const [open, setOpen] = React.useState(true);
  const { title, onSubmit, onClose, submitText } = props;

  /**
   * Handle Dialog close
   */
  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  /**
   * Handle Dialog Submit and close
   */
  const handleSubmit = () => {
    onSubmit();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle onClose={handleClose}>{title}</DialogTitle>
      <DialogContent dividers style={{ minWidth: 450 }}>
        {props.children}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="default">
          {t("Cancel")}
        </Button>
        <Button onClick={handleSubmit} color="primary">
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AppDialog.propTypes = {
  title: PropTypes.string,
  submitText: PropTypes.string,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func
};

AppDialog.defaultProps = {
  title: "Are you sure?",
  submitText: "Submit",
  onSubmit: () => console.log("Not Implemented"),
  onClose: () => console.log("Not Implemented")
};

export default AppDialog;
