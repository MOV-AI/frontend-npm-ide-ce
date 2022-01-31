import React, { useCallback } from "react";
import { TOPICS } from "../utils/Constants";
import { usePluginMethods } from "../engine/ReactPlugin/ViewReactPlugin";
import BookmarkTab from "./Components/BookmarkTab";

import { bookmarkStyles } from "./styles";

const withBookmarks = Component => {
  return (props, ref) => {
    const { anchor, emit } = props;
    // React state hooks
    const [bookmarks, setBookmarks] = React.useState({});
    const [active, setActive] = React.useState();
    const [renderedView, setRenderedView] = React.useState(<></>);
    // Refs
    const drawerRef = React.useRef();
    const oppositeSide = anchor === "left" ? "right" : "left";
    // Style hooks
    const classes = bookmarkStyles(anchor, oppositeSide)();

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
          emit && emit(TOPICS.RIGHT_DRAWER.CHANGE_BOOKMARK, { name });
        }
      },
      [active, emit]
    );

    /**
     * Add bookmark to drawer
     * @param data : {
     *    icon {Element}  : Bookmark icon
     *    name {String}   : Title
     *    view {Element}  : Element to be rendered in menu container
     *  }
     *  @param isDefault {Boolean} : Set bookmark as active if true
     *  @param {string} activeBookmark : bookmark to make active
     */
    const addBookmark = React.useCallback(
      (data, isDefault = false, activeBookmark) => {
        const name = data.name;
        let newActive = isDefault && name;
        setBookmarks(prevState => {
          const newBookmarks = { ...prevState, [name]: data };
          newActive = newBookmarks[activeBookmark] && activeBookmark;

          return { ...prevState, [name]: data };
        });

        if (newActive) setActive(newActive);
      },
      []
    );

    /**
     * Remove bookmark by name
     * @param {string} name : bookmark name
     * @param {string} activeBookmark : bookmark to make active
     */
    const removeBookmark = React.useCallback((name, activeBookmark) => {
      setBookmarks(prevState => {
        const { [name]: _, ...otherBookmarks } = prevState;
        // Reset active bookmark
        setActive(prevActiveState => {
          if (prevActiveState === name)
            return otherBookmarks[activeBookmark]
              ? activeBookmark
              : Object.keys(otherBookmarks)[0];
          else return prevActiveState;
        });
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
     * @param {*} newBookmarks
     * @param {String} activeBookmark bookmark to make active
     */
    const setBookmark = React.useCallback((bookmarks = {}, activeBookmark) => {
      setBookmarks(bookmarks);
      const bookmarkToActivate =
        bookmarks[activeBookmark] || Object.values(bookmarks)[0];
      if (bookmarkToActivate) {
        setActive(bookmarkToActivate.name);
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
    }, [active, bookmarks]);

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
    const renderBookmarks = useCallback(
      side => {
        return (
          side === anchor && (
            <div className={classes.panel}>
              {Object.values(bookmarks).map((bookmark, index) => (
                <BookmarkTab
                  key={index}
                  classes={classes}
                  bookmark={bookmark}
                  active={active}
                  selectBookmark={selectBookmark}
                />
              ))}
            </div>
          )
        );
      },
      [active, anchor, bookmarks, classes, selectBookmark]
    );

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
