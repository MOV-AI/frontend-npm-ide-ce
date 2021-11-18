import React from "react";

/**
 * Handle actions to update right menu of each editor
 * @param {*} Component : Editor React Component
 * @returns {ReactComponent} React component that receives props to handle menu actions
 */
const withMenuHandler = Component => {
  return (props, ref) => {
    const children = props.children;

    /**
     * Reset right menu : clear menu and close right drawer
     */
    const resetRightMenu = React.useCallback(() => {
      props.call("rightDrawer", "resetBookmarks");
    }, [props]);

    /**
     * Render components menu if any and bind events of active tab to trigger the component's renderRightMenu method
     * @returns
     */
    const initRightMenu = () => {
      // render component menus (if any)
      const childrenRef = children?.ref?.current;
      if (!childrenRef) return;
      const updateRightMenu = childrenRef.renderRightMenu
        ? childrenRef.renderRightMenu
        : resetRightMenu;
      // Render (or close) right menu details
      updateRightMenu();
      if (childrenRef.renderRightMenu) props.call("rightDrawer", "open");
      props.on("tabs", `${props.id}-active`, updateRightMenu);
    };

    return <Component {...props} ref={ref} initRightMenu={initRightMenu} />;
  };
};

export default withMenuHandler;
