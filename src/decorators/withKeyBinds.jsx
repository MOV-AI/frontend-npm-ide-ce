import React, { useEffect, useRef } from "react";
import hotkeys from "hotkeys-js";
import { getRefComponent, parseKeybinds } from "../utils/Utils";
import { KEYBINDINGS } from "../plugins/views/Keybinding/shortcuts";

/**
 * By default hotkeys are not enabled for INPUT SELECT TEXTAREA elements.
 * Hotkeys.filter to return to the true shortcut keys set to play a role, false shortcut keys set up failure.
 */
hotkeys.filter = function () {
  return true;
};

hotkeys(KEYBINDINGS.EDITOR_GENERAL.KEYBINDS.SAVE.SHORTCUTS, event => {
  event.preventDefault();
});

/**
 * Manage Key binds
 * @param {*} Component
 * @returns
 */
const withKeyBinds = Component => {
  const RefComponent = getRefComponent(Component);

  return (props, ref) => {
    // Props
    const { name } = props;
    // Refs
    const scopeRef = useRef();

    /**
     * Activate scope shortcuts.
     * This will automatically deactivate all other scopes
     */
    const activateKeyBind = (scope = scopeRef.current) => {
      console.log("activateKeyBind scope", scope);
      hotkeys.setScope(scope);
    };

    /**
     * Set scope to global
     *  This will deactivate the current scope
     */
    const deactivateKeyBind = () => {
      hotkeys.setScope("all");
    };

    /**
     * Add Key bind to its scope
     * @param {*} keys
     * @param {*} callback
     */
    const addKeyBind = (keys, callback, scope = scopeRef.current) => {
      console.log("addKeyBind keys", keys);
      console.log("addKeyBind scope", scope);
      if (!scope) return;
      const keysToBind = parseKeybinds(keys);
      activateKeyBind(scope);
      hotkeys(keysToBind, scope, callback);
    };

    /**
     * Remove key bind from scope
     * @param {*} key
     */
    const removeKeyBind = (keys, scope = scopeRef.current) => {
      const keysToUnbind = parseKeybinds(keys);
      hotkeys.unbind(keysToUnbind, scope);
    };

    /**
     * Component initialization : set scope id
     */
    useEffect(() => {
      scopeRef.current = `${name}-${Math.random()}`;
      // Delete scope to unbind keys when component is unmounted
      return () => {
        hotkeys.deleteScope(scopeRef.current);
      };
    }, [name]);

    return (
      <RefComponent
        {...props}
        ref={ref}
        addKeyBind={addKeyBind}
        removeKeyBind={removeKeyBind}
        activateKeyBind={activateKeyBind}
        deactivateKeyBind={deactivateKeyBind}
      />
    );
  };
};

export default withKeyBinds;
