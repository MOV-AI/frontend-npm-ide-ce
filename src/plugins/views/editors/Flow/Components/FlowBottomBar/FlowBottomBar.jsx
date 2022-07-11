import React, { useEffect, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import WarningIcon from "@material-ui/icons/Warning";
import { makeStyles } from "@material-ui/styles";
import {
  Typography,
  Tooltip,
  FormControlLabel,
  Switch
} from "@material-ui/core";
import { RobotManager, Document } from "@mov-ai/mov-fe-lib-core";
import { defaultFunction } from "../../../../../../utils/Utils";
import styles from "./styles";

const useStyles = makeStyles(styles);

const FlowBottomBar = props => {
  // State(s)
  const [barStatus, setBarStatus] = useState("default");
  const [allRobots, setRobots] = useState({});
  const [selectedRobotName, setSelectedRobotName] = useState("");

  // Translation hook
  const { t } = useTranslation();

  // Prop(s)
  const {
    onToggleWarnings,
    robotSelected,
    runningFlow,
    warnings,
    warningVisibility,
    flowDebugging = false,
    toggleFlowDebug
  } = props;

  // Hook(s)
  const classes = useStyles();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  const updateRobots = useCallback(changedRobots => {
    setRobots(prevState => {
      const newState = {};
      Object.keys(changedRobots).forEach(id => {
        newState[id] = changedRobots[id];
      });
      return { ...prevState, ...newState };
    });
  }, []);

  const parseFlowName = flowName => {
    return flowName.replace("/__UNVERSIONED__", "");
  };

  const handleOpenFlow = event => {
    const doc = new Document({ path: runningFlow });
    const { workspace, type, name, version } = doc;

    props.openFlow({
      id: name,
      scope: type,
      workspace,
      name,
      version,
      ctrlKey: event.ctrlKey
    });
  };

  /**
   * Toggle warnings visibility in canvas
   */
  const toggleVisibility = useCallback(() => {
    if (!warnings.length) return;
    // Toggle warnings if there's any
    onToggleWarnings(!warningVisibility);
  }, [warnings, onToggleWarnings, warningVisibility]);

  //========================================================================================
  /*                                                                                      *
   *                                    React lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    const robotManager = new RobotManager();
    robotManager.getAll(robots => setRobots(robots));
    const subscriberId = robotManager.subscribeToChanges(updateRobots);
    // Unsubscribe to changes on component unmount
    return () => {
      robotManager.unsubscribeToChanges(subscriberId);
    };
  }, [updateRobots]);

  useEffect(() => {
    const status = runningFlow ? "active" : "default";
    setBarStatus(status);
    // Set selected robot name
    if (robotSelected && status === "active") {
      const robotName = allRobots[robotSelected]?.RobotName || "";
      setSelectedRobotName(robotName);
    }
  }, [robotSelected, allRobots, runningFlow]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <Typography
      data-testid="section_flow-bottom-bar"
      component="div"
      className={`${classes.bar} ${classes[barStatus]}`}
    >
      <Typography
        component="div"
        className={classes.debugToggle}
        data-testid="section_flow-toggle-debug"
      >
        <Tooltip title={t("ToggleFlowDebugDescription")}>
          <FormControlLabel
            control={
              <Switch
                inputProps={{ "data-testid": "input_toggle-debug" }}
                checked={flowDebugging}
                onChange={toggleFlowDebug}
                name="toggleFlowDebug"
                color="primary"
              />
            }
            label={t("ToggleFlowDebug")}
          />
        </Tooltip>
      </Typography>
      <Typography component="div">
        {runningFlow && (
          <Tooltip
            classes={{ tooltip: classes.tooltip }}
            title={`The selected robot is running: ${parseFlowName(
              runningFlow
            )}`}
          >
            <Typography
              data-testid="input_open-flow"
              component="div"
              className={classes.action}
              onClick={evt => handleOpenFlow(evt)}
            >
              <i className="icon-Happy"></i>
              {selectedRobotName} : {parseFlowName(runningFlow)}
            </Typography>
          </Tooltip>
        )}
        <Tooltip title="Show warnings" classes={{ tooltip: classes.tooltip }}>
          <Typography
            data-testid="input_show-warnings"
            component="div"
            className={`${classes.action} ${classes.alignRight} ${
              warningVisibility ? classes.actionActive : ""
            }`}
            onClick={toggleVisibility}
          >
            <WarningIcon fontSize="small" /> {warnings.length}
          </Typography>
        </Tooltip>
      </Typography>
    </Typography>
  );
};

FlowBottomBar.propTypes = {
  openFlow: PropTypes.func,
  toggleFlowDebug: PropTypes.func,
  robotSelected: PropTypes.string,
  runningFlow: PropTypes.string,
  flowDebugging: PropTypes.bool
};

FlowBottomBar.defaultProps = {
  openFlow: () => defaultFunction("openFlow"),
  robotSelected: "",
  runningFlow: ""
};

export default FlowBottomBar;
