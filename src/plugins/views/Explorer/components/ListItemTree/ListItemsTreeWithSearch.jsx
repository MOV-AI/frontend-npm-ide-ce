import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Divider, List, ListItem } from "@material-ui/core";
import Search from "../../../../../utils/components/Search/Search";
import VirtualizedTree from "../VirtualizedTree/VirtualizedTree";

import { listItemsTreeWithSearchStyles } from "./styles";
import ItemRow from "./ItemRow";

export function toggleExpandRow(node, data) {
  // Toggle the expansion of the clicked panel«
  const nextData = [...data];
  const isExpanded = data[node.id]?.state?.expanded ?? false;
  nextData[node.id].state = {
    ...nextData[node.id].state,
    expanded: !isExpanded
  };

  // Close other panels
  data
    .filter(elem => elem.id !== node.id)
    .forEach(panel => {
      nextData[panel.id].state = {
        ...nextData[panel.id].state,
        expanded: false
      };
    });
  return nextData;
}

const ListItemsTreeWithSearch = props => {
  const { data } = props;

  // State hooks
  const [itemData, setItemData] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  // Style hook
  const classes = listItemsTreeWithSearchStyles();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Takes in an array to normalize, returns normalized array
   * @param {Array} dataToNormalize : data that we want to normalize
   * @returns {Array} normalized data
   */
  function normalizeData(dataToNormalize) {
    const finalData = [];

    dataToNormalize.forEach(node => {
      finalData.push(node);
      if (node.state?.expanded && node.children) {
        node.children
          // We'll sort the children array first to avoid opened file being set in first position
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach(childNode => {
            finalData.push({
              ...childNode,
              id: `${childNode.scope}_${childNode.id}`
            });
          });
      }
    });

    return finalData;
  }

  /**
   * Filters given array of data
   * @param {Array} searchData : data that we want to filter from
   * @param {String} value : string to filter by
   * @return {Array} filtered array
   */
  const searchFilter = useCallback((searchData, value = "") => {
    const valueLower = value.toLowerCase();
    const filteredNodes = searchData
      .filter(
        node =>
          (!node.name.includes("@SM") &&
            node.name.toLowerCase().includes(valueLower)) ||
          node.children.findIndex(ch =>
            ch.name.toLowerCase().includes(valueLower)
          ) >= 0
      )
      .map(node => {
        return {
          ...node,
          children: (node?.children ?? []).filter(
            ch =>
              ch.name &&
              !ch.name.includes("@SM") &&
              (node.name.toLowerCase().includes(valueLower) ||
                ch.name.toLowerCase().includes(valueLower))
          )
        };
      });

    // Add children id if missing
    filteredNodes.forEach(node => {
      node.children.forEach((child, i) => {
        child.id = child.id ?? i;
        child.url = child.url ?? child.id;
        if (child.children) {
          child.children.forEach((grandChild, j) => {
            grandChild.id = grandChild.id ?? j;
            grandChild.url = grandChild.url ?? grandChild.id;
          });
        }
      });
    });

    return normalizeData(filteredNodes);
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Search handler
   * @param {String} searchValue : String used to search
   */
  const handleOnSearch = searchValue => {
    setSearchInput(searchValue);
    setItemData(searchFilter(data, searchValue));
  };

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Will trigger mostly when data changes
   */
  useEffect(() => {
    setItemData(searchFilter(data, searchInput));
  }, [data, searchInput, searchFilter, setItemData]);

  //========================================================================================
  /*                                                                                      *
   *                                        Renders                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Row render function
   * @param {*} rowProps
   * @returns {JSX<ItemRow>} To be rendered
   */
  const renderRow = rowProps => {
    const { index, style, data: rowData } = rowProps;
    const node = rowData[index];

    return <ItemRow node={node} {...props} style={style} />;
  };

  return (
    <List className={classes.list} dense={true} component="div">
      <ListItem>
        <Search onSearch={handleOnSearch} />
      </ListItem>
      <Divider />
      <div className={classes.listHolder}>
        <VirtualizedTree itemData={itemData} rowRender={renderRow} />
      </div>
    </List>
  );
};

ListItemsTreeWithSearch.propTypes = {
  data: PropTypes.array.isRequired
};

export default ListItemsTreeWithSearch;
