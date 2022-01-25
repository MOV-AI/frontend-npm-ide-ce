import React, { useCallback, useState } from "react";
import SpeedDial from "@material-ui/lab/SpeedDial";
import SpeedDialIcon from "@material-ui/lab/SpeedDialIcon";
import SpeedDialAction from "@material-ui/lab/SpeedDialAction";
import PropTypes from "prop-types";

import { actionDial } from "./styles";

const ActionsDial = props => {
  const classes = actionDial();

  const [open, setOpen] = useState(false);
  const {
    actions,
    selectedActionIndex,
    selectedActionColor,
    parent,
    direction,
    className,
    style,
    icon,
    onClick
  } = props;

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(open, handleOpen, handleClose);
    } else {
      setOpen(prevState => !prevState);
    }
  }, [open, onClick, handleOpen, handleClose]);

  return (
    <SpeedDial
      className={`${classes.base} ${className}`}
      ariaLabel="Actions"
      style={style}
      hidden={false}
      icon={icon || <SpeedDialIcon />}
      onClick={handleClick}
      onClose={() => {}}
      onMouseEnter={() => {}}
      open={open}
      direction={direction || "up"}
    >
      {actions &&
        Object.values(actions).map((action, i) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon({
              style: {
                fontSize: "1.3em",
                color: i === selectedActionIndex ? selectedActionColor : ""
              }
            })}
            tooltipTitle={action.name}
            onClick={() => {
              setTimeout(handleOpen);
              action.action(parent);
            }}
          />
        ))}
    </SpeedDial>
  );
};

ActionsDial.propTypes = {
  direction: PropTypes.string
};

ActionsDial.defaultProps = {
  direction: "down",
  selectedActionIndex: -1,
  selectedActionColor: "blue"
};

export default ActionsDial;
