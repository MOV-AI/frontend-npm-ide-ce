import React, { useCallback } from "react";
import PropTypes from "prop-types";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { defaultFunction } from "../../../../../../../utils/Utils";

const ContextMenu = props => {
  const { anchorPosition, menuList, onClose, readOnly } = props;

  /**
   * Caputure context menu click event and dispatch it for the rightful element
   * @param {Event} event : contextmenu event
   */
  const onContextMenu = useCallback(event => {
    const { clientX, clientY } = event;
    // Get all elements from clicked point
    const allElementsFromPoint = document.elementsFromPoint(clientX, clientY);
    // Create new contextmenu event based on the original mouse clicked position
    const ev = new MouseEvent("contextmenu", {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX,
      clientY
    });
    // first element is the same event.target
    // second element is the pop-up menu overlay
    // third element is the next in line that should receive the event
    allElementsFromPoint[2]?.dispatchEvent(ev);
  }, []);

  return (
    <Menu
      onContextMenu={onContextMenu}
      data-testid="section_context-menu"
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      open={Boolean(anchorPosition)}
      onClose={onClose}
    >
      {menuList.map((item, index) => {
        return (
          <MenuItem
            data-testid="input_context-option"
            onClick={item.onClick}
            disabled={readOnly}
            key={index}
          >
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
  onClose: () => defaultFunction("onClose")
};

export default ContextMenu;
