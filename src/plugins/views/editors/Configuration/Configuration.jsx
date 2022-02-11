import React from "react";
import PropTypes from "prop-types";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import { AppBar, Toolbar } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import InfoIcon from "@material-ui/icons/Info";
import Model from "../../../../models/Configuration/Configuration";
import { PLUGINS } from "../../../../utils/Constants";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import useDataSubscriber from "../../../DocManager/useDataSubscriber";
import { DEFAULT_FUNCTION } from "../_shared/mocks";
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
    instance,
    activateEditor = () => DEFAULT_FUNCTION("activateEditor"),
    saveDocument = () => DEFAULT_FUNCTION("saveDocument"),
    editable = true
  } = props;
  // Other Hooks
  const { data } = useDataSubscriber({
    instance,
    propsData: props.data,
    keysToDisconsider: [Model.OBSERVABLE_KEYS.CODE]
  });
  // Style Hooks
  const classes = useStyles();
  const theme = useTheme();

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = React.useCallback(() => {
    const details = props.data?.details || {};
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call(PLUGINS.RIGHT_DRAWER.NAME, PLUGINS.RIGHT_DRAWER.CALL.SET_BOOKMARK, {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: (
          <Menu id={id} name={name} details={details} model={instance}></Menu>
        )
      }
    });
  }, [call, id, name, instance, props.data]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  const updateConfigExtension = value => {
    if (instance.current) instance.current.setExtension(value);
  };

  const updateConfigCode = value => {
    if (value === instance.current.getCode()) return;
    if (instance.current) instance.current.setCode(value);
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
          style={{ flexGrow: 1, height: "100%", width: "100%" }}
          value={data.code}
          language={data.extension}
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
            value={data.extension}
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
  alert: PropTypes.func
};
