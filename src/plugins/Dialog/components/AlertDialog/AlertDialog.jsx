import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import DialogContentText from "@material-ui/core/DialogContentText";
import AppDialog from "../AppDialog/AppDialog";

const useStyles = makeStyles(_ => ({
  container: {
    whiteSpace: "pre-wrap"
  }
}));

const AlertDialog = props => {
  // Props
  const { title, message, onClose } = props;
  // Hooks
  const classes = useStyles();

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
