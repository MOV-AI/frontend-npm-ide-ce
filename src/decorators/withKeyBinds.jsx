import React from "react";
import hotkeys from "hotkeys-js";

hotkeys.filter = function (event) {
  return true;
};

hotkeys("ctrl+s", event => {
  event.preventDefault();
});

/**
 * Manage Key binds
 * @param {*} Component
 * @returns
 */
const withKeyBinds = Component => {
  return (props, ref) => {
    // Props
    const { name } = props;
    // Refs
    const scopeRef = React.useRef();

    /**
     * Activate scope shortcuts.
     * This will automatically deactivate all other scopes
     */
    const activateKeyBind = () => {
      hotkeys.setScope(scopeRef.current);
    };

    /**
     * Add Key bind to its scope
     * @param {*} keys
     * @param {*} callback
     */
    const addKeyBind = (keys, callback) => {
      if (!scopeRef.current) return;
      const keysToBind = Array.isArray(keys) ? keys.join(",") : keys;
      activateKeyBind();
      hotkeys(keysToBind, scopeRef.current, callback);
    };

    /**
     * Remove key bind from scope
     * @param {*} key
     */
    const removeKeyBind = keys => {
      const keysToUnbind = Array.isArray(keys) ? keys.join(",") : keys;
      hotkeys.unbind(keysToUnbind, scopeRef.current);
    };

    /**
     * Component initialization : set scope id
     */
    React.useEffect(() => {
      scopeRef.current = `${name}-${Math.random()}`;
      // Delete scope to unbind keys when component is unmounted
      return () => {
        hotkeys.deleteScope(scopeRef.current);
      };
    }, [name]);

    return (
      <Component
        {...props}
        ref={ref}
        addKeyBind={addKeyBind}
        removeKeyBind={removeKeyBind}
        activateKeyBind={activateKeyBind}
      />
    );
  };
};

export default withKeyBinds;
