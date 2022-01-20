import React from "react";
import PropTypes from "prop-types";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { ContextMenu, DEFAULT_FUNCTION } from ".";

const t = v => v;

const MODE = {
  NODE: "NodeInst",
  LINK: "Link",
  SUBFLOW: "Container",
  PORTS: "Ports"
};

const FlowContextMenu = props => {
  const {
    mode,
    anchorPosition,
    onClose,
    onNodeDelete,
    onLinkDelete,
    onSubFlowDelete
  } = props;

  const handleOptionsClick = fn => {
    fn();
    onClose();
  };

  const getNodeOptions = [
    {
      element: t("Delete"),
      icon: <DeleteOutlineIcon />,
      onClick: () => handleOptionsClick(onNodeDelete)
    }
  ];
  const getSubFlowOptions = [
    {
      element: t("Delete"),
      icon: <DeleteOutlineIcon />,
      onClick: () => handleOptionsClick(onSubFlowDelete)
    }
  ];
  const getLinkOptions = [
    {
      element: t("Delete"),
      icon: <DeleteOutlineIcon />,
      onClick: () => handleOptionsClick(onLinkDelete)
    }
  ];

  const getItems = () => {
    const renderMap = {
      [MODE.NODE]: getNodeOptions,
      [MODE.LINK]: getLinkOptions,
      [MODE.SUBFLOW]: getSubFlowOptions
    };

    return renderMap[mode];
  };

  return (
    <ContextMenu
      anchorPosition={anchorPosition}
      menuList={getItems()}
      onClose={onClose}
    />
  );
};

FlowContextMenu.defaultProps = {
  mode: MODE.NODE,
  anchorPosition: null,
  onClose: () => DEFAULT_FUNCTION("onClose"),
  onNodeDelete: () => DEFAULT_FUNCTION("onNodeDelete"),
  onLinkDelete: () => DEFAULT_FUNCTION("onLinkDelete"),
  onSubFlowDelete: () => DEFAULT_FUNCTION("onSubFlowDelete")
};

FlowContextMenu.propTypes = {
  mode: PropTypes.string,
  anchorPosition: PropTypes.object,
  onClose: PropTypes.func,
  onNodeDelete: PropTypes.func,
  onLinkDelete: PropTypes.func,
  onSubFlowDelete: PropTypes.func
};

export default FlowContextMenu;
