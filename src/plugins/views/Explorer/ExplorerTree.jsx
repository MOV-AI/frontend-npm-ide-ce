import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import React from "react";
import Search from "../../../components/Search/Search";

function CollapseList(props) {
  const [open, setOpen] = React.useState(true);
  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <>
      <ListItemButton onClick={handleClick}>
        <ListItemText primary={props.node.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
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
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemText primary={node.name} />
            </ListItemButton>
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
