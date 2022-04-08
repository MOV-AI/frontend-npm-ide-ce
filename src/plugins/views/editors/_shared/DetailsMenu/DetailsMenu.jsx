import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography
} from "@material-ui/core";

import { detailsMenuStyles } from "./styles";

const DetailsMenu = ({ name, details }) => {
  // Style hook
  const classes = detailsMenuStyles();
  return (
    <div>
      <h2 className={classes.detailsName}>{name}</h2>
      <List sx={{ width: "100%", bgcolor: "background.paper" }} component="nav">
        <ListItem>
          <ListItemText primary={`Name:`} />
          <Typography>{name}</Typography>
        </ListItem>
        <Divider />
        <ListItem divider>
          <ListItemText primary={`Last Updated:`} />
          <Typography>{details.date || "N/A"}</Typography>
        </ListItem>
        <Divider />
        <ListItem divider>
          <ListItemText primary={`User:`} />
          <Typography>{details.user || "N/A"}</Typography>
        </ListItem>
      </List>
    </div>
  );
};

export default DetailsMenu;
