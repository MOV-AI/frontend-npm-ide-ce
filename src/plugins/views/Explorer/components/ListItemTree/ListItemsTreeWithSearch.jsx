import React from "react";
import { Typography, Divider, ListItem } from "@material-ui/core";
import PropTypes from "prop-types";
import Search from "../Search/Search";
import ListItemsTree from "./ListItemTree";

/* 
  TODO: think about how to generalize the search

  Using either the _shared/Search method or using a predicate 
*/
const ListItemsTreeWithSearch = props => {
  return (
    <ListItemsTree
      style={{ flexGrow: 1, paddingBottom: "0px", paddingTop: "0px" }}
      onKeyUp={props.onKeyUp}
    >
      <ListItem>
        <Search search={input => props.onSearch(input)} />
      </ListItem>
      <Divider />
      <Typography style={props.style} component="div">
        {React.Children.map(props.children, x => {
          return x;
        })}
      </Typography>
    </ListItemsTree>
  );
};

ListItemsTreeWithSearch.propTypes = {
  onSearch: PropTypes.func
};

ListItemsTreeWithSearch.defaultProps = {
  onSearch: input => console.log(input)
};

export default ListItemsTreeWithSearch;
