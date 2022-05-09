import React from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { ContextMenu } from "@mov-ai/mov-fe-lib-react";
import Tooltip from "@material-ui/core/Tooltip";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { stopPropagation } from "../../../../../utils/Utils";

import { itemRowStyles } from "./styles";

const ItemRow = props => {
  const { showIcons, style, node } = props;

  // Style hook
  const classes = itemRowStyles();

  // Translation hook
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle on node mouse enter
   */
  const handleNodeMouseEnter = () => {
    props.onMouseEnter && props.onMouseEnter(node);
  };

  /**
   * Handle on node mouse leave
   */
  const handleNodeMouseLeave = () => {
    props.onMouseLeave && props.onMouseLeave(node);
  };

  /**
   * Handle on node click
   */
  const handleNodeMouseClick = () => {
    props.onClickNode && props.onClickNode(node);
  };

  /**
   * Handle on node double click
   */
  const handleNodeMouseDoubleClick = () => {
    props.onDoubleClickNode && props.onDoubleClickNode(node);
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  return (
    <div
      data-testid="input_node"
      style={style}
      onMouseEnter={handleNodeMouseEnter}
      onMouseLeave={handleNodeMouseLeave}
      onClick={handleNodeMouseClick}
      onDoubleClick={handleNodeMouseDoubleClick}
      p={2}
      className={`${classes.listItem} ${
        !node.children ? classes.preContainer : ""
      }`}
    >
      <Box p={1} className={classes.inlineFlex}>
        <Grid alignContent={"space-between"} container>
          {node.children &&
            (node.state?.expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />)}

          <div
            className={
              !node.children ? classes.spaceBetween : classes.displayContents
            }
          >
            <Tooltip
              title={!node.children ? node.name : ""}
              placement="bottom-start"
            >
              <div className={classes.ellipsis}>{node.title}</div>
            </Tooltip>
            {showIcons && !node.children && (
              <div className={classes.iconSpace}>
                <ContextMenu
                  styledMenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "center"
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "center"
                    }
                  }}
                  element={
                    <IconButton onClick={stopPropagation}>
                      <MoreHorizIcon />
                    </IconButton>
                  }
                  menuList={[
                    {
                      onClick: _evt => {
                        props.handleCopyClick(node);
                      },
                      icon: (
                        <FileCopyIcon className={classes.contextMenuIcon} />
                      ),
                      element: t("Copy")
                    },
                    {
                      onClick: () => {
                        props.handleDeleteClick(node);
                      },
                      icon: <DeleteIcon className={classes.contextMenuIcon} />,
                      element: t("Delete")
                    }
                    // {
                    //   onClick: () => {
                    //     props.handleCompareClick(node);
                    //   },
                    //   icon: <CompareIcon fontSize="small" />,
                    //   label: t("Compare")
                    // }
                  ]}
                />
              </div>
            )}
          </div>
        </Grid>
      </Box>
    </div>
  );
};

ItemRow.propTypes = {
  style: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  showIcons: PropTypes.bool
};

export default ItemRow;
