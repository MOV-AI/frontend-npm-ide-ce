import React from "react";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import { usePluginMethods } from "../engine/ReactPlugin/ViewReactPlugin";

const useStyles = (side, oppositeSide) =>
  makeStyles(theme => ({
    panel: {
      position: "absolute",
      [oppositeSide]: -40,
      background: "#fff0",
      top: 40,
      width: 40,
      zIndex: 999
    },
    bookmark: {
      width: 40,
      height: 40,
      margin: "10px 0 !important",
      border: `solid 1px ${theme.palette.background.primary} !important`,
      [`border-${side}`]: "none !important",
      borderRadius: "0px !important",
      color: theme.palette.primary.main,
      background: `${theme.palette.background.secondary} !important`
    }
  }));

const withBookmarks = Component => {
  return (props, ref) => {
    // React state hooks
    const [bookmarks, setBookmarks] = React.useState({});
    const [active, setActive] = React.useState();
    const [renderedView, setRenderedView] = React.useState(<></>);
    // Refs
    const drawerRef = React.useRef();
    const oppositeSide = props.anchor === "left" ? "right" : "left";
    // Style hooks
    const classes = useStyles(props.anchor, oppositeSide)();

    //========================================================================================
    /*                                                                                      *
     *                                   Component's methods                                *
     *                                                                                      */
    //========================================================================================

    /**
     * Select bookmark
     *  name {String} : Bookmark name
     */
    const selectBookmark = React.useCallback(
      name => {
        if (active === name) {
          drawerRef.current.toggleDrawer();
        } else {
          drawerRef.current.openDrawer();
          setActive(name);
        }
      },
      [active]
    );

    /**
     * Add bookmark to drawer
     *  data: {
     *    icon {Element}  : Bookmark icon
     *    name {String}   : Title
     *    view {Element}  : Element to be rendered in menu container
     *  }
     *  isDefault {Boolean} : Set bookmark as active if true
     */
    const addBookmark = React.useCallback((data, isDefault = false) => {
      const name = data.name;
      setBookmarks(prevState => {
        return { ...prevState, [name]: data };
      });
      if (isDefault) setActive(name);
    }, []);

    /**
     * Remove bookmark by name
     *  name {String} : bookmark name
     */
    const removeBookmark = React.useCallback(name => {
      setBookmarks(prevState => {
        const { [name]: _, ...otherBookmarks } = prevState;
        return otherBookmarks;
      });
    }, []);

    /**
     * Reset bookmarks (remove all)
     */
    const resetBookmarks = React.useCallback(() => {
      setBookmarks({});
      setRenderedView([]);
      drawerRef.current.closeDrawer();
    }, []);

    /**
     * Set bookmarks
     */
    const setBookmark = React.useCallback((bookmarks = {}) => {
      setBookmarks(bookmarks);
      const firstBookmark = Object.values(bookmarks)[0];
      if (firstBookmark) {
        setActive(firstBookmark.name);
      }
    }, []);

    //========================================================================================
    /*                                                                                      *
     *                                   React lifecycles                                   *
     *                                                                                      */
    //========================================================================================

    /**
     * On change of active bookmark
     */
    React.useEffect(() => {
      if (active && bookmarks[active]) {
        const view = bookmarks[active].view;
        setRenderedView(view);
      }
    }, [active, bookmarks, props]);

    /**
     * Methods exposed
     */
    usePluginMethods(ref, {
      setBookmark,
      addBookmark,
      resetBookmarks,
      removeBookmark,
      open: () => drawerRef.current.openDrawer(),
      close: () => drawerRef.current.closeDrawer(),
      toggle: () => drawerRef.current.toggleDrawer()
    });

    //========================================================================================
    /*                                                                                      *
     *                                         Render                                       *
     *                                                                                      */
    //========================================================================================

    /**
     * Render Bookmarks
     * @param {String} side : "left" or "right"
     * @returns {Element} : Bookmark panel
     */
    const renderBookmarks = side => {
      return (
        side === props.anchor && (
          <div className={classes.panel}>
            {Object.values(bookmarks).map((bookmark, index) => {
              return (
                <IconButton
                  key={index}
                  onClick={() => selectBookmark(bookmark.name)}
                  color={active === bookmark.name ? "primary" : "default"}
                  aria-label={bookmark.title}
                  className={classes.bookmark}
                  size="small"
                >
                  {bookmark.icon}
                </IconButton>
              );
            })}
          </div>
        )
      );
    };

    return (
      <div style={{ position: "relative" }}>
        {renderBookmarks("left")}
        <Component {...props} ref={drawerRef}>
          <div id="custom-drawer-view">{renderedView}</div>
        </Component>
        {renderBookmarks("right")}
      </div>
    );
  };
};

export const exposedMethods = [
  "addBookmark",
  "resetBookmarks",
  "removeBookmark",
  "setBookmark"
];

export default withBookmarks;