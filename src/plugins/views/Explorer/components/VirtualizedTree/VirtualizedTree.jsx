import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Tree from "react-virtualized-tree";
import PropTypes from "prop-types";
import _get from "lodash/get";
import _debounce from "lodash/debounce";
import { ContextMenu } from "@mov-ai/mov-fe-lib-react";
import { withStyles } from "@material-ui/core/styles";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import { Tooltip, Typography } from "@material-ui/core";
import { stopPropagation, defaultFunction } from "../../../../../utils/Utils";
import ListItemsTreeWithSearch from "../ListItemTree/ListItemsTreeWithSearch";

import "react-virtualized/styles.css";
import "react-virtualized-tree/lib/main.css";
import "material-icons/css/material-icons.css";
import { virtualizedTreeStyles } from "./styles";

const EXPANDED = "EXPANDED";

const CustomTooltip = withStyles(theme => ({
  tooltip: {
    fontSize: theme.typography.pxToRem(12)
  }
}))(Tooltip);

class VirtualizedTree extends Component {
  state = {
    nodeTooltip: "",
    selectedGroup: EXPANDED,
    groupsEnabled: true,
    searchValue: ""
  };

  searchFilter = (nodes, searchValue) => {
    const searchValueLower = searchValue.toLowerCase();
    const filteredNodes = nodes
      .filter(
        node =>
          (!node.name.includes("@SM") &&
            node.name.toLowerCase().includes(searchValueLower)) ||
          node.children.findIndex(ch =>
            ch.name.toLowerCase().includes(searchValueLower)
          ) >= 0
      )
      .map(node => {
        return {
          ...node,
          children: (node?.children ?? []).filter(
            ch =>
              ch.name &&
              !ch.name.includes("@SM") &&
              (node.name.toLowerCase().includes(searchValueLower) ||
                ch.name.toLowerCase().includes(searchValueLower))
          )
        };
      });

    // Add children id if missing
    filteredNodes.forEach(node => {
      node.children.forEach((child, i) => {
        child.id = child.id ? child.id : i;
        child.url = child.url ? child.url : child.id;
        if (child.children) {
          child.children.forEach((grandChild, j) => {
            grandChild.id = grandChild.id ? grandChild.id : j;
            grandChild.url = grandChild.url ? grandChild.url : grandChild.id;
          });
        }
      });
    });

    return filteredNodes;
  };

  handleSelectedGroupChange = selectedGroup => {
    this.setState({ selectedGroup });
  };

  handleTooltipOpen = _debounce((target, node) => {
    if (!target) return;
    const nodeTooltip = this.state.nodeTooltip;
    const hasOverflow = target.offsetWidth < target.scrollWidth;
    const nodeUrl = node.url ?? node.name;
    if (hasOverflow && nodeTooltip !== nodeUrl) {
      setTimeout(() => {
        this.setState({ nodeTooltip: nodeUrl });
      }, 0);
    }
  }, 500);

  handleTooltipClose = _debounce(() => {
    if (this.state.nodeTooltip) this.setState({ nodeTooltip: "" });
  }, 100);

  render() {
    const { t, classes, showIcons } = this.props;
    const nodeTooltip = this.state.nodeTooltip;
    const nodes = this.props.data;
    return (
      <div>
        <ListItemsTreeWithSearch
          style={{
            overflow: "auto"
          }}
          onSearch={input => {
            this.setState({
              searchValue: input
            });
          }}
        >
          <div style={{ height: this.props.height }}>
            <Tree
              data-testid="section_explorer"
              nodes={this.searchFilter(nodes, this.state.searchValue)}
              onChange={this.props.handleChange}
            >
              {({ style, node, ..._rest }) => {
                // Adjust tree indentation
                style.paddingLeft = style.marginLeft / 1.5;
                style.marginLeft = 0;
                // Render tree element
                return (
                  <div
                    data-testid="input_node"
                    style={style}
                    onMouseEnter={() => this.props.onMouseEnter(node)}
                    onMouseLeave={() => this.props.onMouseLeave(node)}
                    onClick={() => this.props.onClickNode(node)}
                    onDoubleClick={() => this.props.onDoubleClickNode(node)}
                    p={2}
                    className={
                      !_get(node, `children`, false) ? classes.preContainer : ""
                    }
                  >
                    <Box p={1} className={classes.inlineFlex}>
                      <Grid alignContent={"space-between"} container>
                        {_get(node, `children`, false) &&
                          node.state?.expanded && <ExpandMoreIcon />}
                        {_get(node, `children`, false) &&
                          !node.state?.expanded && <ChevronRightIcon />}

                        <div
                          className={
                            !_get(node, `children`, false)
                              ? classes.spaceBetween
                              : classes.displayContents
                          }
                          onMouseLeave={this.handleTooltipClose}
                          onMouseOver={evt =>
                            this.handleTooltipOpen(evt.target, node)
                          }
                        >
                          <CustomTooltip
                            arrow
                            title={
                              <>
                                <Typography color="inherit">
                                  {node.name}
                                </Typography>
                              </>
                            }
                            disableFocusListener
                            disableHoverListener
                            disableTouchListener
                            placement="right-start"
                            open={(node.url ?? node.name) === nodeTooltip}
                          >
                            <div
                              className={classes.ellipsis}
                              onMouseLeave={this.handleTooltipClose}
                            >
                              {node.title}
                            </div>
                          </CustomTooltip>
                          {showIcons && node.deepness === 1 && (
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
                                      this.props.handleCopyClick({
                                        ...node,
                                        scopeTitle: removePlural(
                                          nodes[node.parents[0]].name
                                        )
                                      });
                                    },
                                    icon: (
                                      <FileCopyIcon
                                        className={classes.contextMenuIcon}
                                      />
                                    ),
                                    element: t("Copy")
                                  },
                                  {
                                    onClick: () => {
                                      this.props.handleDeleteClick({ ...node });
                                    },
                                    icon: (
                                      <DeleteIcon
                                        className={classes.contextMenuIcon}
                                      />
                                    ),
                                    element: t("Delete")
                                  }
                                  // {
                                  //   onClick: () => {
                                  //     this.props.handleCompareClick({
                                  //       ...node,
                                  //       scope: nodes[node.parents[0]].scope
                                  //     });
                                  //   },
                                  //   icon: <CompareIcon fontSize="small" />,
                                  //   label: t("Compare")
                                  // }
                                ]}
                              ></ContextMenu>
                            </div>
                          )}
                        </div>
                      </Grid>
                    </Box>
                  </div>
                );
              }}
            </Tree>
          </div>
        </ListItemsTreeWithSearch>
      </div>
    );
  }
}

VirtualizedTree.propTypes = {
  data: PropTypes.array,
  showIcons: PropTypes.bool,
  onClickNode: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onDoubleClickNode: PropTypes.func,
  handleChange: PropTypes.func,
  handleCopyClick: PropTypes.func,
  handleDeleteClick: PropTypes.func,
  handleCompareClick: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

VirtualizedTree.defaultProps = {
  data: [],
  showIcons: false,
  onClickNode: () => defaultFunction("onClickNode"),
  onMouseEnter: () => defaultFunction("onMouseEnter"),
  onMouseLeave: () => defaultFunction("onMouseLeave"),
  onDoubleClickNode: () => defaultFunction("onDoubleClickNode"),
  handleChange: () => defaultFunction("handleChange"),
  handleCopyClick: () => defaultFunction("handleCopyClick"),
  handleDeleteClick: () => defaultFunction("handleDeleteClick"),
  handleCompareClick: () => defaultFunction("handleCompareClick"),
  height: 700
};

function removePlural(s) {
  return s[s.length - 1].toLowerCase() === "s" ? s.slice(0, s.length - 1) : s;
}

export default withStyles(virtualizedTreeStyles, { withTheme: true })(
  withTranslation()(VirtualizedTree)
);
