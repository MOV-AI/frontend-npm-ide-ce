import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography
} from "@material-ui/core";

const DetailsMenu = ({ name, details }) => {
  return (
    <div>
      <h2 style={{ textAlign: "center" }}>{name}</h2>
      <List
        sx={{
          width: "100%",
          bgcolor: "background.paper"
        }}
        component="nav"
      >
        <ListItem>
          <ListItemText primary={`Name:`} />
          <Typography>{name}</Typography>
        </ListItem>
        <Divider />
        <ListItem divider>
          <ListItemText primary={`Last Updated:`} />
          <Typography>{details.date}</Typography>
        </ListItem>
        <Divider />
        <ListItem divider>
          <ListItemText primary={`User:`} />
          <Typography>{details.user}</Typography>
        </ListItem>
      </List>
    </div>
  );
};

export default DetailsMenu;
