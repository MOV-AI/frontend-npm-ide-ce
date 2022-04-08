import React from "react";
import PropTypes from "prop-types";
import { defaultFunction, getRefComponent } from "../../utils/Utils";
import PluginManagerIDE from "../PluginManagerIDE/PluginManagerIDE";
import IDEPlugin from "../IDEPlugin/IDEPlugin";

const DEFAULT_PLUGIN = {
  call: () => defaultFunction("call"),
  emit: () => defaultFunction("emit"),
  on: () => defaultFunction("on"),
  off: () => defaultFunction("off"),
  onTopic: () => defaultFunction("onTopic")
};

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
   * @param {Object} _profile
   * @param {React Component} _view
   */
  addView(_profile, _view) {
    // Abstract method to implement in subclasses
  }
  /**
   *
   * @param {Object} _profile
   */
  removeView(_profile) {
    // Abstract method to implement in subclasses
  }

  /**
   *
   * @param {String} _viewName
   * @param {Object} _viewPluginProps
   */
  update(_viewName, _viewPluginProps) {
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
    const RefComponent = getRefComponent(ReactComponent);
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
        off={plugin.off}
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
        methods.forEach(_name => {
          this[_name] = (...args) => componentRef.current[_name](...args);
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
