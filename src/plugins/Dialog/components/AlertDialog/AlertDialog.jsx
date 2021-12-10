import React from "react";
import PropTypes from "prop-types";
import DialogContentText from "@material-ui/core/DialogContentText";
import AppDialog from "../AppDialog/AppDialog";

const AlertDialog = props => {
  const { title, message, onClose } = props;

  return (
    <AppDialog title={title} onClose={onClose}>
      <DialogContentText>{message}</DialogContentText>
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
