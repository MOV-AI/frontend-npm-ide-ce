import React from "react";
import PropTypes from "prop-types";
import Model from "../../../../models/Callback/Callback";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import InfoIcon from "@material-ui/icons/Info";
import Menu from "./Menu";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    height: "100%",
    maxHeight: "100%"
  }
}));

const Callback = (props, ref) => {
  const {
    id,
    name,
    call,
    scope,
    instance,
    saveDocument = () => console.log(`Not implemented`),
    data = new Model({}).serialize(),
    editable = true
  } = props;
  // Style Hooks
  const classes = useStyles();
  const theme = useTheme();

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = React.useCallback(() => {
    const menuName = `${id}-detail-menu`;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: <Menu id={id} call={call} name={name} scope={scope} />
      }
    });
  }, [call, id, name, scope]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  const updateCallbackCode = value => {
    if (value === instance.current.getCode()) return;
    if (instance.current) instance.current.setCode(value);
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Render Functions                                   *
   *                                                                                      */
  //========================================================================================

  return (
    <div className={classes.container}>
      <MonacoCodeEditor
        style={{ flexGrow: 1, height: "100%", width: "100%" }}
        value={data.code}
        language={"python"}
        theme={theme.codeEditor.theme}
        options={{ readOnly: !editable }}
        onChange={updateCallbackCode}
        onSave={saveDocument}
        onLoad={editor => {
          if (!id) editor.focus();
        }}
      />
    </div>
  );
};

export default withEditorPlugin(Callback);

Callback.scope = "Configuration";

Callback.propTypes = {
  profile: PropTypes.object.isRequired,
  data: PropTypes.object,
  editable: PropTypes.bool,
  alert: PropTypes.func
};
