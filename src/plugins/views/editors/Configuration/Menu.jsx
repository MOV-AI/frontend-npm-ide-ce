import React from "react";
import { Divider, List, ListItem, ListItemText } from "@material-ui/core";
import { withViewPlugin } from "../../../../engine/ReactPlugin/ViewReactPlugin";

const Menu = ({ id, name, lastUpdate }) => {
  return (
    <div>
      <h2>{name}</h2>
      <List
        sx={{
          width: "100%",
          bgcolor: "background.paper"
        }}
        component="nav"
      >
        <ListItem>
          <ListItemText primary={`Name: ${name}`} />
        </ListItem>
        <Divider />
        <ListItem divider>
          <ListItemText primary={`Last Updated: ${lastUpdate.lastUpdate}`} />
        </ListItem>
        <Divider />
        <ListItem divider>
          <ListItemText primary={`User: ${lastUpdate.user}`} />
        </ListItem>
      </List>
    </div>
  );
};

export default withViewPlugin(Menu);
