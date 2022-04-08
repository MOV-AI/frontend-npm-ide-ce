import React from "react";
import PropTypes from "prop-types";
import DialogContentText from "@material-ui/core/DialogContentText";
import AppDialog from "../AppDialog/AppDialog";

import { alertDialogStyles } from "./styles";

const AlertDialog = props => {
  // Props
  const { title, message, onClose } = props;
  // Hooks
  const classes = alertDialogStyles();

  return (
    <AppDialog title={title} onClose={onClose}>
      <DialogContentText className={classes.container}>
        {message}
      </DialogContentText>
    </AppDialog>
  );
};

AlertDialog.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func
};

AlertDialog.defaultProps = {
  title: "Alert",
  onClose: () => console.log("Not Implemented")
};

export default AlertDialog;
