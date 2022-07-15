import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import withAlerts from "../../decorators/withAlerts";
import withKeyBinds from "../../decorators/withKeyBinds";
import withMenuHandler from "../../decorators/withMenuHandler";
import withLoader from "../../decorators/withLoader";
import { withDataHandler } from "../../plugins/DocManager/DataHandler";
import { KEYBINDINGS } from "../../utils/shortcuts";
import { PLUGINS } from "../../utils/Constants";
import { getNameFromURL } from "../../utils/Utils";
import { ViewPlugin } from "./ViewReactPlugin";

/**
 * Add decorators to Component always forwarding ref
 * @param {ReactComponent} Component : Component to be decorated
 * @param {Array<decorators>} decorators : Array of decorators to be added to component
 * @returns Fully decorated component
 */
const composeDecorators = (Component, decorators) => {
  const [withFirstDecorator, ...otherDecorators] = decorators;
  const composed = forwardRef((props, ref) =>
    withFirstDecorator(Component)(props, ref)
  );
  if (otherDecorators.length)
    return composeDecorators(composed, otherDecorators);
  else return composed;
};

/**
 * Decorate react component and handle shared behavior between editors
 * @param {ReactComponent} ReactComponent : Editor React Component
 * @param {Array<String>} methods : Methods to be exposed
 * @returns
 */
export function withEditorPlugin(ReactComponent, methods = []) {
  const RefComponent = forwardRef((props, ref) => ReactComponent(props, ref));

  /**
   * Component responsible to handle common editor lifecycle
   */
  const EditorComponent = forwardRef((props, ref) => {
    const {
      id,
      on,
      off,
      scope,
      addKeyBind,
      removeKeyBind,
      save,
      activateKeyBind,
      deactivateKeyBind,
      initRightMenu,
      updateRightMenu
    } = props;

    const editorContainer = useRef();

    /**
     * Activate editor : activate editor's keybinds and update right menu
     */
    const activateEditor = useCallback(() => {
      activateKeyBind();
      updateRightMenu();
    }, [activateKeyBind, updateRightMenu]);

    /**
     * Activate keybinds if is this editor
     */
    const activateThisKeys = useCallback(
      ({ instance }) => {
        if (!instance) return;
        if (instance.id === getNameFromURL(id)) editorContainer.current.focus();
      },
      [id]
    );

    /**
     * Component did mount
     */
    useEffect(() => {
      initRightMenu();
      addKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS, save);
      on(
        PLUGINS.TABS.NAME,
        PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE,
        activateThisKeys
      );

      on(
        PLUGINS.DOC_MANAGER.NAME,
        PLUGINS.DOC_MANAGER.ON.UPDATE_DOC_DIRTY,
        activateThisKeys
      );

      // Remove key bind on component unmount
      return () => {
        removeKeyBind(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS);
        off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
        off(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.UPDATE_DOC_DIRTY);
      };
    }, [
      id,
      addKeyBind,
      removeKeyBind,
      initRightMenu,
      on,
      off,
      save,
      activateThisKeys
    ]);

    return (
      <div
        tabIndex="-1"
        ref={editorContainer}
        onFocus={activateEditor}
        onBlur={deactivateKeyBind}
        className={`container-${scope}`}
      >
        <RefComponent
          {...props}
          activateEditor={activateEditor}
          saveDocument={save}
          deactivateKeyBind={deactivateKeyBind}
          ref={ref}
        />
      </div>
    );
  });

  // Decorate component
  const DecoratedEditorComponent = composeDecorators(EditorComponent, [
    withMenuHandler,
    withLoader,
    withKeyBinds,
    withDataHandler,
    withAlerts
  ]);

  /**
   * Return Plugin class rendering decorated editor component
   */
  return class extends ViewPlugin {
    constructor(profile, props = {}) {
      super(profile, props, methods);
    }

    render() {
      return (
        <DecoratedEditorComponent
          {...this.props}
          ref={this.ref}
          call={this.call}
          profile={this.profile}
          emit={this.emit}
          on={this.on}
          off={this.off}
          onTopic={this.onTopic}
        />
      );
    }
  };
}
