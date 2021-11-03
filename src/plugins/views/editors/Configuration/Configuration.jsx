import React from "react";
import PropTypes from "prop-types";
import { SCOPES } from "../../../../utils/Constants";
import { makeStyles } from "@mui/styles";
// import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import { withViewPlugin } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { AppBar, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Toolbar } from "@material-ui/core";
import PluginManagerIDE from "../../../../engine/PluginManagerIDE/PluginManagerIDE";
import Menu from "./Menu";

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    height: "100%",
    maxHeight: "100%"
  }
}));

const Configuration = ({ id, name, profile, call, on, emit, alert }) => {
  // State Hooks
  const [code, setCode] = React.useState("testingcode");
  const [lastUpdate, setLastUpdate] = React.useState({
    user: "movai",
    lastUpdate: "02/11/2021 at 11:48:22"
  });
  const [type, setType] = React.useState("yaml");
  // Style Hooks
  const classes = useStyles();
  // React Refs
  const editorRef = React.useRef();

  //========================================================================================
  /*                                                                                      *
   *                                   React life cycles                                   *
   *                                                                                      */
  //========================================================================================

  // Component did mount
  React.useEffect(() => {
    // Get last update info
    const loadLastUpdateInfo = data => {
      const user = data.LastUpdate?.user || data.User || "N/A";
      const lastUpdate = data.LastUpdate?.date || data.LastUpdate || "N/A";
      return { user, lastUpdate };
    };
    // Set state hooks
    const loadData = data => {
      const updateInfo = loadLastUpdateInfo(data);
      setType(data.Type);
      setCode(data.Yaml);
      setLastUpdate(updateInfo);
    };
    // Load data
    // call("docManager", "read", id).then(data => loadData(data));
    // Open right menu details
    emit("open-rightDrawer");
    // Subscribed to changes
    on("docManager", "update", data => {
      if (data.id === id) loadData(data);
    });
    // component will unmount
    return () => {};
  }, [profile, on, id, emit, call]);

  // Render right menu
  React.useEffect(() => {
    const viewPlugin = new Menu(
      { name: `${id}-menu`, location: "rightDrawer" },
      { id, name, lastUpdate }
    );
    PluginManagerIDE.install(`${id}-menu`, viewPlugin);
  }, [id, name, lastUpdate]);

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  const createNewConfig = newName => {
    if (!newName) return;

    const payload = {
      type: SCOPES.Configuration,
      name: newName,
      body: { Yaml: code, Type: type }
    };

    call("docManager", "create", payload)
      .then(response => {
        // TODO: Expose updateTab method to rename tab after creation
        call("tabs", "updateTab", {
          oldName: "untitled.conf",
          newName: response.name
        });
        // TODO: send success alert
        alert("Successfully saved");
      })
      .catch(error => {
        // TODO: send error alert
        alert(error.statusText, "error");
      });
  };

  const saveConfig = () => {
    // Create new document
    if (!id) {
      // TODO
      createNewConfig("newName");
    }
    // Update existing document
    else {
      call("docManager", "update", { Label: id, Yaml: code, Type: type })
        .then(res => alert("Successfully saved"))
        .catch(error => alert(error.statusText, "error"));
    }
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Render Functions                                   *
   *                                                                                      */
  //========================================================================================

  const renderEditor = () => {
    return (
      <div
        className={classes.container}
        style={{ maxHeight: "calc(100% - 48px)" }}
      >
        <textarea
          ref={editorRef}
          style={{ flexGrow: 1, height: "100%" }}
          value={code}
          language={type}
          // theme={theme.codeEditor.theme}
          // options={{ readOnly: !editable }}
          onLoad={editor => {
            if (!id) editor.focus();
          }}
          onChange={newCode => {
            setCode(newCode);
          }}
        />
      </div>
    );
  };

  return (
    <div
      className={classes.container}
      onFocus={() => {
        console.log("debug onFocus", id);
        call("rightDrawer", "update", `${id}-menu`);
      }}
    >
      <AppBar position="static" color="inherit">
        <Toolbar variant="dense">
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(event, newAlignment) => setType(newAlignment)}
            aria-label="text alignment"
            size="small"
          >
            <ToggleButton value="xml" aria-label="left aligned">
              XML
            </ToggleButton>
            <ToggleButton value="yaml" aria-label="centered">
              YAML
            </ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
      {renderEditor()}
    </div>
  );
};

export default withViewPlugin(Configuration);

Configuration.propTypes = {
  profile: PropTypes.object.isRequired,
  alert: PropTypes.func
};

Configuration.defaultProps = {
  profile: { name: "configuration" },
  alert: alert
};
