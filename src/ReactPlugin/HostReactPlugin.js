import { Plugin } from "@remixproject/engine";
import React from "react";
import PluginManagerIDE from "../PluginManagerIDE/PluginManagerIDE";
import PropTypes from "prop-types";

export class HostReactPlugin extends Plugin {
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

export const useHostReactPlugin = ({ name }) => {
  const [elements, setElements] = React.useState([]);
  React.useEffect(() => {
    class InnerHost extends HostReactPlugin {
      name2Component = {};
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
    const plugin = new InnerHost({ name });
    PluginManagerIDE.install(name, plugin);
  }, [name]);

  return elements;
};

useHostReactPlugin.propTypes = {
  profile: PropTypes.object.isRequired
};
