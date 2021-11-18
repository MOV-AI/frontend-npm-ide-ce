import React from "react";
import PropTypes from "prop-types";
import ConfigurationModel from "../../../../models/Configuration/Configuration";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import {
  usePluginMethods,
  usePrevious
} from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { AppBar, Toolbar } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import Menu from "./Menu";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    height: "100%",
    maxHeight: "100%"
  },
  appBar: {
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    "& button span": {
      color: theme.palette.text.primary
    }
  }
}));

const EMPTY_MODEL_NAME = "__placeholder__";

const Configuration = (props, ref) => {
  const {
    id,
    name,
    call,
    setData = () => {},
    data = new ConfigurationModel(EMPTY_MODEL_NAME).data,
    editable = true
  } = props;
  // Style Hooks
  const classes = useStyles();
  const theme = useTheme();
  // Refs
  const editorRef = React.useRef();
  const previousData = usePrevious(data);

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = React.useCallback(() => {
    const details = data.LastUpdate || {};
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: <Menu id={id} name={name} details={details}></Menu>
      }
    });
  }, [call, id, name, data.LastUpdate]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  //========================================================================================
  /*                                                                                      *
   *                                   React lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  // Render right menu
  React.useEffect(() => {
    // Reset editor undoManager after first load
    if (editorRef.current && previousData?.Label === EMPTY_MODEL_NAME) {
      const editorModel = editorRef.current.getModel();
      const loadedCode = data?.Yaml || "";
      editorModel.setValue(loadedCode);
    }
  }, [data, previousData]);

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  const updateConfigType = configType => {
    setData(prevState => {
      return { ...prevState, Type: configType };
    });
  };

  const updateConfigText = configText => {
    setData(prevState => {
      return { ...prevState, Yaml: configText };
    });
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
        <MonacoCodeEditor
          ref={editorRef}
          style={{ flexGrow: 1, height: "100%", width: "100%" }}
          value={data.Yaml}
          language={data.Type}
          theme={theme.codeEditor.theme}
          options={{ readOnly: !editable }}
          onChange={updateConfigText}
          onLoad={editor => {
            if (!id) editor.focus();
          }}
        />
      </div>
    );
  };

  return (
    <div className={classes.container} onFocus={renderRightMenu}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar variant="dense" onClick={renderRightMenu}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={data.Type}
            onChange={(event, newValue) => updateConfigType(newValue)}
          >
            <ToggleButton value="xml">XML</ToggleButton>
            <ToggleButton value="yaml">YAML</ToggleButton>
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
      {renderEditor()}
    </div>
  );
};

export default withEditorPlugin(Configuration);

Configuration.scope = "Configuration";

Configuration.propTypes = {
  profile: PropTypes.object.isRequired,
  data: PropTypes.object,
  editable: PropTypes.bool,
  onChange: PropTypes.func,
  alert: PropTypes.func
};
