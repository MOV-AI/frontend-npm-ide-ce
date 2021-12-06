import React from "react";
import PropTypes from "prop-types";
import Model from "../../../../models/Configuration/Configuration";
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

const DEFAULT_FUNCTION = name => console.log(`${name} not implemented`);

const Configuration = (props, ref) => {
  const {
    id,
    name,
    call,
    setData,
    activateEditor = () => DEFAULT_FUNCTION("activateEditor"),
    saveDocument = () => DEFAULT_FUNCTION("saveDocument"),
    data = new Model({}).serialize(),
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
    if (editorRef.current && previousData?.Label === null) {
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

  const updateConfigExtension = configExtension => {
    setData(prevState => {
      return { ...prevState, Type: configExtension };
    });
  };

  const updateConfigCode = configCode => {
    setData(prevState => {
      if (prevState.Yaml === configCode) return prevState;
      return { ...prevState, Yaml: configCode };
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
          onChange={updateConfigCode}
          onSave={saveDocument}
          onLoad={editor => {
            if (!id) editor.focus();
          }}
        />
      </div>
    );
  };

  return (
    <div className={classes.container}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar variant="dense" onClick={activateEditor}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={data.Type}
            onChange={(event, newExtension) => {
              event.stopPropagation();
              updateConfigExtension(newExtension);
            }}
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
