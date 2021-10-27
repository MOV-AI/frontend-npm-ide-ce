import React from "react";
import PluginManagerIDE from "../PluginManagerIDE/PluginManagerIDE";
import PropTypes from "prop-types";
import IDEPlugin from "../IDEplugin/IDEPlugin";

export class HostReactPlugin extends IDEPlugin {
  constructor(profile) {
    // Remove duplicated if needed
    const methods = Array.from(
      new Set([...(profile.methods || []), "addView", "removeView", "update"])
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
 * @param {ReactComponent} Component
 * @returns {ReactComponent}
 */
export function withHostReactPlugin(Component) {
  const InnerHost = props => {
    const { viewPlugins, plugin } = useHostReactPlugin({
      name: props.hostName
    });
    return (
      <Component
        {...props}
        viewPlugins={viewPlugins}
        call={plugin.call}
        on={plugin.on}
        emit={plugin.emit}
        onTopic={plugin.onTopic}
      ></Component>
    );
  };

  InnerHost.propTypes = {
    hostName: PropTypes.string.isRequired
  };
  return InnerHost;
}

export const useHostReactPlugin = ({ name }) => {
  const [elements, setElements] = React.useState([]);
  const [plugin, setPlugin] = React.useState(DEFAULT_PLUGIN);
  React.useEffect(() => {
    class InnerPlugin extends HostReactPlugin {
      name2Component = {};
      addView(profile, view) {
        if (!(profile.name in this.name2Component)) {
          this.name2Component[profile.name] = view;
        }
        setElements(view);
        setPlugin(this);
      }

      update(viewName, props) {
        if (viewName in this.name2Component) {
          setElements(React.cloneElement(this.name2Component[viewName], props));
          setPlugin(this);
        }
      }

      removeView(profile) {
        if (profile.name in this.name2Component) {
          delete this.name2Component[profile.name];
          setElements([]);
          setPlugin(DEFAULT_PLUGIN);
        }
      }
    }
    const plugin = new InnerPlugin({ name });
    PluginManagerIDE.install(name, plugin);
  }, [name]);

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
