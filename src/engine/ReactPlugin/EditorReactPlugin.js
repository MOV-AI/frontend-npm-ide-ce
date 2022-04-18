import React, { forwardRef, useCallback, useEffect } from "react";
import withAlerts from "../../decorators/withAlerts";
import withKeyBinds from "../../decorators/withKeyBinds";
import withMenuHandler from "../../decorators/withMenuHandler";
import withLoader from "../../decorators/withLoader";
import { withDataHandler } from "../../plugins/DocManager/DataHandler";
import { KEYBINDINGS } from "../../utils/Keybindings";
import { PLUGINS } from "../../utils/Constants";
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
      call,
      scope,
      addKeyBind,
      removeKeyBind,
      save,
      activateKeyBind,
      deactivateKeyBind,
      initRightMenu,
      updateRightMenu
    } = props;

    /**
     * Save all documents :
     *  Saves all documents that are dirty
     */
    const saveAllDocuments = useCallback(() => {
      call(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.CALL.SAVE_DIRTIES);
    }, [call]);

    /**
     * Activate editor : activate editor's keybinds and update right menu
     */
    const activateEditor = useCallback(() => {
      activateKeyBind();
      updateRightMenu();
    }, [activateKeyBind, updateRightMenu]);

    /**
     * Component did mount
     */
    useEffect(() => {
      initRightMenu();
      addKeyBind(KEYBINDINGS.SAVE, save);
      addKeyBind(KEYBINDINGS.SAVE_ALL, saveAllDocuments);
      on(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE, data => {
        if (data.id === id) {
          activateEditor();
        }
      });

      // Remove key bind on component unmount
      return () => {
        removeKeyBind(KEYBINDINGS.SAVE);
        removeKeyBind(KEYBINDINGS.SAVE_ALL);
        off(PLUGINS.TABS.NAME, PLUGINS.TABS.ON.ACTIVE_TAB_CHANGE);
      };
    }, [
      id,
      activateEditor,
      addKeyBind,
      removeKeyBind,
      initRightMenu,
      on,
      off,
      save,
      saveAllDocuments
    ]);

    return (
      <div
        tabIndex="-1"
        onFocus={activateEditor}
        onBlur={deactivateKeyBind}
        className={`container-${scope}`}
      >
        <RefComponent
          {...props}
          activateEditor={activateEditor}
          saveDocument={save}
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
