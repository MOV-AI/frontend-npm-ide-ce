import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef
} from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Tooltip,
  Button,
  CircularProgress
} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import { RobotManager } from "@mov-ai/mov-fe-lib-core";
import Workspace from "../../../../../../utils/Workspace";
import {
  SCOPES,
  PLUGINS,
  GLOBAL_WORKSPACE,
  ALERT_SEVERITIES
} from "../../../../../../utils/Constants";
import { ERROR_MESSAGES } from "../../../../../../utils/Messages";
import { defaultFunction } from "../../../../../../utils/Utils";
import { ROBOT_BLACKLIST } from "../../Constants/constants";
import useNodeStatusUpdate from "./hooks/useNodeStatusUpdate";

import { buttonStyles, flowTopBarStyles } from "./styles";

const BACKEND_CALLBACK_NAME = "backend.FlowTopBar";
const FEEDBACK_TIMEOUT = 10000;

const ButtonTopBar = forwardRef((props, ref) => {
  const { disabled, onClick, children, testId = "input_top-bar" } = props;
  const classes = buttonStyles();
  return (
    <Button
      data-testid={testId}
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
    name,
    onRobotChange,
    defaultViewMode,
    confirmationAlert
    // onViewModeChange
  } = props;
  // State hooks
  const [loading, setLoading] = useState(false);
  const [robotSelected, setRobotSelected] = useState("");
  const [robotList, setRobotList] = useState({});
  const [viewMode, setViewMode] = useState(defaultViewMode);
  // Other hooks
  const classes = flowTopBarStyles();
  const { t } = useTranslation();
  const { robotSubscribe, robotUnsubscribe, getFlowPath, robotStatus } =
    useNodeStatusUpdate(props, robotSelected, viewMode);
  // Refs
  const buttonDOMRef = useRef();
  const helperRef = useRef();
  const commandRobotTimeoutRef = useRef();
  const isMounted = useRef();
  const flowInstanceRef = useRef();
  // Managers Memos
  const robotManager = useMemo(() => new RobotManager(), []);
  const workspaceManager = useMemo(() => new Workspace(), []);

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
    return call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.GET_STORE,
      scope
    ).then(store => {
      helperRef.current = store.helper;
      return store.helper;
    });
  }, [call, scope]);

  /**
   * @private Get store helper to use cloud functions
   */
  const initFlowInstance = useCallback(() => {
    return call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.READ, {
      scope,
      name
    }).then(document => {
      flowInstanceRef.current = document;
      return document;
    });
  }, [call, scope, name]);

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
    (currentRobot, robots) => {
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
            let robotToSelect = currentRobot;
            if (!currentRobot || !(currentRobot in robots)) {
              workspaceManager.setSelectedRobot(robotId);
              initSelectedRobot(robotId);
              robotToSelect = robotId;
            }
            // Set selected robot
            setRobotSelected(robotToSelect);
          }
        })
        .catch(err => {
          console.warn("getRunningRobot error", err);
          alert({
            message: t(ERROR_MESSAGES.ERROR_RUNNING_SPECIFIC_CALLBACK, {
              callbackName: BACKEND_CALLBACK_NAME
            }),
            severity: ALERT_SEVERITIES.ERROR
          });
        });
    },
    [initSelectedRobot, workspaceManager, alert, t]
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
      // Get running Robot
      getRunningRobot(currentSelected, robots);
    },
    [getRunningRobot, workspaceManager]
  );

  /**
   * On component mount
   */
  useEffect(() => {
    // Load store loader and robot list
    initStoreHelper().then(() => {
      robotManager.getAll(onLoadRobotList);
    });
    // Load flow instance
    initFlowInstance();
    // Set isMounted
    isMounted.current = true;

    /**
     * On component unmount
     */
    return () => {
      // TEMPORARY HACK: Added log to remove warning of unused
      // Once that handleViewModeChange method is uncommented, this should be removed
      console.log(setViewMode);
      robotUnsubscribe();
      // Unmount
      isMounted.current = false;
    };
  }, [
    initFlowInstance,
    initStoreHelper,
    onLoadRobotList,
    robotManager,
    robotUnsubscribe
  ]);

  /**
   * Finish loading when there's an update on activeFlow
   */
  useEffect(() => {
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
      // let's validate flow before continuing
      graph?.validateFlow();

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
    (action, flowPath) => {
      const canStart = canRunFlow(action);
      if (!canStart) return;
      setLoading(true);
      // Send action to robot
      helperRef.current
        .sendToRobot({
          action,
          flowPath: flowPath || getFlowPath(),
          robotId: robotSelected
        })
        .then(res => {
          if (!res) return;
          commandRobotTimeoutRef.current = setTimeout(() => {
            // If flow reloads (creation of a new) the old is unmounted
            if (!isMounted.current) return;
            // Set loading false and show error message
            setLoading(false);
            alert({
              message: t("FailedFlowAction", {
                action: t(action.toLowerCase())
              }),
              severity: ALERT_SEVERITIES.ERROR
            });
          }, FEEDBACK_TIMEOUT);
        })
        .catch(err => {
          console.warn("Error sending action to robot", err);
          alert({
            message: t(ERROR_MESSAGES.ERROR_RUNNING_SPECIFIC_CALLBACK, {
              callbackName: BACKEND_CALLBACK_NAME
            }),
            severity: ALERT_SEVERITIES.ERROR
          });
        });
      if (buttonDOMRef.current) buttonDOMRef.current.blur();
    },
    [alert, canRunFlow, getFlowPath, robotSelected, setLoading, t]
  );

  /**
   * Handle Start flow button click
   */
  const handleStartFlow = useCallback(
    saveResponse => {
      // Start Flow if there's no active flow
      const flowUrl = saveResponse?.model?.getUrl();
      if (robotStatus.activeFlow === "") {
        sendActionToRobot("START", flowUrl);
      } else {
        // Confirmation alert if Another flow is running!
        const title = t("AnotherFlowRunningConfirmationTitle");
        const message = t("AnotherFlowRunningConfirmationMessage", {
          robotName: robotList[robotSelected].RobotName,
          activeFlow: robotStatus.activeFlow,
          id: id
        });
        confirmationAlert({
          title,
          message,
          submitText: t("Run"),
          onSubmit: () => sendActionToRobot("START", flowUrl)
        });
      }
    },
    [
      robotStatus.activeFlow,
      sendActionToRobot,
      t,
      robotList,
      robotSelected,
      id,
      confirmationAlert
    ]
  );

  /**
   * Handle Stop flow button click
   */
  const handleStopFlow = useCallback(() => {
    sendActionToRobot("STOP");
  }, [sendActionToRobot]);

  /**
   * Handle Save before starting a flow
   */
  const handleSaveBeforeStart = useCallback(() => {
    const isDirty = flowInstanceRef.current?.getDirty();
    if (isDirty) {
      call(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.CALL.SAVE,
        {
          scope,
          name
        },
        handleStartFlow
      );
    } else {
      handleStartFlow();
    }
  }, [call, handleStartFlow, name, scope]);

  /**
   * Handle view mode change : default view to tree view
   * @param {Event} event : Event change
   * @param {string} newViewMode : New value
   * @returns
   */
  // Commented out for posterity
  // const handleViewModeChange = useCallback(
  //   (_event, newViewMode) => {
  //     if (!newViewMode) return;
  //     setViewMode(prevState => {
  //       if (prevState === newViewMode) return prevState;
  //       onViewModeChange(newViewMode);
  //       return newViewMode;
  //     });
  //   },
  //   [onViewModeChange]
  // );

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
      <Tooltip title={t("StartFlow")}>
        <>
          <PlayArrowIcon /> {t("SaveAndRun")}
        </>
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
      <Tooltip title={t("StopFlow")}>
        <StopIcon />
      </Tooltip>
    );
  }, [loading, t]);

  return (
    <AppBar
      data-testid="section-flow-top-bar"
      position="static"
      color="inherit"
    >
      <Toolbar variant="dense">
        <Typography component="div" className={classes.grow}>
          <FormControl className={classes.formControl}>
            <Select
              inputProps={{ "data-testid": "input_change-robot" }}
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
              testId="input_stop-flow"
              ref={buttonDOMRef}
              disabled={loading}
              onClick={handleStopFlow}
            >
              {renderStopButton()}
            </ButtonTopBar>
          ) : (
            <ButtonTopBar
              testId="input_save-before-start"
              ref={buttonDOMRef}
              disabled={!robotStatus.isOnline || loading}
              onClick={handleSaveBeforeStart}
            >
              {renderStartButton()}
            </ButtonTopBar>
          )}
        </Typography>
        <Typography
          data-testid="section_view-mode-toggle"
          component="div"
          className={classes.visualizationToggle}
        >
          {/* <ToggleButtonGroup
            exclusive
            size="small"
            value={viewMode}
            onChange={handleViewModeChange}
          >
            <ToggleButton data-testid="input_default-flow" value={FLOW_VIEW_MODE.default}>
              <Tooltip title={t("DefaultFlowView")}>
                <GrainIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton data-testid="input_tree-view-flow" value={FLOW_VIEW_MODE.treeView} disabled>
              <Tooltip title={t("TreeView")}>
                <i className="icon-tree" style={{ fontSize: "1.2rem" }}></i>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup> */}
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
  openFlow: () => defaultFunction("openFlow"),
  onRobotChange: () => defaultFunction("onRobotChange"),
  onViewModeChange: () => defaultFunction("onViewModeChange"),
  onStartStopFlow: () => defaultFunction("onStartStopFlow"),
  nodeStatusUpdated: () => defaultFunction("nodeStatusUpdated"),
  nodeCompleteStatusUpdated: () => defaultFunction("completeStatusUpdated"),
  workspace: GLOBAL_WORKSPACE,
  type: SCOPES.FLOW,
  version: "__UNVERSIONED__"
};

export default FlowTopBar;
