import React from "react";
import PropTypes from "prop-types";
import AppDialog from "../AppDialog/AppDialog";
import WarningIcon from "@material-ui/icons/Warning";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import { DialogContentText } from "@material-ui/core";

function useTranslation() {
  return { t: s => s };
}

const CloseDirtyDocument = props => {
  const { t } = useTranslation();
  const { onSubmit, onClose, name, scope } = props;

  const handleConfirmation = action => {
    onSubmit(action);
    onClose();
  };

  const getAcions = () => {
    return (
      <DialogActions>
        <Button onClick={() => handleConfirmation("dontSave")} color="default">
          {t("Don't Save")}
        </Button>
        <Button onClick={() => handleConfirmation("cancel")} color="default">
          {t("Cancel")}
        </Button>
        <Button onClick={() => handleConfirmation("save")} color="default">
          {t("Save")}
        </Button>
      </DialogActions>
    );
  };

  return (
    <AppDialog
      closeOnBackdrop={false}
      hasCloseButton={false}
      title={"Do you want to save the changes?"}
      onClose={onClose}
      actions={getAcions()}
    >
      <WarningIcon
        fontSize={"large"}
        style={{ float: "left", marginRight: 20 }}
      />
      <DialogContentText>
        Your changes to the {scope} "{name}" will be lost if you don't save
        them.
      </DialogContentText>
    </AppDialog>
  );
};

CloseDirtyDocument.propTypes = {
  name: PropTypes.string,
  scope: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func
};

CloseDirtyDocument.defaultProps = {
  name: "",
  scope: "",
  onClose: () => console.log("not implemented")
};

export default CloseDirtyDocument;
