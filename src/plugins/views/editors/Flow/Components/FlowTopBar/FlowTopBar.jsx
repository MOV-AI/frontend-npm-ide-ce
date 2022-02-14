import React, { useCallback } from "react";
import PropTypes from "prop-types";
import GrainIcon from "@material-ui/icons/Grain";
import { makeStyles } from "@material-ui/core/styles";
import {
  Typography,
  Tooltip,
  Button,
  CircularProgress
} from "@material-ui/core";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import { RobotManager } from "@mov-ai/mov-fe-lib-core";
import Workspace from "../../../../../../utils/Workspace";
import { DEFAULT_FUNCTION, useTranslation } from "../../../_shared/mocks";
import { FLOW_VIEW_MODE, ROBOT_BLACKLIST } from "../../Constants/constants";
import useNodeStatusUpdate from "./hooks/useNodeStatusUpdate";

const useStyles = makeStyles(theme => ({
  flowLink: {
    textDecoration: "underline",
    cursor: "pointer"
  },
  buttonPill: {
    borderRadius: "99px"
  },
  defaultRobot: {
    fontWeight: "bold"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 170,
    maxWidth: 350,
    "& i": {
      marginRight: 15
    }
  },
  whichFlowText: {
    marginLeft: theme.spacing(5),
    fontSize: "15px",
    flexGrow: 1
  },
  visualizationToggle: {
    marginRight: "10px"
  },
  grow: {
    flexGrow: 1
  }
}));

const FEEDBACK_TIMEOUT = 10000;

const ButtonTopBar = React.forwardRef((props, ref) => {
  const { disabled, onClick, children } = props;
  const classes = useStyles();
  return (
    <Button
      ref={ref}
      size="small"
      color="primary"
      variant="contained"
      disabled={disabled}
      className={classes.buttonPill}
      onClick={onClick}
    >
      {children}
    </Button>
  );
});

const FlowTopBar = props => {
  // Props
  const {
    call,
    alert,
    scope,
    mainInterface,
    id,
    onRobotChange,
    defaultViewMode,
    confirmationAlert,
    onViewModeChange
  } = props;
  // State hooks
  const [loading, setLoading] = React.useState(false);
  const [robotSelected, setRobotSelected] = React.useState("");
  const [robotList, setRobotList] = React.useState({});
  const [viewMode, setViewMode] = React.useState(defaultViewMode);
  // Other hooks
  const classes = useStyles();
  const { t } = useTranslation();
  const { robotSubscribe, robotUnsubscribe, getFlowPath, robotStatus } =
    useNodeStatusUpdate(props, robotSelected, viewMode);
  // Refs
  const buttonDOMRef = React.useRef();
  const helperRef = React.useRef();
  const commandRobotTimeoutRef = React.useRef();
  // Managers Memos
  const robotManager = React.useMemo(() => new RobotManager(), []);
  const workspaceManager = React.useMemo(() => new Workspace(), []);

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Change robot subscriber (on change of selected robot)
   * @param {String} robotId : New selected robot
   */
  const changeRobotSubscriber = useCallback(
    robotId => {
      robotUnsubscribe();
      robotSubscribe(robotId);
    },
    [robotSubscribe, robotUnsubscribe]
  );

  /**
   * @private Get store helper to use cloud functions
   */
  const initStoreHelper = useCallback(() => {
    return call("docManager", "getStore", scope).then(store => {
      helperRef.current = store.helper;
      return store.helper;
    });
  }, [call, scope]);

  /**
   * @private Init selected robot
   * @param {string} robotId : Robot ID
   */
  const initSelectedRobot = useCallback(
    robotId => {
      setRobotSelected(robotId);
      robotSubscribe(robotId);
      onRobotChange(robotId);
    },
    [onRobotChange, robotSubscribe]
  );

  /**
   * Get running default robot
   * @param {String} currentRobot : current selected robot id
   */
  const getRunningRobot = useCallback(
    currentRobot => {
      // If there's a currently selected robot in local storage
      if (currentRobot) initSelectedRobot(currentRobot);
      // Call callback to get default robot
      const helper = helperRef.current;
      helper
        .getDefaultRobot()
        .then(robotId => {
          // Update default robot in state and set as selected if there's none
          if (robotId) {
            setRobotList(prevState => {
              return {
                ...prevState,
                [robotId]: { ...prevState[robotId], isDefault: true }
              };
            });
            // Update Flow selected robot if none is selected yet
            if (!currentRobot) {
              workspaceManager.setSelectedRobot(robotId);
              initSelectedRobot(robotId);
            }
          }
        })
        .catch(err => {
          console.log("getRunningRobot error", err);
          alert({
            message: "Error running backend.FlowTopBar callback",
            severity: "error"
          });
        });
    },
    [initSelectedRobot, workspaceManager, alert]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * On Load Robot List
   * @param {object} robots : All robots load from robotManager
   */
  const onLoadRobotList = useCallback(
    robots => {
      const currentSelected = workspaceManager.getSelectedRobot();
      // Remove blacklisted robots
      Object.keys(robots).forEach(robotId => {
        if (ROBOT_BLACKLIST.includes(robots[robotId].RobotName))
          delete robots[robotId];
      });
      // Update state hooks
      setRobotList(robots);
      setRobotSelected(currentSelected);
      // Get running Robot
      getRunningRobot(currentSelected);
    },
    [getRunningRobot, workspaceManager]
  );

  /**
   * On component mount
   */
  React.useEffect(() => {
    // Load store loader and robot list
    initStoreHelper().then(() => {
      robotManager.getAll(onLoadRobotList);
    });
  }, [robotManager, onLoadRobotList, initStoreHelper]);

  /**
   * On component unmount
   */
  React.useEffect(() => {
    // On unmount
    return () => {
      robotUnsubscribe();
    };
  }, [robotUnsubscribe]);

  /**
   * Finish loading when there's an update on activeFlow
   */
  React.useEffect(() => {
    setLoading(false);
    clearTimeout(commandRobotTimeoutRef.current);
  }, [robotStatus.activeFlow, setLoading]);

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Check if can start flow
   * @param {string} action : One of values: "START" or "STOP"
   * @returns {boolean} True if can run flow and False otherwise
   */
  const canRunFlow = useCallback(
    action => {
      const graph = mainInterface.current?.current?.graph;
      const warnings = graph?.warnings || [];
      const warningsVisibility = graph.warningsVisibility;
      const runtimeWarnings = warnings.filter(wn => wn.isRuntime);
      runtimeWarnings.forEach(warning => {
        graph.setPermanentWarnings(warning);
        if (!warningsVisibility)
          alert({
            message: runtimeWarnings[0].message,
            severity: runtimeWarnings[0].type
          });
      });
      return !(runtimeWarnings.length && action === "START");
    },
    [alert, mainInterface]
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle change of selected robot
   * @param {Event} event : Change native event
   */
  const handleChangeRobot = useCallback(
    event => {
      setRobotSelected(prevState => {
        const robotId = event.target.value;
        if (robotId !== prevState) {
          // Set in local storage
          workspaceManager.setSelectedRobot(robotId);
          // Change subscriber and update state
          changeRobotSubscriber(robotId);
          onRobotChange(robotId);
          return robotId;
        }
        return prevState;
      });
    },
    [changeRobotSubscriber, onRobotChange, workspaceManager]
  );

  /**
   * Send action to start robot
   * @param {*} action
   * @returns To avoid starting flow if flow is not eligible to start
   */
  const sendActionToRobot = useCallback(
    action => {
      const canStart = canRunFlow(action);
      if (!canStart) return;
      setLoading(true);
      // Send action to robot
      helperRef.current
        .sendToRobot({
          action,
          flowPath: getFlowPath(),
          robotId: robotSelected
        })
        .then(res => {
          if (!res) return;
          commandRobotTimeoutRef.current = setTimeout(() => {
            setLoading(false);
            alert({
              message: `Failed to ${action.toLowerCase()} flow`,
              severity: "error"
            });
          }, FEEDBACK_TIMEOUT);
        })
        .catch(err => {
          alert({
            message: "Error running backend.FlowTopBar callback",
            severity: "error"
          });
        });
      if (buttonDOMRef.current) buttonDOMRef.current.blur();
    },
    [alert, canRunFlow, getFlowPath, robotSelected, setLoading]
  );

  /**
   * Handle Start flow button click
   */
  const handleStartFlow = useCallback(() => {
    // Start Flow if there's no active flow
    if (robotStatus.activeFlow === "") {
      sendActionToRobot("START");
    } else {
      // Confirmation alert if Another flow is running!
      const title = "Another flow is running!";
      const message = `"${robotList[robotSelected].RobotName}" is running flow "${robotStatus.activeFlow}".\nAre you sure you want to run the flow "${id}"?`;
      confirmationAlert({
        title,
        message,
        submitText: "Run",
        onSubmit: () => sendActionToRobot("START")
      });
    }
  }, [
    id,
    robotStatus.activeFlow,
    robotList,
    robotSelected,
    confirmationAlert,
    sendActionToRobot
  ]);

  /**
   * Handle Stop flow button click
   */
  const handleStopFlow = useCallback(() => {
    sendActionToRobot("STOP");
  }, [sendActionToRobot]);

  /**
   * Handle view mode change : default view to tree view
   * @param {Event} _ : Event change
   * @param {string} newViewMode : New value
   * @returns
   */
  const handleViewModeChange = useCallback(
    (_, newViewMode) => {
      if (!newViewMode) return;
      setViewMode(prevState => {
        if (prevState === newViewMode) return prevState;
        onViewModeChange(newViewMode);
        return newViewMode;
      });
    },
    [onViewModeChange]
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Start button content
   * @returns {ReactElement} CircularProgress to indicate loading or play icon with tooltip
   */
  const renderStartButton = useCallback(() => {
    // Render circular progress if loading
    return loading ? (
      <CircularProgress size={25} color="inherit" />
    ) : (
      <Tooltip title={t("Start Flow")}>
        <PlayArrowIcon />
      </Tooltip>
    );
  }, [loading, t]);

  /**
   * Render Stop button content
   * @returns {ReactElement} CircularProgress to indicate loading or Stop icon with tooltip
   */
  const renderStopButton = useCallback(() => {
    // Render circular progress if loading
    return loading ? (
      <CircularProgress size={25} color="inherit" />
    ) : (
      <Tooltip title={t("Stop Flow")}>
        <StopIcon />
      </Tooltip>
    );
  }, [loading, t]);

  return (
    <AppBar position="static" color="inherit">
      <Toolbar variant="dense">
        <Typography component="div" className={classes.grow}>
          <FormControl className={classes.formControl}>
            <Select
              id="robot-selector"
              value={robotSelected}
              startAdornment={<i className="icon-Happy"></i>}
              onChange={handleChangeRobot}
            >
              {Object.keys(robotList).map((robotId, robotIndex) => {
                const isDefaultRobot = robotList[robotId].isDefault;
                return (
                  <MenuItem
                    key={`robotList-${robotIndex}`}
                    value={robotId}
                    className={isDefaultRobot ? classes.defaultRobot : ""}
                  >
                    {robotList[robotId].RobotName}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          {getFlowPath() === robotStatus.activeFlow ? (
            <ButtonTopBar
              ref={buttonDOMRef}
              disabled={loading}
              onClick={handleStopFlow}
            >
              {renderStopButton()}
            </ButtonTopBar>
          ) : (
            <ButtonTopBar
              ref={buttonDOMRef}
              disabled={!robotStatus.isOnline || loading}
              onClick={handleStartFlow}
            >
              {renderStartButton()}
            </ButtonTopBar>
          )}
        </Typography>
        <Typography component="div" className={classes.visualizationToggle}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={viewMode}
            onChange={handleViewModeChange}
          >
            <ToggleButton value={FLOW_VIEW_MODE.default}>
              <Tooltip title={t("Main flow view")}>
                <GrainIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value={FLOW_VIEW_MODE.treeView} disabled>
              <Tooltip title={t("Tree view")}>
                <i className="icon-tree" style={{ fontSize: "1.2rem" }}></i>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

FlowTopBar.propTypes = {
  id: PropTypes.string,
  nodeStatusUpdated: PropTypes.func,
  nodeCompleteStatusUpdated: PropTypes.func,
  onViewModeChange: PropTypes.func,
  onStartStopFlow: PropTypes.func,
  onRobotChange: PropTypes.func,
  openFlow: PropTypes.func,
  workspace: PropTypes.string,
  type: PropTypes.string,
  version: PropTypes.string
};

FlowTopBar.defaultProps = {
  openFlow: () => DEFAULT_FUNCTION("openFlow"),
  onRobotChange: () => DEFAULT_FUNCTION("onRobotChange"),
  onViewModeChange: () => DEFAULT_FUNCTION("onViewModeChange"),
  onStartStopFlow: () => DEFAULT_FUNCTION("onStartStopFlow"),
  nodeStatusUpdated: () => DEFAULT_FUNCTION("nodeStatusUpdated"),
  nodeCompleteStatusUpdated: () => DEFAULT_FUNCTION("completeStatusUpdated"),
  workspace: "global",
  type: "Flow",
  version: "__UNVERSIONED__"
};

export default FlowTopBar;
