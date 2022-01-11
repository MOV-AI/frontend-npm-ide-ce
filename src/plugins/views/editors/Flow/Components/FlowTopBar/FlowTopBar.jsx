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
import { FLOW_VIEW_MODE, ROBOT_BLACKLIST } from "../../Constants/constants";
import { DEFAULT_FUNCTION, useTranslation } from "../../../_shared/mocks";
import Workspace from "../../../../../../utils/Workspace";

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

/***
 *  
    // const FEEDBACK_TIMEOUT = 10000;
 */

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
  const { call, alert, scope, onRobotChange, onViewModeChange } = props;
  // State hooks
  const [loading, setLoading] = React.useState(false);
  const [robotStatus, setRobotStatus] = React.useState({
    activeFlow: "",
    robotOnline: true
  });
  const [robotSelected, setRobotSelected] = React.useState("");
  const [robotList, setRobotList] = React.useState({});
  const [viewMode, setViewMode] = React.useState(FLOW_VIEW_MODE.default);
  // Other hooks
  const classes = useStyles();
  const { t } = useTranslation();
  // Refs
  const buttonDOMRef = React.useRef();
  const helperRef = React.useRef();
  // Managers Memos
  const robotManager = React.useMemo(() => new RobotManager(), []);
  const workspaceManager = React.useMemo(() => new Workspace(), []);

  //========================================================================================
  /*                                                                                      *
   *                                      Subscribers                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Subscribe to changes in robot status
   * @param {string} robotId : Robot ID
   */
  const robotSubscribe = useCallback(robotId => {
    console.log("debug robotSubscribe", robotId, setRobotStatus);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Reset node status
   */
  const resetNodeStatus = useCallback(() => {
    console.log("debug resetNodeStatus");
  }, []);

  /**
   * @private Unsubscribe current selected robot
   */
  const robotUnsubscribe = useCallback(() => {
    if (robotSelected) {
      resetNodeStatus();
      robotManager.getRobot(robotSelected).unsubscribe({ property: "Status" });
    }
  }, [resetNodeStatus, robotManager, robotSelected]);

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
      console.log("debug store helper", helper);
      helper
        .getDefaultRobot()
        .then(robotId => {
          console.log("debug store robotId", robotId);
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
  }, [robotStatus.activeFlow]);

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  const { activeFlow, robotOnline } = robotStatus;

  const isFlowRunning = useCallback(flowName => {
    console.log("debug isFlowRunning ?", flowName);
    return false;
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                        Events                                        *
   *                                                                                      */
  //========================================================================================

  const handleChangeRobot = useCallback(() => {
    console.log("debug handleChangeRobot");
  }, []);

  const sendActionToRobot = useCallback(action => {
    console.log("debug sendActionToRobot", action);
  }, []);

  const handleStartFlow = useCallback(() => {
    console.log("debug handleStartFlow");
  }, []);

  const handleStopFlow = useCallback(() => {
    sendActionToRobot("STOP");
  }, [sendActionToRobot]);

  /**
   *
   * @param {*} _
   * @param {*} newViewMode
   * @returns
   */
  const handleViewModeChange = useCallback(
    (_, newViewMode) => {
      if (!newViewMode) return;
      setViewMode(newViewMode);
      onViewModeChange(newViewMode);
    },
    [onViewModeChange]
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  /**
   *
   * @returns
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
   *
   * @returns
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
          {isFlowRunning(activeFlow) ? (
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
              disabled={!robotOnline || loading}
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
            <ToggleButton value={FLOW_VIEW_MODE.treeView}>
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
  nodeCompleteStatusUpdated: () => DEFAULT_FUNCTION("completeStatusUpdated"),
  workspace: "global",
  type: "Flow",
  version: "__UNVERSIONED__"
};

export default FlowTopBar;
