import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ToggleOnIcon from "@material-ui/icons/ToggleOn";
import { ContextMenu, DEFAULT_FUNCTION, MODE } from ".";

const FlowContextMenu = props => {
  const { t } = useTranslation();
  const {
    mode,
    anchorPosition,
    onClose,
    onNodeDelete,
    onLinkDelete,
    onSubFlowDelete,
    onPortToggle
  } = props;

  const handleOptionsClick = fn => {
    fn();
    onClose();
  };

  const getNodeOptions = [
    {
      label: t("Delete"),
      icon: <DeleteOutlineIcon />,
      onClick: () => handleOptionsClick(onNodeDelete)
    }
  ];
  const getSubFlowOptions = [
    {
      label: t("Delete"),
      icon: <DeleteOutlineIcon />,
      onClick: () => handleOptionsClick(onSubFlowDelete)
    }
  ];
  const getLinkOptions = [
    {
      label: t("Delete"),
      icon: <DeleteOutlineIcon />,
      onClick: () => handleOptionsClick(onLinkDelete)
    }
  ];

  const getPortOptions = [
    {
      label: t("Toggle"),
      icon: <ToggleOnIcon />,
      onClick: () => handleOptionsClick(onPortToggle)
    }
  ];

  const getItems = () => {
    const renderMap = {
      [MODE.NODE]: getNodeOptions,
      [MODE.LINK]: getLinkOptions,
      [MODE.SUBFLOW]: getSubFlowOptions,
      [MODE.PORT]: getPortOptions
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
  onSubFlowDelete: () => DEFAULT_FUNCTION("onSubFlowDelete"),
  onPortToggle: () => DEFAULT_FUNCTION("onPortToggle")
};

FlowContextMenu.propTypes = {
  mode: PropTypes.string,
  anchorPosition: PropTypes.object,
  onClose: PropTypes.func,
  onNodeDelete: PropTypes.func,
  onLinkDelete: PropTypes.func,
  onSubFlowDelete: PropTypes.func,
  onPortToggle: PropTypes.func
};

export default FlowContextMenu;
