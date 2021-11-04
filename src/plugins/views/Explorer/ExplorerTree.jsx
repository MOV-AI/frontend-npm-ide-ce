import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import React from "react";
import Search from "../../../components/Search/Search";

function CollapseList(props) {
  const [open, setOpen] = React.useState(false);
  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <>
      <ListItem onClick={handleClick}>
        <ListItemText primary={props.node.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {renderTree(props.node.children)}
      </Collapse>
    </>
  );
}

function renderTree(tree) {
  return (
    <List>
      {tree.map(node => {
        if (node.children.length === 0) {
          return (
            <ListItem sx={{ pl: 4 }}>
              <ListItemText primary={node.name} />
            </ListItem>
          );
        }
        return <CollapseList node={node} />;
      })}
    </List>
  );
}
function ExplorerTree(props) {
  return (
    <>
      <Search onChange={searchText => {}}></Search>
      {renderTree(props.tree)}
    </>
  );
}

export default ExplorerTree;
