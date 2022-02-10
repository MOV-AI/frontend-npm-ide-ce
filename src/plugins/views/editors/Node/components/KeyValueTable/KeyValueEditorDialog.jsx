import React, { memo } from "react";
import PropTypes from "prop-types";
import _isEqual from "lodash/isEqual";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
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
import { DialogTitle } from "../../../../../Dialog/components/AppDialog/AppDialog";
import { useTranslation } from "../../../_shared/mocks";
import { withTheme } from "../../../../../../decorators/withTheme";

const useStyles = makeStyles(theme => ({
  input: { fontSize: "13px" },
  marginTop: { marginTop: "10px" },
  paper: { minWidth: "50%" },
  container: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  codeContainer: {
    height: "100px",
    width: "100%"
  }
}));

const KeyValueEditorDialog = props => {
  // Props
  const {
    onClose,
    onSubmit,
    validate,
    title,
    varName,
    isNew,
    disableName,
    disableDescription,
    renderCustomContent,
    renderValueEditor,
    showDefault
  } = props;
  // State hook
  const [data, setData] = React.useState({});
  // Other hooks
  const classes = useStyles();
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
    setData(prevState => {
      return { ...prevState, value };
    });
  };

  /**
   * Submit form and close dialog
   */
  const onSave = () => {
    validate(data).then(res => {
      if (res.success) {
        onSubmit(varName, res.data);
        onClose();
      }
    });
  };

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
            label="Name *"
            value={data.name}
            autoFocus={isNew}
            disabled={disableName}
            className={classes.input}
            onChange={onChangeName}
          />
          <FormControl className={classes.marginTop}>
            <TextField
              label="Description"
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
          <InputLabel className={classes.marginTop}>{t("Value")}</InputLabel>
          <FormControl className={classes.marginTop}>
            {renderValueEditor(data.value, {
              isNew,
              onChange: onChangeValue,
              disabled: props.disabled
            })}
          </FormControl>
          {showDefault && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>
                  {t("Default Value")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {renderValueEditor(data.value, {
                  isNew,
                  onChange: onChangeValue,
                  disabled: true
                })}
              </AccordionDetails>
            </Accordion>
          )}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("Cancel")}</Button>
        <Button color="primary" onClick={onSave}>
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

KeyValueEditorDialog.propTypes = {
  disableName: PropTypes.bool,
  disableDescription: PropTypes.bool,
  showDefault: PropTypes.bool,
  renderCustomContent: PropTypes.func,
  validate: PropTypes.func,
  title: PropTypes.string,
  defaultValue: PropTypes.string
};
KeyValueEditorDialog.defaultProps = {
  disableName: false,
  disableDescription: false,
  showDefault: false,
  validate: data => Promise.resolve({ success: true, data }),
  title: "Title",
  defaultValue: ""
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  return _isEqual(prevProps, nextProps);
}

export default memo(withTheme(KeyValueEditorDialog), arePropsEqual);
