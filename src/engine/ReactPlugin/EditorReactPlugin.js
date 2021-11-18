import React from "react";
import DataHandler from "../../plugins/DocManager/DataHandler";
import { ViewPlugin } from "./ViewReactPlugin";

export function withEditorPlugin(ReactComponent, methods = []) {
  const RefComponent = React.forwardRef((props, ref) =>
    ReactComponent(props, ref)
  );
  const WithEditorPlugin = class extends ViewPlugin {
    constructor(profile, props = {}) {
      super(profile, props, methods);
    }

    render() {
      return (
        <DataHandler {...this.props} call={this.call} on={this.on}>
          <RefComponent
            {...this.props}
            ref={this.ref}
            call={this.call}
            profile={this.profile}
            emit={this.emit}
            on={this.on}
            onTopic={this.onTopic}
          />
        </DataHandler>
      );
    }
  };

  return WithEditorPlugin;
}
