import React from "react";
import withKeyBinds from "../../decorators/withKeyBinds";
import withMenuHandler from "../../decorators/withMenuHandler";
import { withDataHandler } from "../../plugins/DocManager/DataHandler";
import { ViewPlugin } from "./ViewReactPlugin";

/**
 *
 * @param {*} Component
 * @param {*} decorators
 * @returns
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

export function withEditorPlugin(ReactComponent, methods = []) {
  const RefComponent = React.forwardRef((props, ref) =>
    ReactComponent(props, ref)
  );

  const EditorComponent = React.forwardRef((props, ref) => {
    const {
      id,
      on,
      call,
      addKeyBind,
      scope,
      data,
      save,
      create,
      activateKeyBind,
      initRightMenu,
      updateRightMenu
    } = props;

    /**
     *
     */
    const saveDocument = React.useCallback(() => {
      if (data.isNew) {
        // open new widget modal passing create as submit callback
        call("formDialog", "newDocument", {
          scope: scope,
          onSubmit: create,
          title: `New ${scope}`
        });
      } else {
        save();
      }
    }, [call, save, data, create, scope]);

    /**
     *
     */
    const activateEditor = React.useCallback(() => {
      activateKeyBind();
      updateRightMenu();
    }, [activateKeyBind, updateRightMenu]);

    React.useEffect(() => {
      addKeyBind("ctrl+s", saveDocument);
      initRightMenu();
      on("tabs", `${id}-active`, activateEditor);
    }, [activateEditor, addKeyBind, id, initRightMenu, on, saveDocument]);

    return (
      <div onFocus={activateEditor} style={{ height: "100%" }}>
        <RefComponent
          {...props}
          activateEditor={activateEditor}
          saveDocument={saveDocument}
          ref={ref}
        />
      </div>
    );
  });

  const DecoratedEditorComponent = composeDecorators(EditorComponent, [
    withMenuHandler,
    withKeyBinds,
    withDataHandler
  ]);

  const WithEditorPlugin = class extends ViewPlugin {
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
          onTopic={this.onTopic}
        />
      );
    }
  };

  return WithEditorPlugin;
}
