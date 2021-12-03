import React from "react";
import PropTypes from "prop-types";
import DialogContentText from "@material-ui/core/DialogContentText";
import AppDialog from "../AppDialog/AppDialog";

const ConfirmationDialog = props => {
  const { title, message, onSubmit, onClose } = props;

  return (
    <AppDialog title={title} onSubmit={onSubmit} onClose={onClose}>
      <DialogContentText>{message}</DialogContentText>
    </AppDialog>
  );
};

ConfirmationDialog.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func
};

ConfirmationDialog.defaultProps = {
  title: "Confirmation",
  message: "Are you sure do you want to continue?",
  onSubmit: () => console.log("Not Implemented"),
  onClose: () => console.log("Not Implemented")
};

export default ConfirmationDialog;
