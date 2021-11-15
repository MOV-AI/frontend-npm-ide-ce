import React from "react";
import IDEPlugin from "../IDEPlugin/IDEPlugin";
import PluginManagerIDE from "../PluginManagerIDE/PluginManagerIDE";

export class ViewReactPlugin extends IDEPlugin {
  /**
   *
   * @returns {React Component}
   */
  render() {
    // Abstract method should be implemented in subclasses
  }

  async activate() {
    if (this.profile.location)
      await this.call(
        this.profile.location,
        "addView",
        this.profile,
        this.render()
      );
    super.activate();
  }

  deactivate() {
    console.log("debug deactivate", this.profile.name);
    if (this.profile.location)
      this.call(this.profile.location, "removeView", this.profile);
    super.deactivate();
  }
}

/**
 *
 * @param {ReactComponent} ReactComponent
 * @returns {ViewReactPlugin}
 */
export function withViewPlugin(ReactComponent, methods = []) {
  const RefComponent = React.forwardRef((props, ref) =>
    ReactComponent(props, ref)
  );
  const WithPlugin = class extends ViewReactPlugin {
    constructor(profile, props = {}) {
      const existingPlugin = PluginManagerIDE.getPlugin(profile.name);
      if (existingPlugin) return existingPlugin;
      super({
        ...profile,
        methods: ["render", ...methods]
      });

      this.ref = React.createRef();
      this.initMethods();
      this.props = props;
    }

    initMethods = () => {
      methods.forEach(name => {
        this[name] = (...a) => this.ref.current[name](...a);
      });
    };

    render() {
      return (
        <RefComponent
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
  return WithPlugin;
}

/**
 * Hook to allow use of methods in view plugins
 * @param {ReactRef} ref : React ref
 * @param {Object} methods : Object maping all the methods to be exported in the plugin
 */
export const usePluginMethods = (ref, methods) => {
  React.useImperativeHandle(ref, () => ({
    ...methods
  }));
};
