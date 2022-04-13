import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import { AppBar, Toolbar } from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { useTheme } from "@material-ui/core/styles";
import InfoIcon from "@material-ui/icons/Info";
import Model from "../../../../models/Configuration/Configuration";
import { defaultFunction } from "../../../../utils/Utils";
import { PLUGINS } from "../../../../utils/Constants";
import { usePluginMethods } from "../../../../engine/ReactPlugin/ViewReactPlugin";
import { withEditorPlugin } from "../../../../engine/ReactPlugin/EditorReactPlugin";
import useDataSubscriber from "../../../DocManager/useDataSubscriber";
import Menu from "./Menu";

import { configurationStyles } from "./styles";

const Configuration = (props, ref) => {
  const {
    id,
    name,
    call,
    instance,
    activateEditor = () => defaultFunction("activateEditor"),
    saveDocument = () => defaultFunction("saveDocument"),
    editable = true
  } = props;
  // Other Hooks
  const { data } = useDataSubscriber({
    instance,
    propsData: props.data,
    keysToDisconsider: Model.KEYS_TO_DISCONSIDER
  });
  // Style Hooks
  const classes = configurationStyles();
  const theme = useTheme();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  const renderRightMenu = useCallback(() => {
    const details = props.data?.details || {};
    const menuName = `${id}-detail-menu`;
    const menuTitle = t("ConfigurationDetailsMenuTitle");
    // add bookmark
    call(PLUGINS.RIGHT_DRAWER.NAME, PLUGINS.RIGHT_DRAWER.CALL.SET_BOOKMARK, {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        title: menuTitle,
        view: (
          <Menu id={id} name={name} details={details} model={instance}></Menu>
        )
      }
    });
  }, [call, id, name, instance, props.data, t]);

  usePluginMethods(ref, {
    renderRightMenu
  });

  //========================================================================================
  /*                                                                                      *
   *                                 Document Functions                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Updates the config extension
   * @param {String} value
   */
  const updateConfigExtension = value => {
    if (instance.current) instance.current.setExtension(value);
  };

  /**
   * Updates the config code
   * @param {String} value
   * @returns
   */
  const updateConfigCode = value => {
    if (value === instance.current.getCode()) return;
    if (instance.current) instance.current.setCode(value);
  };

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle File Type Change
   * @param {*} event
   * @param {String} newExtension
   */
  const handleChangeFileType = (event, newExtension) => {
    event.stopPropagation();
    updateConfigExtension(newExtension);
  };

  /**
   * Should be called when editor loads
   * @param {*} editor
   */
  const onLoadEditor = editor => {
    if (!id) editor.focus();
    // Add testid
    editor._domElement
      .querySelector("textarea")
      .setAttribute("data-testid", "input_code");
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Render Functions                                   *
   *                                                                                      */
  //========================================================================================

  const renderEditor = () => {
    return (
      <div className={classes.container}>
        <MonacoCodeEditor
          value={data.code}
          language={data.extension}
          theme={theme.codeEditor.theme}
          options={{ readOnly: !editable }}
          onChange={updateConfigCode}
          onSave={saveDocument}
          onLoad={onLoadEditor}
        />
      </div>
    );
  };

  return (
    <div
      data-testid="section_configuration-editor"
      className={classes.container}
    >
      <AppBar
        data-testid="section_app-bar"
        position="static"
        className={classes.appBar}
      >
        <Toolbar
          data-testid="input-toolbar"
          variant="dense"
          onClick={activateEditor}
        >
          <ToggleButtonGroup
            size="small"
            exclusive
            value={data.extension}
            onChange={handleChangeFileType}
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

Configuration.scope = "Configuration";

Configuration.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  call: PropTypes.func.isRequired,
  instance: PropTypes.object,
  data: PropTypes.object,
  editable: PropTypes.bool,
  saveDocument: PropTypes.func,
  activateEditor: PropTypes.func
};

export default withEditorPlugin(Configuration);
