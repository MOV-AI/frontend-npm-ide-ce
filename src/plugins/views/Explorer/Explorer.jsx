import { Button } from "@material-ui/core";
// import { makeStyles } from "@mui/styles";
import PropTypes from "prop-types";
import React from "react";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Configuration from "../editors/Configuration/Configuration";
import { ListItemButton } from "@mui/material";
import PluginManagerIDE from "../../../engine/PluginManagerIDE/PluginManagerIDE";

// const useStyles = makeStyles(() => ({
//   icon: {
//     color: "primary",
//     "&:hover": {
//       cursor: "pointer"
//     }
//   }
// }));

const Explorer = ({ profile, call, on, emit, onTopic }) => {
  //   const classes = useStyles();

  React.useEffect(() => {
    const loadDocs = docs => {};

    on("docManager", "loadDocs", loadDocs);
  }, [on]);

  const mockedData = ["agv1", "agv2", "project"];

  return (
    <div style={{ padding: 5 }}>
      <h1>Explorer</h1>
      <Button
        fullWidth
        onClick={() => {
          const id = `tab-${Math.floor(10 * Math.random())}`;
          call("tabs", "open", {
            id: id,
            title: id,
            content: <div>Hello World {id}</div>
          });
        }}
        color="primary"
        variant="outlined"
      >
        Random tab creator
      </Button>
      <hr></hr>
      <h3>Configuration</h3>
      <List>
        {mockedData.map(id => (
          <ListItem disablePadding key={id}>
            <ListItemButton
              onClick={async () => {
                const tabName = `${id}.conf`;
                const path = `global/Configuration/${id}`;
                const viewPlugin = new Configuration(
                  { name: path },
                  { id: path, name: id }
                );
                await PluginManagerIDE.install(path, viewPlugin);
                call("tabs", "open", {
                  id: path,
                  title: tabName,
                  content: viewPlugin.render()
                });
              }}
            >
              <ListItemText primary={id} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {/* <Button
        fullWidth
        color="primary"
        variant="contained"
        onClick={}
      >
        project
      </Button> */}
    </div>
  );
};

export default withViewPlugin(Explorer);

Explorer.propTypes = {
  call: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

Explorer.defaultProps = {
  profile: { name: "explorer" }
};
