import React from "react";
import PropTypes from "prop-types";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { DEFAULT_FUNCTION } from "../../../../../../../utils/Utils";

const ContextMenu = props => {
  const { anchorPosition, menuList, onClose, readOnly } = props;

  return (
    <Menu
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      open={Boolean(anchorPosition)}
      onClose={onClose}
    >
      {menuList.map((item, index) => {
        return (
          <MenuItem onClick={item.onClick} disabled={readOnly} key={index}>
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText>{item.label || item.element}</ListItemText>
          </MenuItem>
        );
      })}
    </Menu>
  );
};

ContextMenu.propTypes = {
  anchorPosition: PropTypes.object,
  menuList: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.element,
      element: PropTypes.element,
      label: PropTypes.string,
      onClick: PropTypes.func
    })
  ),
  onClose: PropTypes.func,
  readOnly: PropTypes.bool
};
ContextMenu.defaultProps = {
  menuList: [],
  readOnly: false,
  onClose: () => DEFAULT_FUNCTION("onClose")
};

export default ContextMenu;
