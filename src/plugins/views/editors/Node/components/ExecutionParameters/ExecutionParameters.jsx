import React, { memo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "../../../_shared/mocks";
import { HtmlTooltip } from "../_shared/HtmlTooltip";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Divider from "@material-ui/core/Divider";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import InfoLogo from "@material-ui/icons/Info";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import TextField from "@material-ui/core/TextField";
import _isEqual from "lodash/isEqual";

const useStyles = makeStyles(theme => ({
  root: {
    padding: "5px 0px 5px 0px",
    width: "100%"
  },
  heading: {
    fontSize: "1.5rem"
  },
  details: {
    display: "flex",
    flexDirection: "column"
  },
  column: {
    flexBasis: "90%"
  },
  input: {
    margin: theme.spacing(1),
    fontFamily: "inherit",
    width: "80%",
    fontWeight: "bold"
  },
  text: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  row: {
    display: "flex",
    flexDirection: "row"
  },
  center: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap"
  },
  centerCheckboxTooltip: {
    justifyContent: "center",
    display: "flex",
    flexDirection: "row",
    flexGrow: 1
  },
  logo: {
    margin: "12px 12px 12px 12px",
    padding: "0px"
  },
  formControlLabel: {
    margin: "0%"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  noMargin: {
    margin: 0
  }
}));

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
  const [openTooltip, setOpenTooltip] = React.useState(TOOLTIP.close);
  // Hooks
  const classes = useStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle tooltip close
   */
  const handleTooltipClose = React.useCallback(
    triggeredBy => {
      if (triggeredBy !== openTooltip) return;
      setOpenTooltip(TOOLTIP.close);
    },
    [openTooltip]
  );

  /**
   * Handle tooltip toggle
   */
  const handleTooltipToggle = React.useCallback(newState => {
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
   * @param {{id: string, title: string, description: string}} tooltip : Tooltip data
   * @returns {ReactElement} Checkbox with custom HTML tooltip
   */
  const renderCheckbox = (keyName, title, checkboxValue, tooltip) => (
    <Typography component="div" className={classes.centerCheckboxTooltip}>
      <FormControlLabel
        className={classes.formControlLabel}
        control={
          <Checkbox
            disabled={!editable}
            checked={checkboxValue}
            onChange={() => onChangeExecutionParams(keyName, !checkboxValue)}
            color="primary"
          />
        }
        label={title}
      />
      <ClickAwayListener onClickAway={() => handleTooltipClose(tooltip.id)}>
        <Typography component="div">
          <HtmlTooltip
            PopperProps={{ disablePortal: true }}
            onClose={handleTooltipClose}
            open={openTooltip === tooltip.id}
            disableFocusListener
            disableHoverListener
            title={
              <React.Fragment>
                <Typography color="inherit">{tooltip.title}</Typography>
                {tooltip.description}
              </React.Fragment>
            }
          >
            <IconButton
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
    <Typography component="div" className={classes.root}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography component="div" className={classes.column}>
            <Typography className={classes.heading}>
              {t("Execution Parameters")}
            </Typography>
          </Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails className={classes.details}>
          <Typography component="div" className={classes.center}>
            {/*-------------------- Persistent ------------------------*/}
            {renderCheckbox("persistent", t("Persistent"), persistent, {
              id: TOOLTIP.persistent,
              title: t("Persistent node"),
              description: t(
                "After launch, the node will remain active during the flow execution."
              )
            })}
            {/* ---------------- Remappable -------------------*/}
            {renderCheckbox("remappable", t("Remappable"), remappable, {
              id: TOOLTIP.remappable,
              title: t("Remappable"),
              description: t(
                "Allows, or not, the ports of the node to be remapped"
              )
            })}
            {/* ---------------- Launch -------------------*/}
            {renderCheckbox("launch", t("Launch"), launch, {
              id: TOOLTIP.launch,
              title: t("Launch"),
              description: t(
                "Controls whether the Node is to be launched or not"
              )
            })}
          </Typography>
          <TextField
            label={t("Path")}
            disabled={!editable}
            className={classes.textField}
            value={path}
            onChange={evt => onChangePath(evt.target.value)}
            margin="normal"
            variant="outlined"
          />
        </AccordionDetails>
      </Accordion>
    </Typography>
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
  return _isEqual(prevProps, nextProps);
}

export default memo(ExecutionParameters, arePropsEqual);
