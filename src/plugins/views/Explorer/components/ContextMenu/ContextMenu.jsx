import React from "react";
import PropTypes from "prop-types";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { withStyles } from "@material-ui/core/styles";

const StyledMenu = props => (
  <Menu
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center"
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center"
    }}
    {...props}
  />
);

const StyledMenuItem = withStyles(theme => ({
  root: {
    "&:focus": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white
      }
    }
  }
}))(MenuItem);

const ContextMenu = props => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
    // Loose focus of active element (remove default focused background of first menu item)
    setImmediate(() => {
      document.activeElement.blur();
    });
  };

  const handleClose = evt => {
    setAnchorEl(null);
    evt.stopPropagation();
  };

  return (
    <div>
      {React.cloneElement(props.element, {
        onClick: evt => {
          if (props.element.props.onClick !== undefined) {
            props.element.props.onClick(evt); // If user defined a onClick
          }
          handleClick(evt); // opens the contextMenu
        }
      })}
      {props.isStyled ? (
        <StyledMenu
          id="customized-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {props.menuList.map((item, index) => {
            return (
              <StyledMenuItem
                onClick={evt => {
                  item.onClick();
                  if (item.onClose || item.onClose === undefined) {
                    handleClose(evt);
                  }
                }}
                key={index}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </StyledMenuItem>
            );
          })}
        </StyledMenu>
      ) : (
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {props.menuList.map((item, index) => {
            return (
              <MenuItem
                onClick={evt => {
                  item.onClick();
                  if (item.onClose || item.onClose === undefined) {
                    handleClose(evt);
                  }
                }}
                key={index}
              >
                {item.element}
              </MenuItem>
            );
          })}
        </Menu>
      )}
    </div>
  );
};

ContextMenu.propTypes = {
  element: PropTypes.node.isRequired,
  isStyled: PropTypes.bool,
  navigationList: PropTypes.array,
  lowerElement: PropTypes.node.isRequired,
  width: PropTypes.string,
  backgroundColor: PropTypes.string
};
ContextMenu.defaultProps = {
  element: <div>Ahaha</div>,
  isStyled: false,
  menuList: [
    {
      onClick: () => console.log("clicked 1"),
      element: "Profile",
      onClose: true
    }
  ],
  lowerElement: <div></div>,
  width: "68px",
  backgroundColor: "#424242"
};

export default ContextMenu;
