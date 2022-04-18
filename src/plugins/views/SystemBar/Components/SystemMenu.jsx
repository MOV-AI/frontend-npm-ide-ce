import React from "react";
import PropTypes from "prop-types";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Popper from "@material-ui/core/Popper";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import Fade from "@material-ui/core/Fade";
import Paper from "@material-ui/core/Paper";
import MenuItem from "./MenuItem";

import { systemMenuStyles } from "../styles";

const SystemMenu = ({ data, menuOpen, anchorEl, closeMenu }) => {
  const classes = systemMenuStyles();

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <Popper
      className={classes.popper}
      open={menuOpen}
      anchorEl={anchorEl}
      placement={"bottom-start"}
      transition
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <ClickAwayListener onClickAway={closeMenu}>
            <Paper className={classes.listHolder}>
              <List component="nav" className={classes.list}>
                {data &&
                  data.map((item, index) => {
                    if (item.id)
                      return (
                        <MenuItem
                          key={item.id}
                          item={item}
                          closeMenu={closeMenu}
                        />
                      );
                    else
                      return (
                        <Divider key={index} className={classes.menuDivider} />
                      );
                  })}
              </List>
            </Paper>
          </ClickAwayListener>
        </Fade>
      )}
    </Popper>
  );
};

export default SystemMenu;

SystemMenu.propTypes = {
  data: PropTypes.array.isRequired,
  anchorEl: PropTypes.object.isRequired,
  menuOpened: PropTypes.bool
};
