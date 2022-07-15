import React, { useCallback, useState, memo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import InfoLogo from "@material-ui/icons/Info";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import TextField from "@material-ui/core/TextField";
import _isEqual from "lodash/isEqual";
import CollapsibleHeader from "../../../../_shared/CollapsibleHeader/CollapsibleHeader";
import { HtmlTooltip } from "../../../../_shared/HtmlTooltip/HtmlTooltip";

import { executionParamStyles } from "./styles";

const TOOLTIP = {
  close: 0,
  persistent: 1,
  remappable: 2,
  launch: 3
};

const ExecutionParameters = props => {
  const {
    persistent,
    remappable,
    launch,
    path,
    onChangePath,
    onChangeExecutionParams,
    editable
  } = props;
  // Handle tooltip open state
  const [openTooltip, setOpenTooltip] = useState(TOOLTIP.close);
  // Hooks
  const classes = executionParamStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle tooltip close
   */
  const handleTooltipClose = useCallback(
    triggeredBy => {
      if (triggeredBy !== openTooltip) return;
      setOpenTooltip(TOOLTIP.close);
    },
    [openTooltip]
  );

  /**
   * Handle tooltip toggle
   */
  const handleTooltipToggle = useCallback(newState => {
    setOpenTooltip(prevState => {
      if (prevState === newState) return TOOLTIP.close;
      else return newState;
    });
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                   Render Functions                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Checkbox with custom HTML tooltip
   * @param {string} keyName : Property key name
   * @param {string} title : Checkbox label
   * @param {boolean} checkboxValue : Checkbox checked state
   * @param {{id: number, title: string, description: string}} tooltip : Tooltip data
   * @returns {ReactElement} Checkbox with custom HTML tooltip
   */
  const renderCheckbox = (keyName, title, checkboxValue, tooltip) => (
    <Typography component="div" className={classes.centerCheckboxTooltip}>
      <FormControlLabel
        className={classes.formControlLabel}
        control={
          <Checkbox
            inputProps={{ "data-testid": `input_${keyName}` }}
            disabled={!editable}
            checked={checkboxValue}
            onChange={() => onChangeExecutionParams(keyName, !checkboxValue)}
            color="primary"
          />
        }
        label={title}
      />
      <ClickAwayListener onClickAway={() => handleTooltipClose(tooltip.id)}>
        <Typography data-testid="section_tooltip" component="div">
          <HtmlTooltip
            PopperProps={{ disablePortal: true }}
            onClose={handleTooltipClose}
            open={openTooltip === tooltip.id}
            disableFocusListener
            disableHoverListener
            title={
              <>
                <Typography color="inherit">{tooltip.title}</Typography>
                {tooltip.description}
              </>
            }
          >
            <IconButton
              data-testid="input_toggle-tooltip"
              className={classes.logo}
              onClick={() => handleTooltipToggle(tooltip.id)}
            >
              <InfoLogo className="tooltipIcon" />
            </IconButton>
          </HtmlTooltip>
        </Typography>
      </ClickAwayListener>
    </Typography>
  );

  return (
    <CollapsibleHeader
      testId="section_execution-parameters"
      title={t("ExecutionParameters")}
    >
      <Typography component="div" className={classes.center}>
        {/*-------------------- Persistent ------------------------*/}
        {renderCheckbox("persistent", t("Persistent"), persistent, {
          id: TOOLTIP.persistent,
          title: t("PersistentNodeTitle"),
          description: t("PersistentNodeDescription")
        })}
        {/* ---------------- Remappable -------------------*/}
        {renderCheckbox("remappable", t("Remappable"), remappable, {
          id: TOOLTIP.remappable,
          title: t("Remappable"),
          description: t("RemappableDescription")
        })}
        {/* ---------------- Launch -------------------*/}
        {renderCheckbox("launch", t("Launch"), launch, {
          id: TOOLTIP.launch,
          title: t("Launch"),
          description: t("LaunchDescription")
        })}
      </Typography>
      <TextField
        inputProps={{ "data-testid": "input_path" }}
        label={t("Path")}
        disabled={!editable}
        className={classes.textField}
        defaultValue={path}
        onChange={evt => onChangePath(evt.target.value)}
        margin="normal"
        variant="outlined"
      />
    </CollapsibleHeader>
  );
};

ExecutionParameters.propTypes = {
  persistent: PropTypes.bool,
  remappable: PropTypes.bool,
  launch: PropTypes.bool,
  path: PropTypes.string,
  onChangePath: PropTypes.func,
  onChangeExecutionParams: PropTypes.func,
  editable: PropTypes.bool
};

ExecutionParameters.defaultProps = {
  persistent: false,
  remappable: true,
  launch: true,
  path: "",
  onChangePath: text => console.log(text),
  onChangeExecutionParams: (param, value) => console.log(param, value),
  editable: true
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  // filter out functions
  const {
    onChangeExecutionParams: a,
    onChangePath: b,
    ...filtPrevProps
  } = prevProps;

  const {
    onChangeExecutionParams: aa,
    onChangePath: bb,
    ...filtNextProps
  } = nextProps;

  return _isEqual(filtPrevProps, filtNextProps);
}

export default memo(ExecutionParameters, arePropsEqual);
