import React from "react";
import hotkeys from "hotkeys-js";

hotkeys("ctrl+s", event => {
  event.preventDefault();
});

const withKeyBinds = Component => {
  return (props, ref) => {
    // Props
    const { name } = props;
    // Refs
    const scopeRef = React.useRef();

    /**
     *
     */
    const activateKeyBind = () => {
      hotkeys.setScope(scopeRef.current);
    };

    /**
     *
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
     *
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
