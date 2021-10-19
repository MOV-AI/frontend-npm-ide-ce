import React from "react";
import PropTypes from "prop-types";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { withPlugin } from "../../../ReactPlugin/ViewReactPlugin";
import PluginManagerIDE from "../../../PluginManagerIDE/PluginManagerIDE";
import PluginButton from "../PluginButton/PluginButton";

const PluginList = ({ call, profile }) => {
  const [random, setRandom] = React.useState({ value: 0 });
  React.useEffect(() => {
    setInterval(() => {
      const newRandom = Math.floor(100 * Math.random());
      setRandom({ value: newRandom });
    }, 2000);
  }, []);

  call("mainPanel", "update", "Inbox", { random });

  return (
    <List>
      {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => {
        return (
          <ListItem
            button
            key={text}
            onClick={async () => {
              await PluginManagerIDE.install(
                text,
                new PluginButton({
                  name: text,
                  displayName: text,
                  location: "mainPanel"
                })
              );
              await call("mainPanel", "update", text);
            }}
          >
            <ListItemIcon>
              {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        );
      })}
    </List>
  );
};

export default withPlugin(PluginList);

PluginList.propTypes = {
  call: PropTypes.func.isRequired
};
