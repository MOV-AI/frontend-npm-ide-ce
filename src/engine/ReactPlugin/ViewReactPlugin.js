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
    if (this.profile.location)
      this.call(this.profile.location, "removeView", this.profile);
    super.deactivate();
  }
}

export class ViewPlugin extends ViewReactPlugin {
  constructor(profile, props = {}, methods = []) {
    const existingPlugin = PluginManagerIDE.getPlugin(profile.name);
    if (existingPlugin) return existingPlugin;
    super({
      ...profile,
      methods: ["render", ...methods]
    });

    this.methods = methods;
    this.ref = React.createRef();
    this.initMethods();
    this.props = props;
  }

  initMethods = () => {
    this.methods.forEach(name => {
      this[name] = (...a) => {
        if (!this.ref.current) {
          return console.warn("debug method not implemented in component");
        }
        this.ref.current[name](...a);
      };
    });
  };
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
  return class extends ViewPlugin {
    constructor(profile, props = {}) {
      super(profile, props, methods);
    }

    render(otherProps = {}) {
      return (
        <RefComponent
          {...this.props}
          {...otherProps}
          ref={this.ref}
          call={this.call}
          profile={this.profile}
          emit={this.emit}
          off={this.off}
          on={this.on}
          onTopic={this.onTopic}
        />
      );
    }
  };
}

//========================================================================================
/*                                                                                      *
 *                                   Shared hooks                                      *
 *                                                                                      */
//========================================================================================

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

/**
 * Give the previous state of a prop or state hook on change
 * @param {*} value : Value to get previous state
 * @returns {*} Previous value
 */
export const usePrevious = value => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
