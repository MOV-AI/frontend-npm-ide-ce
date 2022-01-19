import React, { useState, useEffect } from "react";
import AbstractModal from "../../../_shared/Modal/AbstractModal";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import { validateDocumentName } from "../../../_shared/Utils/Utils";
import { useTranslation } from "react-i18next";
import { DEFAULT_FUNCTION } from "../../../../_shared/mocks";

const useStyles = makeStyles(theme => ({
  input: {
    fontSize: "13px",
    marginBottom: "10px"
  }
}));

const DEFAULT_VALIDATION = {
  error: "",
  result: true
};

const LayerModal = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [validation, setValidation] = useState(DEFAULT_VALIDATION);
  const [state, setState] = useState({
    dataId: "",
    dataName: props.dataName
  });

  useEffect(() => {
    setState({
      dataId: props.dataId,
      dataName: props.dataName
    });
  }, [props.dataName, props.openModal, props.dataId]);

  const handleChange = (value, name) => {
    setState({ ...state, [name]: value });
  };

  const handleConfirm = () => {
    const _validation = validateName(state.dataName);
    if (_validation.result && props.handleValidation(state)) {
      props.handleModalConfirm(state);
      setValidation(DEFAULT_VALIDATION);
    }
  };

  const validateName = value => {
    const _validation = validateDocumentName(value);
    setValidation(_validation);
    return _validation;
  };

  return (
    <AbstractModal
      onSubmit={handleConfirm}
      onCancel={() => {
        props.handleCloseModal();
        setValidation(DEFAULT_VALIDATION);
      }}
      onEnter={() => DEFAULT_FUNCTION("onEnter")}
      open={props.openModal}
      title={props.isNewLayer === true ? t("New Group") : t("Edit Group")}
      submitText={t("Save")}
      width="50%"
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <TextField
          label={t("Name")}
          error={!validation.result}
          helperText={validation.error}
          value={state.dataName}
          autoFocus={props.isNewLayer}
          placeholder="name"
          className={classes.input}
          inputProps={{ "aria-label": "name" }}
          onKeyPress={evt => {
            if (evt.key === "Enter") {
              handleConfirm();
            }
          }}
          onChange={evt => {
            validateName(evt.target.value);
            handleChange(evt.target.value, "dataName");
          }}
          disabled={props.disableName}
          variant="outlined"
          required
        />
      </div>
    </AbstractModal>
  );
};

LayerModal.propTypes = {
  dataName: PropTypes.string,
  dataId: PropTypes.string,
  handleModalConfirm: PropTypes.func,
  handleCloseModal: PropTypes.func,
  handleValidation: PropTypes.func,
  isNewLayer: PropTypes.bool,
  openModal: PropTypes.bool
};
LayerModal.defaultProps = {
  dataName: "",
  dataId: "0",
  handleModalConfirm: () => DEFAULT_FUNCTION("handleModalConfirm"),
  handleCloseModal: () => DEFAULT_FUNCTION("handleCloseModal"),
  handleValidation: () => true,
  isNewLayer: false,
  openModal: false
};

export default LayerModal;
