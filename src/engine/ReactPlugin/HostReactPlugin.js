import React from "react";
import PluginManagerIDE from "../PluginManagerIDE/PluginManagerIDE";
import PropTypes from "prop-types";
import IDEPlugin from "../IDEPlugin/IDEPlugin";

export class HostReactPlugin extends IDEPlugin {
  constructor(profile) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([...(profile.methods ?? []), "addView", "removeView", "update"])
    );
    super({ ...profile, methods });
  }

  /**
   *
   * @param {Object} profile
   * @param {React Component} view
   */
  addView(profile, view) {
    // Abstract method to implement in subclasses
  }
  /**
   *
   * @param {Object} profile
   */
  removeView(profile) {
    // Abstract method to implement in subclasses
  }

  /**
   *
   * @param {String} viewName
   * @param {Object} viewPluginProps
   */
  update(viewName, viewPluginProps) {
    // Abstract method to implement in subclasses
  }
}

/**
 *
 * @param {ReactComponent} ReactComponent
 * @returns {ReactComponent}
 */
export function withHostReactPlugin(ReactComponent, methods = []) {
  const InnerHost = props => {
    const ref = React.useRef();
    const RefComponent = React.forwardRef((props, ref) =>
      ReactComponent(props, ref)
    );
    const { viewPlugins, plugin } = useHostReactPlugin(
      {
        name: props.hostName,
        methods
      },
      ref
    );

    return (
      <RefComponent
        {...props}
        ref={ref}
        viewPlugins={viewPlugins}
        onTopic={plugin.onTopic}
        call={plugin.call}
        emit={plugin.emit}
        on={plugin.on}
      />
    );
  };

  InnerHost.propTypes = {
    hostName: PropTypes.string.isRequired
  };
  return InnerHost;
}

export const useHostReactPlugin = ({ name, methods }, componentRef) => {
  const [elements, setElements] = React.useState([]);
  const [plugin, setPlugin] = React.useState(DEFAULT_PLUGIN);
  React.useEffect(() => {
    class InnerPlugin extends HostReactPlugin {
      constructor(profile) {
        super(profile);
        this.name2Component = {};
        this.initMethods();
      }

      initMethods = () => {
        methods.forEach(name => {
          this[name] = (...args) => componentRef.current[name](...args);
        });
      };

      addView(profile, view) {
        if (!(profile.name in this.name2Component)) {
          this.name2Component[profile.name] = view;
        }
        setElements(view);
      }

      update(viewName, props) {
        if (viewName in this.name2Component) {
          setElements(React.cloneElement(this.name2Component[viewName], props));
        }
      }

      removeView(profile) {
        if (profile.name in this.name2Component) {
          delete this.name2Component[profile.name];
          setElements([]);
        }
      }
    }
    const _plugin = new InnerPlugin({ name, methods });
    PluginManagerIDE.install(name, _plugin);
    setPlugin(_plugin);
  }, [name, methods, componentRef]);

  return { viewPlugins: elements, plugin };
};

useHostReactPlugin.propTypes = {
  profile: PropTypes.object.isRequired
};

const DEFAULT_PLUGIN = {
  call: () => {},
  emit: () => {},
  on: () => {},
  onTopic: () => {}
};
