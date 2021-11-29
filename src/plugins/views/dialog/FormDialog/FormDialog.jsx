import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { CircularProgress } from "@material-ui/core";
import {
  withViewPlugin,
  usePluginMethods
} from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { makeStyles } from "@material-ui/styles";
import useNewDocument from "./hooks/useNewDocument";

function useTranslation() {
  return { t: s => s };
}

const useStyles = makeStyles(theme => ({
  loadingContainer: {
    height: "100px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}));

const FormDialog = (props, ref) => {
  const DEFAULT_DATA = {
    type: "",
    open: false,
    scope: "",
    title: "",
    message: "",
    inputValue: "",
    inputLabel: "Name",
    submitText: "Submit",
    error: false,
    helperText: "",
    maxLength: 40,
    onSubmit: () => {}
  };

  //========================================================================================
  /*                                                                                      *
   *                                Component's methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle dialog close
   * @param {Event} _ : Close Event
   * @param {String} reason : close reason
   * @returns
   */
  const handleClose = (_, reason) => {
    if (reason === "backdropClick") return;
    setMethods({ onChange, onValidation });
    setState(prevState => {
      return {
        ...prevState,
        ...DEFAULT_DATA
      };
    });
  };

  /**
   * Handle form submit
   */
  const handleSubmit = () => {
    const validation = methods.onChange(state.inputValue);
    if (validation.error) return;
    const result = state.onSubmit(state.inputValue);
    if (result instanceof Promise) {
      setLoading(true);
      result.then(() => {
        setLoading(false);
        handleClose();
      });
    } else handleClose();
  };

  /**
   * On change TextField value
   * @param {String} _value : New value
   * @returns {ValidationResult}
   */
  const onChange = _value => {
    const res = methods.onValidation(_value);
    // Set state
    setState(prevState => {
      return {
        ...prevState,
        inputValue: _value,
        error: !res.result,
        helperText: res.error
      };
    });
    // Return validation result
    return res;
  };

  /**
   * Default on Validation method
   * @returns Validation result
   */
  const onValidation = () => ({ result: true, error: "" });

  //========================================================================================
  /*                                                                                      *
   *                                Initiate Component                                    *
   *                                                                                      */
  //========================================================================================

  // Props
  const { call } = props;
  // State hooks
  const [isLoading, setLoading] = React.useState(false);
  const [state, setState] = React.useState(DEFAULT_DATA);
  const [methods, setMethods] = React.useState({
    onChange,
    onValidation
  });
  // Style hook
  const classes = useStyles();
  // Forms hook
  const documentFunctions = useNewDocument({ call, state, setState });
  // Translation hook
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Public Methods                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Open modal to enter new document name
   * @param {*} data
   */
  const newDocument = React.useCallback(
    data => {
      setMethods(documentFunctions);
      setState(prevState => {
        return {
          ...prevState,
          open: true,
          message: "",
          title: data.title,
          scope: data.scope,
          submitText: "Create",
          onSubmit: data.onSubmit
        };
      });
    },
    [documentFunctions]
  );

  React.useEffect(() => {
    setLoading(false);
  }, []);

  usePluginMethods(ref, {
    newDocument
  });

  //========================================================================================
  /*                                                                                      *
   *                                         Render                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <Dialog open={state.open} onClose={handleClose}>
      <DialogTitle>{state.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{state.message}</DialogContentText>
        {isLoading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress />
          </div>
        ) : (
          <TextField
            autoFocus={true}
            error={state.error}
            helperText={state.helperText}
            style={{ width: "100%", minWidth: 450 }}
            label={t(state.inputLabel)}
            InputLabelProps={{ shrink: true }}
            defaultValue={state.inputValue}
            onPaste={event => {
              event.preventDefault();
              // Trim pasted text
              const pastedText = event.clipboardData
                .getData("text/plain")
                .trim()
                .replace(/(\r\n|\n|\r)/gm, "");
              // Validate pasted text
              methods.onChange(pastedText);
              // Set text in input field
              event.target.value = pastedText;
            }}
            onKeyPress={event => {
              let isEnter = event.key === "Enter";
              if (isEnter) event.preventDefault();
            }}
            onChange={event => methods.onChange(event.target.value)}
            inputProps={{ maxLength: state.maxLength }} // limit of characters here
            margin="normal"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          {t("Cancel")}
        </Button>
        <Button onClick={handleSubmit} disabled={state.error} color="primary">
          {state.submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FormDialog.pluginMethods = ["newDocument"];

export default withViewPlugin(FormDialog, FormDialog.pluginMethods);

FormDialog.propTypes = {
  call: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

FormDialog.defaultProps = {
  profile: { name: "formDialog" }
};
