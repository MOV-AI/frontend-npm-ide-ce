import React, { useCallback, memo } from "react";
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
import { withTheme } from "../../../../../decorators/withTheme";
import { DialogTitle } from "../../../../Dialog/components/AppDialog/AppDialog";

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
    renderCustomContent,
    renderValueEditor,
    showDefault
  } = props;
  // State hook
  const [data, setData] = React.useState({});
  const [validation, setValidation] = React.useState({
    component: null,
    error: false,
    message: ""
  });
  // Other hooks
  const classes = keyValueEditorDialogStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    React lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
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
  const onChangeName = evt => {
    const name = evt?.target?.value;
    if (nameValidation && validate) {
      nameValidation({ name }).then(res => {
        setValidation({
          component: COMPONENTS.NAME,
          error: !res.result,
          message: res.error
        });
      });
    }

    setData(prevState => {
      return { ...prevState, name };
    });
  };

  /**
   * On change Description
   * @param {Event} evt : OnChange event
   */
  const onChangeDescription = evt => {
    const description = evt?.target?.value;
    setData(prevState => {
      return { ...prevState, description };
    });
  };

  /**
   * On change Value
   * @param {string} value : Code editor value
   */
  const onChangeValue = value => {
    if (valueValidation && validate) {
      validate({ value }).then(res => {
        setValidation({
          component: COMPONENTS.VALUE,
          error: !res.result,
          message: res.error
        });
      });
    }

    setData(prevState => {
      return { ...prevState, value };
    });
  };

  /**
   * Submit form and close dialog
   */
  const onSave = useCallback(() => {
    validate(data).then(res => {
      if (res.result ?? res.success) {
        onSubmit(res.data);
        onClose();
      } else {
        setValidation({ error: true, message: res.error });
      }
    });
  }, [data, onClose, onSubmit, validate]);

  //========================================================================================
  /*                                                                                      *
   *                                    Render Methods                                    *
   *                                                                                      */
  //========================================================================================

  return (
    <Dialog open={true} onClose={onClose} classes={{ paper: classes.paper }}>
      <DialogTitle onClose={onClose} hasCloseButton={true}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography component="div" className={classes.container}>
          <TextField
            label={`${t("Name")} *`}
            error={validation.component === COMPONENTS.NAME && validation.error}
            helperText={
              validation.component === COMPONENTS.NAME && validation.message
            }
            value={data.name}
            autoFocus={isNew}
            disabled={disableName}
            className={classes.input}
            onChange={onChangeName}
          />
          <FormControl className={classes.marginTop}>
            <TextField
              label={t("Description")}
              value={data.description}
              className={classes.input}
              multiline
              minRows={3}
              maxRows={10}
              disabled={disableDescription}
              onChange={onChangeDescription}
            />
          </FormControl>
          {renderCustomContent && renderCustomContent()}
          <InputLabel className={classes.label}>{t("Value")}</InputLabel>
          <FormControl className={classes.marginTop}>
            {renderValueEditor(data.value, {
              isNew,
              onChange: onChangeValue,
              error:
                validation.component === COMPONENTS.VALUE && validation.error,
              helperText:
                validation.component === COMPONENTS.VALUE && validation.message,
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
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button color="primary" onClick={onSave} disabled={validation.error}>
          {t("Save")}
        </Button>
      </DialogActions>
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
  showDefault: false,
  validate: data => Promise.resolve({ success: true, data })
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  return _isEqual(prevProps, nextProps);
}

export default memo(withTheme(KeyValueEditorDialog), arePropsEqual);
