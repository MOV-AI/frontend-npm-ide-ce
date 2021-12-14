import React, { Component } from "react";
import PropTypes from "prop-types";
import Menu from "@material-ui/core/Menu";

class ContextMenu extends Component {
  state = {
    args: null,
    posX: null,
    posY: null
  };

  componentDidUpdate(_, prevState) {
    // Validate against empty options
    if (
      Array.isArray(this.props.children) &&
      prevState.args?.id === this.state.args?.id
    ) {
      const nonEmptyOptions = this.props.children.filter(
        item => !(Array.isArray(item) && item.length === 0)
      );
      // Close context menu if there are only empty options
      if (nonEmptyOptions.length === 0 && this.isOpen()) {
        this.handleClose();
      }
    }
  }

  handleOpen = (event, args) => {
    this.setState({
      posX: event.clientX,
      posY: event.clientY,
      args: { ...args }
    });
  };

  handleClose = () => {
    (this.state.args.onClose || (() => {})).call();
    this.setState({ posX: null, posY: null, args: null });
    this.props.onClose();
  };

  handleClick = func => {
    func(this.state.args);
    this.handleClose();
  };

  isOpen() {
    return this.state.posX;
  }

  render() {
    const { posX, posY } = this.state;
    const { children, onEnter } = this.props;
    return (
      <div>
        <Menu
          anchorReference="anchorPosition"
          open={Boolean(posX)}
          TransitionProps={{ onEnter }}
          onClose={this.handleClose}
          anchorPosition={
            posY !== null && posX !== null
              ? { top: posY, left: posX }
              : undefined
          }
        >
          {React.Children.map(children, item => {
            return React.cloneElement(item, {
              onClick: evt => {
                this.handleClick(item.props.onClick);
              }
            });
          })}
        </Menu>
      </div>
    );
  }
}

ContextMenu.propTypes = {
  children: PropTypes.node,
  onEnter: PropTypes.func,
  onClose: PropTypes.func
};

ContextMenu.defaultProps = {
  children: [<div></div>],
  onEnter: () => {},
  onClose: () => {}
};

export default ContextMenu;
