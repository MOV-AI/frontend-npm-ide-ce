import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { CircularProgress } from "@material-ui/core";
import { withTheme } from "../../../../decorators/withTheme";

import { appDialogStyles } from "./styles";

const FormDialog = props => {
  // Translation hook
  const { t } = useTranslation();
  // Props
  const {
    size,
    onClose,
    title,
    message,
    onSubmit,
    onValidation,
    onPostValidation,
    placeholder,
    multiline,
    loadingMessage,
    defaultValue,
    maxLength,
    inputLabel = t("Name"),
    submitText = t("Submit")
  } = props;
  // State hook
  const [open, setOpen] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [validation, setValidation] = useState({
    error: false,
    message: ""
  });
  // Style hook
  const classes = appDialogStyles();
  // Ref
  const inputRef = useRef();

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  // Trigger input focus in first render
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.querySelector("input")?.focus();
    });
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Validate value
   * @param {String} _value : New value
   * @returns {ValidationResult}
   */
  const validateValue = _value => {
    const res = onValidation(_value);
    // Set state
    setValidation({ error: !res.result, message: res.error });
    setValue(_value);
    if (onPostValidation && res.result) {
      onPostValidation(_value).then(result => {
        setValidation(result);
      });
    }
    // Return validation result
    return res;
  };

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle dialog close
   * @param {Event} closeEvent : Close Event
   * @param {String} reason : close reason
   * @returns
   */
  const handleClose = (_closeEvent, reason) => {
    if (reason === "backdropClick") return;
    setOpen(false);
    if (onClose) onClose();
  };

  /**
   * Handle form submit
   */
  const handleSubmit = () => {
    const _validation = validateValue(value);
    if (_validation.error) return;
    const result = onSubmit(value);
    if (result instanceof Promise) {
      setLoading(true);
      result.then(() => {
        setLoading(false);
        handleClose();
      });
    } else handleClose();
  };

  /**
   * Handle the onKeyPress event of Textfield
   * @param {event} evt
   */
  const handleKeyPress = evt => {
    let isEnter = evt.key === "Enter";
    if (isEnter) {
      evt.preventDefault();
      handleSubmit();
    }
  };

  /**
   * Handle the onChange event of Textfield
   * @param {event} evt
   */
  const handleOnChange = evt => {
    validateValue(evt.target.value);
  };

  /**
   * Handle paste on Textfield
   * @param {event} event : event to be captured
   * @returns {ValidationResult}
   */
  const handlePaste = event => {
    event.preventDefault();
    // Trim pasted text
    const pastedText = event.clipboardData
      .getData("text/plain")
      .trim()
      .replace(/(\r\n|\n|\r)/gm, "");
    // Validate pasted text
    validateValue(pastedText);
    // Set text in input field
    event.target.value = pastedText;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth={!!size}
      maxWidth={size}
    >
      <div data-testid="section_form-dialog">
        <DialogTitle>
          {loadingMessage && isLoading ? loadingMessage : title}
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {message && <DialogContentText>{message}</DialogContentText>}
          {isLoading ? (
            <div className={classes.loadingContainer}>
              <CircularProgress />
            </div>
          ) : (
            <TextField
              ref={inputRef}
              autoFocus={true}
              error={validation.error}
              helperText={validation.message}
              className={classes.textfield}
              label={t(inputLabel)}
              InputLabelProps={{ shrink: true }}
              defaultValue={value}
              placeholder={placeholder}
              multiline={multiline}
              onPaste={handlePaste}
              onKeyPress={handleKeyPress}
              onChange={handleOnChange}
              inputProps={{
                "data-testid": "input_value",
                maxLength: multiline ? "" : maxLength
              }} // limit of characters here
              margin="normal"
            />
          )}
        </DialogContent>
        <DialogActions data-testid="section_dialog-actions">
          <Button
            data-testid="input_close"
            onClick={handleClose}
            color="secondary"
          >
            {t("Cancel")}
          </Button>
          <Button
            data-testid="input_confirm"
            onClick={handleSubmit}
            disabled={validation.error}
            color="primary"
          >
            {submitText}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

FormDialog.propTypes = {
  onValidation: PropTypes.func,
  onPostValidation: PropTypes.func,
  inputLabel: PropTypes.string,
  submitText: PropTypes.string,
  placeholder: PropTypes.string,
  defaultValue: PropTypes.string,
  maxLength: PropTypes.number,
  multiline: PropTypes.bool,
  size: PropTypes.string
};

FormDialog.defaultProps = {
  onValidation: () => ({ result: true, error: "" }),
  defaultValue: "",
  multiline: false,
  maxLength: 40
};

export default withTheme(FormDialog);
