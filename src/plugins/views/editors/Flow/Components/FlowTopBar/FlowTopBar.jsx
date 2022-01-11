import React from "react";
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
import { FLOW_VIEW_MODE } from "../../Constants/constants";
import { DEFAULT_FUNCTION, useTranslation } from "../../../_shared/mocks";

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
    // const SELECTED_ROBOT_KEY = "movai.selectedRobot";
    // const FEEDBACK_TIMEOUT = 10000;
 */

const FlowTopBar = props => {
  // State hooks
  const [loading, setLoading] = React.useState(false);
  const [robotStatus, setRobotStatus] = React.useState({});
  const [robotSelected, setRobotSelected] = React.useState({});
  const [viewMode, setViewMode] = React.useState({});
  // Other hooks
  const classes = useStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                        Helper                                        *
   *                                                                                      */
  //========================================================================================

  const { active_flow, robotOnline } = robotStatus;

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  /**
   *
   * @returns
   */
  const renderStartButton = React.useEffect(() => {
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
  const renderStopButton = React.useEffect(() => {
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
              value={this.state.robotSelected}
              startAdornment={<i className="fas fa-robot"></i>}
              onChange={this.handleChange}
            >
              {Object.keys(this.state.robotList).map((robotId, robotIndex) => {
                const isDefaultRobot = this.state.robotList[robotId].isDefault;
                return (
                  <MenuItem
                    key={`robotList-${robotIndex}`}
                    value={robotId}
                    className={isDefaultRobot ? classes.defaultRobot : ""}
                  >
                    {this.state.robotList[robotId].RobotName}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          {this.isFlowRunning(active_flow) ? (
            <Button
              variant="contained"
              disabled={loading}
              color="primary"
              className={classes.buttonPill}
              ref={buttonDOM => {
                this.buttonDOM = buttonDOM;
              }}
              size="small"
              onClick={() => this.handleClickAction("STOP")}
            >
              {renderStopButton()}
            </Button>
          ) : (
            <Button
              disabled={!robotOnline || loading}
              variant="contained"
              color="primary"
              className={classes.buttonPill}
              ref={buttonDOM => {
                this.buttonDOM = buttonDOM;
              }}
              size="small"
              onClick={this.handleStartFlow}
            >
              {renderStartButton()}
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
};

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

export default FlowTopBar;
