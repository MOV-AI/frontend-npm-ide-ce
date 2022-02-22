import React, { useCallback } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import ListItem from "@material-ui/core/ListItem";
import LinkIcon from "@material-ui/icons/Link";

import { systemMenuItemStyles } from "../styles";

const MenuItem = ({ data, closeMenu }) => {
  const { id, title, callback, keybind, externalLink } = data;
  const classes = systemMenuItemStyles();

  const handleOptionClick = useCallback(
    evt => {
      callback && callback();
      closeMenu(evt);
    },
    [callback, closeMenu]
  );

  return (
    <ListItem className={classes.listItem} key={id}>
      <Button className={classes.menuButton} onClick={handleOptionClick}>
        <span>{title}</span>
        {keybind && <span className={classes.keybind}>{keybind}</span>}
        {externalLink && <LinkIcon className={classes.keybind}></LinkIcon>}
      </Button>
    </ListItem>
  );
};

export default MenuItem;

MenuItem.propTypes = {
  data: PropTypes.object.isRequired
};
