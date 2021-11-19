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

const Configuration = (props, ref) => {
  const {
    id,
    name,
    call,
    setData = () => {},
    activateEditor = () => {},
    data = ConfigurationModel.EMPTY,
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
    const details = data.details || {};
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: <Menu id={id} name={name} details={details}></Menu>
      }
    });
  }, [call, id, name, data.details]);

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
    if (
      editorRef.current &&
      previousData?.name === ConfigurationModel.EMPTY.name
    ) {
      const editorModel = editorRef.current.getModel();
      const loadedCode = data?.code || "";
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
      return (prevState || ConfigurationModel.EMPTY).setExtension(
        configExtension
      );
    });
  };

  const updateConfigCode = configCode => {
    setData(prevState => {
      return (prevState || ConfigurationModel.EMPTY).setCode(configCode);
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
          value={data.code}
          language={data.extension}
          theme={theme.codeEditor.theme}
          options={{ readOnly: !editable }}
          onChange={updateConfigCode}
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
            value={data.extension}
            onChange={(event, newExtension) =>
              updateConfigExtension(newExtension)
            }
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
