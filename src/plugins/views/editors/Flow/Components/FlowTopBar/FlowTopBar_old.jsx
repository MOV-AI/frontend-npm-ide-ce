import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import GrainIcon from "@material-ui/icons/Grain";
import {
  Typography,
  Tooltip,
  Button,
  CircularProgress
} from "@material-ui/core";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import MasterComponent from "../../../MasterComponent/MasterComponent";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import StopIcon from "@material-ui/icons/Stop";
import PropTypes from "prop-types";
import isEqual from "lodash.isequal";
import _get from "lodash/get";
import { FLOW_VIEW_MODE } from "../../Constants/constants";
import { Document, RobotManager, MasterDB } from "@mov-ai/mov-fe-lib-core";
import { withTranslation } from "react-i18next";
import { robotBlackList } from "../../../../constants/constants";
import LocalStorage from "../../../_shared/LocalStorage/LocalStorage";
import { DEFAULT_FUNCTION } from "../../../_shared/mocks";

const styles = theme => ({
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
});

const SELECTED_ROBOT_KEY = "movai.selectedRobot";
const FEEDBACK_TIMEOUT = 10000;

class FlowTopBar extends Component {
  state = {
    viewMode: FLOW_VIEW_MODE.default,
    robotList: {},
    robotSelected: "",
    isLoading: false,
    activeFlowInfo: null,
    robotStatus: {
      active_flow: "",
      robotOnline: true //let's assume the default is online
    }
  };
  robotManager = new RobotManager();
  commandRobotTimeout = null;
  node_status_view_mode = FLOW_VIEW_MODE.default;
  node_status = {};
  all_nodes_status = {};
  debounceTime = 600; // ms
  debounceDelta = Date.now();
  robotOfflineTime = 8; // sec
  watchdog_timeout = 10000; // milisec
  watchdog_timer = null;

  //========================================================================================
  /*                                                                                      *
   *                                      Subscribers                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Subscribe to changes in selected robot
   * @param {String} robotId
   */
  robotSubscribe = robotId => {
    const robot = this.robotManager.getRobot(robotId);
    const robotStatus = robot.data?.Status;
    // Set robot status from robot manager data (if any)
    if (robotStatus) {
      this.props.onStartStopFlow(robotStatus.active_flow);
      this.setState(prevState => {
        return {
          robotStatus: {
            ...prevState.robotStatus,
            active_flow: robotStatus.active_flow
          }
        };
      });
    }
    // Subscribe to status change
    robot.subscribe({
      property: "Status",
      onLoad: data => {
        this.updateStatus("value", robotId, data);
      },
      onUpdate: updateData => {
        if (updateData.event === "hset") {
          if (robotId !== this.state.robotSelected) return;
          this.updateStatus("key", robotId, updateData);
        }
      }
    });
  };

  /**
   * Unsubscribe current selected robot
   */
  robotUnsubscribe = () => {
    if (!!this.state.robotSelected) {
      this.resetNodeStatus();
      const robotId = this.state.robotSelected;
      this.robotManager.getRobot(robotId).unsubscribe({ property: "Status" });
    }
  };

  /**
   * Reset all node status to false
   */
  resetNodeStatus = () => {
    const emptyNodeStatus = {};
    const emptyAllNodeStatus = {};
    // Reset node_status
    Object.keys(this.node_status).forEach(node => {
      emptyNodeStatus[node] = 0;
    });
    // Reset all_nodes_status
    Object.keys(this.all_nodes_status).forEach(node => {
      emptyAllNodeStatus[node] = 0;
    });
    // Update local variables
    this.node_status = emptyNodeStatus;
    this.all_nodes_status = emptyAllNodeStatus;
    // Send updates to canvas
    this.props.nodeStatusUpdated(emptyNodeStatus);
    this.props.nodeCompleteStatusUpdated(emptyAllNodeStatus);
  };

  /**
   * Change robot subscriber (on change of selected robot)
   * @param {String} robotId : New selected robot
   */
  changeRobotSubscriber = robotId => {
    this.robotUnsubscribe();
    this.robotSubscribe(robotId);
  };

  //========================================================================================
  /*                                                                                      *
   *                                        getters                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Get running default robot
   * @param {String} currentRobot : current selected robot id
   */
  getRunningRobot = currentRobot => {
    // If there's a currently selected robot in local storage
    if (currentRobot) this.initSelectedRobot(currentRobot);
    // Call callback to get default robot
    try {
      MasterDB.cloudFunction(
        "backend.FlowTopBar",
        "getDefaultRobot", // function
        "", // args
        res => {
          const robotId = res?.result?.robotName;
          const robotList = { ...this.state.robotList };
          // Update default robot in state and set as selected if there's none
          if (res.success) {
            robotList[robotId].isDefault = true;
            this.setState({ robotList });
            // Update Flow selected robot if none is selected yet
            if (!currentRobot) {
              LocalStorage.set(SELECTED_ROBOT_KEY, robotId);
              this.initSelectedRobot(robotId);
            }
          }
        }
      );
    } catch (error) {
      console.warn("getRunningRobot error", error);
      MasterComponent.alert(
        "Error running backend.FlowTopBar callback",
        MasterComponent.ALERTS.error
      );
    }
  };

  getNodesToUpdate = (prevNodesStatus, nodes, splitContainer = true) => {
    // {<node name> :< status>, ...} where status can be 1 (running) or 0 (stopped and to be removed in the next ui update)
    const nextNodesStatus = {};

    // remove nodes with status = 0 and set status to 0 of the remaining ones (previously 1)
    Object.entries(prevNodesStatus)
      .filter(obj => obj[1] === 1) // remove already stopped nodes
      .forEach(obj => (nextNodesStatus[obj[0]] = 0)); // set all nodes to stopped

    nodes
      .map(el => {
        // nodes running in subFlows are named as <subFlow inst name>__<node name>
        // ex.: node running as ctest__test => subFlow is ctest and the node name is test
        const [node] = el.split(/__/);
        return splitContainer ? node : el;
      })
      .forEach(node => (nextNodesStatus[node] = 1)); // set node state to running

    return nextNodesStatus;
  };

  getFlowPath = () => {
    const { workspace, type, id, version } = this.props;
    const _version = ["-", ""].includes(version) ? "__UNVERSIONED__" : version;

    return `${workspace}/${type}/${id}/${_version}`;
  };

  //========================================================================================
  /*                                                                                      *
   *                                   React Lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  componentDidMount() {
    // Get the list of all the Robots for the selector
    this.robotManager.getAll(this.onLoadRobotList);
  }

  componentWillUnmount() {
    this.robotUnsubscribe();
    clearTimeout(this.watchdog_timer);
  }

  componentDidUpdate(prevProps, prevState) {
    // Update active flow info message
    const prevActiveFlow = prevState.robotStatus?.active_flow;
    const activeFlow = this.state.robotStatus?.active_flow;
    if (prevActiveFlow !== activeFlow) {
      clearTimeout(this.commandRobotTimeout);
      this.setState({ isLoading: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const changeState = !isEqual(nextState, this.state);
    const changePropsClasses = !isEqual(nextProps.classes, this.props.classes);
    return changeState || changePropsClasses;
  }

  //========================================================================================
  /*                                                                                      *
   *                                   Handler Functions                                  *
   *                                                                                      */
  //========================================================================================

  onlineAlert = online => {
    const msg = online
      ? { text: "Robot is online", type: "info" }
      : { text: "Robot is offline", type: "warning" };
    if (online !== this.state.robotStatus.robotOnline) {
      MasterComponent.alert(msg.text, MasterComponent.ALERTS[msg.type]);
    }
  };

  /**
   * On load robot list
   * @param {Object} robots : All robots from robot manager
   */
  onLoadRobotList = robots => {
    const currentSelected = LocalStorage.get(SELECTED_ROBOT_KEY, "");
    // Remove blacklisted robots
    Object.keys(robots).forEach(robotId => {
      if (robotBlackList.includes(robots[robotId].RobotName))
        delete robots[robotId];
    });
    this.setState({ robotList: robots, robotSelected: currentSelected }, () =>
      this.getRunningRobot(currentSelected)
    );
    this.resetWatchDog();
  };

  /**
   * Call functions to initiate selected robot
   * @param {String} robotId
   */
  initSelectedRobot = robotId => {
    this.setState({ robotSelected: robotId });
    this.robotSubscribe(robotId);
    this.props.onRobotChange(robotId);
  };

  resetWatchDog = () => {
    if (this.watchdog_timer) clearTimeout(this.watchdog_timer);
    this.watchdog_timer = setTimeout(() => {
      this.updateStatus("key", this.state.robotSelected, {
        key: {
          Robot: { [this.state.robotSelected]: { Status: { timestamp: 0 } } }
        }
      });
    }, this.watchdog_timeout);
  };

  // get all running nodes
  getNodesRunning = data => {
    const nodesLchd = data.nodes_lchd || [];
    const nodesPersistent = data.persistent_nodes_lchd
      ? data.persistent_nodes_lchd
      : [];
    return nodesLchd.concat(nodesPersistent);
  };

  // check if robot is online
  isRobotOnline = timestamp => {
    return Date.now() * 0.001 - timestamp <= this.robotOfflineTime;
  };

  // check if current flow is running
  isFlowRunning = activeFlow => {
    return this.getFlowPath() === activeFlow;
  };

  updateStatus = (key, targetValue, data, forceUpdate) => {
    if (Date.now() - this.debounceDelta <= this.debounceTime && !forceUpdate)
      return;

    const robotStatus = {
      ...this.state.robotStatus
    };

    // get robot status
    const updateIn = _get(
      data,
      `${key}.Robot.${targetValue}.Status`,
      undefined
    );

    if (updateIn) {
      // Is Online
      robotStatus.robotOnline = this.isRobotOnline(updateIn.timestamp);

      const running =
        robotStatus.robotOnline && this.isFlowRunning(updateIn.active_flow);

      const running_nodes = running ? this.getNodesRunning(updateIn) : [];
      const node_status = this.getNodesToUpdate(
        this.node_status,
        running_nodes
      );
      const all_nodes_status = this.getNodesToUpdate(
        this.all_nodes_status,
        running_nodes,
        false
      );

      if (
        ((!isEqual(this.all_nodes_status, all_nodes_status) &&
          this.isFlowRunning(robotStatus.active_flow)) ||
          this.node_status_view_mode !== this.state.viewMode) &&
        this.props.interfaceMode?.id !== "loading"
      ) {
        this.node_status = node_status;
        this.all_nodes_status = all_nodes_status;
        this.node_status_view_mode = this.state.viewMode;
        this.props.nodeStatusUpdated(node_status, robotStatus);
        this.props.nodeCompleteStatusUpdated(all_nodes_status, robotStatus);
      }

      robotStatus.active_flow = robotStatus.robotOnline
        ? updateIn.active_flow
        : "";
      this.props.onStartStopFlow(robotStatus.active_flow);
    }
    // Robot doesn't have "Status" key in Redis
    else {
      robotStatus.robotOnline = false;
      robotStatus.active_flow = "";
      if (this.state.robotStatus.robotOnline) {
        MasterComponent.alert(
          "Robot has no 'Status' information",
          MasterComponent.ALERTS.warning
        );
      }
    }

    this.onlineAlert(robotStatus.robotOnline);
    this.setState({ robotStatus }, () => {
      this.resetWatchDog();
    });
    this.debounceDelta = Date.now();
  };

  // Robot list select change, will unsubscribe from the previous one
  handleChange = event => {
    const robotId = event.target.value;
    if (robotId !== this.state.robotSelected) {
      // Set in local storage
      LocalStorage.set(SELECTED_ROBOT_KEY, robotId);
      // Change subscriber and update state
      this.changeRobotSubscriber(robotId);
      this.setState({ robotSelected: robotId });
      this.props.onRobotChange(robotId);
    }
  };

  // action can be either "START" or "STOP"
  handleClickAction = action => {
    const canStart = this.canRunFlow(action);
    if (!canStart) return;
    this.setState({ isLoading: true });
    try {
      MasterDB.cloudFunction(
        "backend.FlowTopBar",
        "sendToRobot", // function
        [action, this.getFlowPath(), this.state.robotSelected], // args
        res => {
          this.commandRobotTimeout = setTimeout(() => {
            this.setState({ isLoading: false });
            MasterComponent.alert(
              `Failed to ${action.toLowerCase()} flow`,
              MasterComponent.ALERTS.error
            );
          }, FEEDBACK_TIMEOUT);
        }
      );
    } catch (error) {
      MasterComponent.alert(
        "Error running backend.FlowTopBar callback",
        MasterComponent.ALERTS.error
      );
    }
    this.blurButton();
  };

  blurButton = () => {
    this.buttonDOM.blur();
  };

  handleOpenFlow = event => {
    const { active_flow } = this.state.robotStatus;
    const doc = new Document({ path: active_flow });
    const { workspace, type, name, version } = doc;

    this.props.openFlow({
      id: name,
      workspace,
      name,
      type,
      version,
      ctrlKey: event.ctrlKey
    });
  };

  handleViewModeChange = (_, viewMode) => {
    if (!viewMode) return;
    this.setState({ viewMode });
    this.props.onViewModeChange(viewMode);
  };

  handleStartFlow = () => {
    const { active_flow } = this.state.robotStatus;
    if (active_flow === "") {
      this.handleClickAction("START");
    } else {
      // Confirmation alert : Another flow is running!
      MasterComponent.confirmAlert(
        "Another flow is running!",
        `"${
          this.state.robotList[this.state.robotSelected].RobotName
        }" is running flow "${active_flow}".\nAre you sure you want to run the flow "${this.getFlowPath()}"?`,
        () => this.handleClickAction("START"), //change
        () => console.log("close modal"), //do nothing close modal
        "Run"
      );
    }
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  /**
   * Check if flow can be started
   *  Look for runtime warnings and doesn't allow running the flow if there's any
   * @param {String} action : START or STOP
   * @returns {Boolean} True if flow can run and False otherwise
   */
  canRunFlow = action => {
    const graph = this.props.graph;
    const warnings = graph?.warnings || [];
    const warningsVisibility = graph.warningsVisibility;
    const runtimeWarnings = warnings.filter(wn => wn.isRuntime);
    runtimeWarnings.forEach(warning => {
      graph.setPermanentWarnings(warning);
      if (!warningsVisibility)
        MasterComponent.alert(
          runtimeWarnings[0].message,
          runtimeWarnings[0].type
        );
    });
    return !(runtimeWarnings.length && action === "START");
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  /**
   *
   * @returns
   */
  renderStartButton = () => {
    const { t } = this.props;
    const { isLoading } = this.state;
    // Render circular progress if loading
    return isLoading ? (
      <CircularProgress size={25} color="inherit" />
    ) : (
      <Tooltip title={t("Start Flow")}>
        <PlayArrowIcon />
      </Tooltip>
    );
  };

  /**
   *
   * @returns
   */
  renderStopButton = () => {
    const { t } = this.props;
    const { isLoading } = this.state;
    // Render circular progress if loading
    return isLoading ? (
      <CircularProgress size={25} color="inherit" />
    ) : (
      <Tooltip title={t("Stop Flow")}>
        <StopIcon />
      </Tooltip>
    );
  };

  render() {
    const { t, classes } = this.props;
    const { active_flow, robotOnline } = this.state.robotStatus;
    const isLoading = this.state.isLoading;

    return (
      <AppBar position="static" color="inherit">
        <Toolbar variant="dense">
          <Typography component="div" className={classes.grow}>
            <FormControl className={classes.formControl}>
              <Select
                id="robot-selector"
                value={this.state.robotSelected}
                startAdornment={<i className="fas fa-robot"></i>}
                onChange={this.handleChange}
              >
                {Object.keys(this.state.robotList).map(
                  (robotId, robotIndex) => {
                    const isDefaultRobot =
                      this.state.robotList[robotId].isDefault;
                    return (
                      <MenuItem
                        key={`robotList-${robotIndex}`}
                        value={robotId}
                        className={isDefaultRobot ? classes.defaultRobot : ""}
                      >
                        {this.state.robotList[robotId].RobotName}
                      </MenuItem>
                    );
                  }
                )}
              </Select>
            </FormControl>
            {this.isFlowRunning(active_flow) ? (
              <Button
                variant="contained"
                disabled={isLoading}
                color="primary"
                className={classes.buttonPill}
                ref={buttonDOM => {
                  this.buttonDOM = buttonDOM;
                }}
                size="small"
                onClick={() => this.handleClickAction("STOP")}
              >
                {this.renderStopButton()}
              </Button>
            ) : (
              <Button
                disabled={!robotOnline || isLoading}
                variant="contained"
                color="primary"
                className={classes.buttonPill}
                ref={buttonDOM => {
                  this.buttonDOM = buttonDOM;
                }}
                size="small"
                onClick={this.handleStartFlow}
              >
                {this.renderStartButton()}
              </Button>
            )}
          </Typography>
          <Typography component="div" className={classes.visualizationToggle}>
            <ToggleButtonGroup
              size="small"
              value={this.state.viewMode}
              exclusive
              onChange={this.handleViewModeChange}
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
  }
}

FlowTopBar.propTypes = {
  id: PropTypes.string,
  nodeStatusUpdated: PropTypes.func,
  nodeCompleteStatusUpdated: PropTypes.func,
  onViewModeChange: PropTypes.func,
  onStartStopFlow: PropTypes.func,
  openFlow: PropTypes.func,
  workspace: PropTypes.string,
  type: PropTypes.string,
  version: PropTypes.string
};

FlowTopBar.defaultProps = {
  openFlow: () => DEFAULT_FUNCTION("openFlow"),
  onViewModeChange: () => DEFAULT_FUNCTION("onViewModeChange"),
  onStartStopFlow: () => DEFAULT_FUNCTION("onStartStopFlow"),
  nodeCompleteStatusUpdated: () => DEFAULT_FUNCTION("completeStatusUpdated"),
  workspace: "global",
  type: "Flow",
  version: "__UNVERSIONED__"
};

export default withStyles(styles, { withTheme: true })(
  withTranslation()(FlowTopBar)
);
