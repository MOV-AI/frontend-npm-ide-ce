import React, { useMemo, useEffect, useCallback } from "react";
import withAlerts from "../../decorators/withAlerts";
import withKeyBinds from "../../decorators/withKeyBinds";
import withMenuHandler from "../../decorators/withMenuHandler";
import withLoader from "../../decorators/withLoader";
import { withDataHandler } from "../../plugins/DocManager/DataHandler";
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
  const composed = React.forwardRef((props, ref) =>
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
  const RefComponent = React.forwardRef((props, ref) =>
    ReactComponent(props, ref)
  );

  /**
   * Component responsible to handle common editor lifecycle
   */
  const EditorComponent = React.forwardRef((props, ref) => {
    const {
      id,
      on,
      off,
      name,
      call,
      scope,
      addKeyBind,
      removeKeyBind,
      save,
      instance,
      activateKeyBind,
      initRightMenu,
      updateRightMenu
    } = props;

    const TAB_ACTIVE_EVENT = useMemo(() => `${id}-active`, [id]);

    /**
     * Handle submit action on save outdated document
     * @param {string} action : One of options ("cancel", "updateDoc", "overwriteDoc")
     */
    const _handleOutdatedSave = React.useCallback(
      action => {
        const getSaveByAction = {
          updateDoc: () => call("docManager", "reloadDoc", { scope, name }),
          overwriteDoc: save
        };
        return action in getSaveByAction ? getSaveByAction[action]() : false;
      },
      [call, save, scope, name]
    );

    /**
     * Save document :
     *  if document is outdated => prompt alert to the user before saving
     *  else => Proceed with saving document
     *    if doc is new => Create document in DB
     *    else => Update document in DB
     */
    const saveDocument = React.useCallback(() => {
      // If document is outdated

      if (!instance.current.isDirty) return;

      if (instance.current.getOutdated()) {
        call("dialog", "saveOutdatedDocument", {
          name,
          scope,
          onSubmit: _handleOutdatedSave
        });
      } else {
        instance.current.getIsNew()
          ? call("dialog", "newDocument", {
              scope,
              onSubmit: newName => save(newName)
            })
          : save();
      }
    }, [call, instance, save, _handleOutdatedSave, scope, name]);

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
      addKeyBind("ctrl+s", saveDocument);
      on(PLUGINS.TABS.NAME, TAB_ACTIVE_EVENT, activateEditor);

      // Remove key bind on component unmount
      return () => {
        removeKeyBind("ctrl+s");
        off(PLUGINS.TABS.NAME, TAB_ACTIVE_EVENT);
      };
    }, [
      activateEditor,
      addKeyBind,
      removeKeyBind,
      TAB_ACTIVE_EVENT,
      initRightMenu,
      on,
      off,
      saveDocument
    ]);

    return (
      <div onFocus={activateEditor} className={`container-${scope}`}>
        <RefComponent
          {...props}
          activateEditor={activateEditor}
          saveDocument={saveDocument}
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
