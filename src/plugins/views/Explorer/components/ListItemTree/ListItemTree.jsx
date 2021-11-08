import React from "react";
import { List } from "@material-ui/core";

/**
 *
 * @param {*} props: contains children which are Items
 */
const ListItemsTree = props => {
  return (
    <List
      style={{ paddingLeft: "0px", paddingRight: "0px", ...props.style }}
      dense={true}
      component="div"
      onKeyUp={props.onKeyUp}
    >
      {props.children}
    </List>
  );
};

export default ListItemsTree;
