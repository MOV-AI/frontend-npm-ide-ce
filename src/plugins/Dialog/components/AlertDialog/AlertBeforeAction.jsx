import React from "react";
import PropTypes from "prop-types";
import AppDialog from "../AppDialog/AppDialog";
import WarningIcon from "@material-ui/icons/Warning";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import { DialogContentText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

function useTranslation() {
  return { t: s => s };
}

const useStyles = makeStyles(theme => ({
  icon: {
    float: "left",
    marginRight: 20
  },
  message: {
    whiteSpace: "pre-wrap"
  }
}));

const AlertBeforeAction = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { onSubmit, onClose, actions, message, showAlertIcon, title } = props;

  const handleConfirmation = action => {
    onSubmit(action);
    onClose();
  };

  const getAcions = () => {
    return (
      <DialogActions>
        {Object.keys(actions).map(key => (
          <Button onClick={() => handleConfirmation(key)} color="default">
            {t(actions[key].label)}
          </Button>
        ))}
      </DialogActions>
    );
  };

  return (
    <AppDialog
      closeOnBackdrop={false}
      hasCloseButton={false}
      title={title}
      onClose={onClose}
      actions={getAcions()}
    >
      {showAlertIcon && (
        <WarningIcon fontSize={"large"} className={classes.icon} />
      )}
      <DialogContentText className={classes.message}>
        {message}
      </DialogContentText>
    </AppDialog>
  );
};

AlertBeforeAction.propTypes = {
  message: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  actions: PropTypes.array,
  showAlertIcon: PropTypes.bool,
  onClose: PropTypes.func
};

AlertBeforeAction.defaultProps = {
  message: "",
  actions: [],
  showAlertIcon: true,
  onClose: () => console.log("not implemented")
};

export default AlertBeforeAction;
