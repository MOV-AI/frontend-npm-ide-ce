import React, { useCallback, useEffect, useState, memo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import _isEqual from "lodash/isEqual";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  DialogActions,
  Button
} from "@material-ui/core";
import { withTheme } from "../../../decorators/withTheme";
import { DialogTitle } from "../../../plugins/Dialog/components/AppDialog/AppDialog";

import { keyValueEditorDialogStyles } from "./styles";

const COMPONENTS = {
  NAME: "name",
  VALUE: "value"
};

const KeyValueEditorDialog = props => {
  // Props
  const {
    onClose,
    onSubmit,
    nameValidation,
    valueValidation,
    validate,
    title,
    isNew,
    disabled,
    disableName,
    disableDescription,
    showDescription,
    renderCustomContent,
    renderValueEditor,
    showDefault
  } = props;
  // State hook
  const [data, setData] = useState({});
  const [validation, setValidation] = useState({
    component: null,
    error: false,
    message: ""
  });
  // Other hooks
  const classes = keyValueEditorDialogStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Simple extract method to lower cognitive complex
   * @private function
   * @param {String} component : component to check against
   */
  const getValidationComponent = useCallback(
    component => {
      return validation.component === component;
    },
    [validation.component]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  //========================================================================================
  /*                                                                                      *
   *                                    Event Handlers                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * On change Name
   * @param {Event} evt : OnChange event
   */
  const onChangeName = useCallback(
    evt => {
      const name = evt?.target?.value;
      let isValid = Promise.resolve(true);
      if (nameValidation && validate) {
        isValid = nameValidation({ name }).then(res => {
          setValidation({
            component: COMPONENTS.NAME,
            error: !res.result,
            message: t(res.error)
          });
          // Return validation
          return res.result;
        });
      }

      // Set data
      setData(prevState => {
        return { ...prevState, name };
      });
      // Return validation result
      return isValid;
    },
    [nameValidation, t, validate]
  );

  /**
   * On change Description
   * @param {Event} evt : OnChange event
   */
  const onChangeDescription = useCallback(evt => {
    const description = evt?.target?.value;
    setData(prevState => {
      return { ...prevState, description };
    });
  }, []);

  /**
   * On change Value
   * @param {string} value : Code editor value
   */
  const onChangeValue = useCallback(
    value => {
      if (valueValidation && validate) {
        validate({ value }).then(res => {
          setValidation({
            component: COMPONENTS.VALUE,
            error: !res.result,
            message: t(res.error)
          });
        });
      }

      setData(prevState => {
        return { ...prevState, value };
      });
    },
    [t, validate, valueValidation]
  );

  /**
   * Submit form and close dialog
   */
  const onSave = useCallback(() => {
    // Validate name
    onChangeName({ target: { value: data.name } }).then(isValid => {
      if (isValid) {
        // Validate data type
        validate(data).then(res => {
          if (res.result ?? res.success) {
            onSubmit(res.data);
            onClose();
          } else {
            setValidation({ error: true, message: res.error });
          }
        });
      }
    });
  }, [data, onClose, onSubmit, validate, onChangeName]);

  //========================================================================================
  /*                                                                                      *
   *                                    Render Methods                                    *
   *                                                                                      */
  //========================================================================================

  return (
    <Dialog open={true} onClose={onClose} classes={{ paper: classes.paper }}>
      <div data-testid="section_key-value-editor-dialog">
        <DialogTitle onClose={onClose} hasCloseButton={true}>
          {title}
        </DialogTitle>
        <DialogContent>
          <Typography component="div" className={classes.container}>
            <TextField
              label={`${t("Name")} *`}
              error={
                getValidationComponent(COMPONENTS.NAME) && validation.error
              }
              helperText={
                getValidationComponent(COMPONENTS.NAME) && validation.message
              }
              value={data.name}
              autoFocus={isNew}
              disabled={disableName || disabled}
              className={classes.input}
              onChange={onChangeName}
              inputProps={{ "data-testid": "input_name" }}
            />
            {showDescription && (
              <FormControl className={classes.marginTop}>
                <TextField
                  label={t("Description")}
                  value={data.description}
                  className={classes.input}
                  multiline
                  minRows={3}
                  maxRows={10}
                  disabled={disableDescription || disabled}
                  onChange={onChangeDescription}
                  inputProps={{ "data-testid": "input_description" }}
                />
              </FormControl>
            )}
            {renderCustomContent && renderCustomContent()}
            <InputLabel className={classes.label}>{t("Value")}</InputLabel>
            <FormControl className={classes.marginTop}>
              {renderValueEditor(data.value, {
                isNew,
                onChange: onChangeValue,
                error:
                  getValidationComponent(COMPONENTS.VALUE) && validation.error,
                helperText:
                  getValidationComponent(COMPONENTS.VALUE) &&
                  validation.message,
                disabled: disabled,
                defaultValue: data.defaultValue
              })}
            </FormControl>
            {showDefault && (
              <Accordion className={classes.accordion} defaultExpanded>
                <AccordionSummary
                  className={classes.accordionSummary}
                  expandIcon={<ExpandMoreIcon />}
                >
                  <Typography className={classes.label}>
                    {t("Default Value")}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.noHorizontalPadding}>
                  {renderValueEditor(data.defaultValue, {
                    isNew,
                    onChange: onChangeValue,
                    isDefault: true,
                    disabled: true
                  })}
                </AccordionDetails>
              </Accordion>
            )}
          </Typography>
        </DialogContent>
        <DialogActions data-testid="section_dialog-actions">
          <Button data-testid="input_close" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button
            data-testid="input_confirm"
            color="primary"
            onClick={onSave}
            // Let's only disable the save button if we are doing a name validation (which is validated on change)
            disabled={
              (getValidationComponent(COMPONENTS.NAME) && validation.error) ||
              disabled
            }
          >
            {t("Save")}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

KeyValueEditorDialog.propTypes = {
  title: PropTypes.string.isRequired,
  isNew: PropTypes.bool,
  disabled: PropTypes.bool,
  disableName: PropTypes.bool,
  disableDescription: PropTypes.bool,
  showDefault: PropTypes.bool,
  showDescription: PropTypes.bool,
  defaultValue: PropTypes.string,
  onClose: PropTypes.func,
  validate: PropTypes.func,
  onSubmit: PropTypes.func,
  renderValueEditor: PropTypes.func,
  renderCustomContent: PropTypes.func,
  nameValidation: PropTypes.func,
  valueValidation: PropTypes.func
};

KeyValueEditorDialog.defaultProps = {
  disableName: false,
  disableDescription: false,
  showDescription: true,
  showDefault: false,
  validate: data => Promise.resolve({ success: true, data })
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  return _isEqual(prevProps, nextProps);
}

export default memo(withTheme(KeyValueEditorDialog), arePropsEqual);
