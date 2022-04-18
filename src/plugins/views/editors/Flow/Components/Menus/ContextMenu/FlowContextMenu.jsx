import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ToggleOnIcon from "@material-ui/icons/ToggleOn";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { ContextMenu, MODE } from ".";

const FlowContextMenu = props => {
  const { t } = useTranslation();
  const {
    mode,
    anchorPosition,
    onClose,
    onNodeCopy,
    onCanvasPaste,
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
      label: t("Copy"),
      icon: <FileCopyIcon />,
      onClick: () => handleOptionsClick(onNodeCopy)
    },
    {
      label: t("Delete"),
      icon: <DeleteOutlineIcon />,
      onClick: () => handleOptionsClick(onNodeDelete)
    }
  ];
  const getSubFlowOptions = [
    {
      label: t("Copy"),
      icon: <FileCopyIcon />,
      onClick: () => handleOptionsClick(onNodeCopy)
    },
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
      label: t("ToggleExposed"),
      icon: <ToggleOnIcon />,
      onClick: () => handleOptionsClick(onPortToggle)
    }
  ];

  const getCanvasOptions = [
    {
      label: t("Paste"),
      onClick: () => handleOptionsClick(onCanvasPaste)
    }
  ];

  const getItems = () => {
    const renderMap = {
      [MODE.NODE]: getNodeOptions,
      [MODE.LINK]: getLinkOptions,
      [MODE.SUBFLOW]: getSubFlowOptions,
      [MODE.PORT]: getPortOptions,
      [MODE.CANVAS]: getCanvasOptions
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
  anchorPosition: null
};

FlowContextMenu.propTypes = {
  mode: PropTypes.string,
  anchorPosition: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onNodeCopy: PropTypes.func.isRequired,
  onCanvasPaste: PropTypes.func.isRequired,
  onNodeDelete: PropTypes.func.isRequired,
  onLinkDelete: PropTypes.func.isRequired,
  onSubFlowDelete: PropTypes.func.isRequired,
  onPortToggle: PropTypes.func.isRequired
};

export default FlowContextMenu;
