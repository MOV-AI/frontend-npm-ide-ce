import React from "react";
import { makeStyles } from "@material-ui/styles";
import WarningIcon from "@material-ui/icons/Warning";
import PropTypes from "prop-types";
import { RobotManager, Document } from "@mov-ai/mov-fe-lib-core";
import { Typography, Tooltip } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  bar: {
    height: 25,
    width: "100%"
  },
  grow: {
    flexGrow: 1
  },
  active: {
    background: theme.palette.primary.light,
    color: "black"
  },
  default: {
    background: theme.palette.background.primary,
    borderTop: "solid 1px black"
  },
  tooltip: {
    fontSize: "1em"
  },
  action: {
    cursor: "pointer",
    width: "fit-content",
    display: "inline-block",
    padding: "0 15px",
    borderRight: `solid 1px ${theme.palette.background.secondary}`,
    "& i": { marginRight: 10 },
    "&:hover": {
      filter: `drop-shadow(2px 4px 6px white)`
    }
  },
  alignRight: {
    float: "right",
    borderLeft: `solid 1px ${theme.palette.background.secondary}`
  }
}));

const FlowBottomBar = props => {
  // State(s)
  const [barStatus, setBarStatus] = React.useState("default");
  const [allRobots, setRobots] = React.useState({});
  const [selectedRobotName, setSelectedRobotName] = React.useState("");
  const [warningVisibility, setWarningVisibility] = React.useState(true);

  // Prop(s)
  const { onToggleWarnings, robotSelected, runningFlow, warnings } = props;

  // Hook(s)
  const classes = useStyles();

  const updateRobots = React.useCallback(changedRobots => {
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
      workspace,
      name,
      type,
      version,
      ctrlKey: event.ctrlKey
    });
  };

  //========================================================================================
  /*                                                                                      *
   *                                    React lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    const robotManager = new RobotManager();
    robotManager.getAll(robots => setRobots(robots));
    robotManager.subscribeToChanges(updateRobots);
  }, [updateRobots]);

  React.useEffect(() => {
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
      component="div"
      className={`${classes.bar} ${classes[barStatus]}`}
    >
      <Typography component="div">
        {runningFlow && (
          <Tooltip
            classes={{ tooltip: classes.tooltip }}
            title={`The selected robot is running: ${parseFlowName(
              runningFlow
            )}`}
          >
            <Typography
              component="div"
              className={classes.action}
              onClick={evt => handleOpenFlow(evt)}
            >
              <i className="fas fa-robot"></i>
              {selectedRobotName} : {parseFlowName(runningFlow)}
            </Typography>
          </Tooltip>
        )}
        <Tooltip title="Show warnings" classes={{ tooltip: classes.tooltip }}>
          <Typography
            component="div"
            className={`${classes.action} ${classes.alignRight}`}
            onClick={evt => {
              const isVisible = !warningVisibility;
              onToggleWarnings(isVisible);
              setWarningVisibility(isVisible);
            }}
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
  robotSelected: PropTypes.string,
  runningFlow: PropTypes.string
};

FlowBottomBar.defaultProps = {
  openFlow: () => {},
  robotSelected: "",
  runningFlow: ""
};

export default FlowBottomBar;
