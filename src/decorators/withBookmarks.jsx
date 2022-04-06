import React, { useCallback, useState, useEffect, useRef } from "react";
import { PLUGINS } from "../utils/Constants";
import { usePluginMethods } from "../engine/ReactPlugin/ViewReactPlugin";
import BookmarkTab from "./Components/BookmarkTab";

import { bookmarkStyles } from "./styles";

const withBookmarks = Component => {
  /**
   * Small extract method to return the oposite side of the anchor
   * @param {string} anchor : side
   * @returns oposite side of anchor
   */
  function getOpositeSide(anchor) {
    if (anchor === "left") return "right";

    return "left";
  }

  /**
   * Small extract method to return a valid bookmark from the bookmarks list
   * @param {Array} bookmarks : the bookmarks list
   * @param {String} name : name to search
   * @returns a valid bookmark
   */
  function getValidBookmark(bookmarks, name) {
    if (bookmarks[name]) return name;

    return Object.keys(bookmarks)[0];
  }

  return (props, ref) => {
    const { anchor, emit } = props;
    // React state hooks
    const [bookmarks, setBookmarks] = useState({});
    const [active, setActive] = useState();
    const [renderedView, setRenderedView] = useState(<></>);
    // Refs
    const drawerRef = useRef();
    const oppositeSide = getOpositeSide(anchor);
    // Style hooks
    const classes = bookmarkStyles(anchor, oppositeSide)();

    //========================================================================================
    /*                                                                                      *
     *                                   Component's methods                                *
     *                                                                                      */
    //========================================================================================

    /**
     * Select bookmark
     * @param {String} name : Bookmark name
     */
    const selectBookmark = useCallback(
      name => {
        if (active === name) {
          drawerRef.current.toggleDrawer();
          return;
        }

        drawerRef.current.openDrawer();
        setActive(name);
        emit(PLUGINS.RIGHT_DRAWER.ON.CHANGE_BOOKMARK, { name });
      },
      [active, emit]
    );

    /**
     * Add bookmark to drawer
     * @param data : {
     *    {Element} icon : Bookmark icon
     *    {String} name : Title
     *    {Element} view : Element to be rendered in menu container
     *  }
     *  @param {Boolean} isDefault : Set bookmark as active if true
     *  @param {string} activeBookmark : bookmark to make active
     */
    const addBookmark = useCallback(
      (data, activeBookmark, isDefault = false, shouldOpen = false) => {
        const name = data.name;
        let newActive = isDefault && name;
        setBookmarks(prevState => {
          const newBookmarks = { ...prevState, [name]: data };
          newActive = getValidBookmark(newBookmarks, activeBookmark);

          return { ...prevState, [name]: data };
        });

        setActive(newActive);
        if (shouldOpen) drawerRef.current.openDrawer();
      },
      []
    );

    /**
     * Remove bookmark by name
     * @param {string} name : bookmark name
     * @param {string} activeBookmark : bookmark to make active
     */
    const removeBookmark = useCallback(
      (name, activeBookmark) => {
        setBookmarks(prevState => {
          // *BEWARE* This is making just a shallow clone, so deep properties are still mutable
          const otherBookmarks = { ...prevState };
          delete otherBookmarks[name];

          return otherBookmarks;
        });

        // Reset active bookmark
        setActive(prevActiveState => {
          if (prevActiveState !== name) return prevActiveState;

          return getValidBookmark(bookmarks, activeBookmark);
        });
      },
      [bookmarks]
    );

    /**
     * Reset bookmarks (remove all)
     */
    const resetBookmarks = useCallback(() => {
      setBookmarks({});
      setRenderedView([]);
      drawerRef.current.closeDrawer();
    }, []);

    /**
     * Set bookmarks
     * @param {*} newBookmarks
     * @param {String} activeBookmark bookmark to make active
     */
    const setBookmark = useCallback((newBookmarks, activeBookmark) => {
      if (!newBookmarks) return;
      setBookmarks(newBookmarks);

      setActive(getValidBookmark(newBookmarks, activeBookmark));
    }, []);

    //========================================================================================
    /*                                                                                      *
     *                                   React lifecycles                                   *
     *                                                                                      */
    //========================================================================================

    /**
     * On change of active bookmark
     */
    useEffect(() => {
      if (bookmarks[active]) {
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
      <div className={classes.bookmarksContainer}>
        {renderBookmarks("left")}
        <Component {...props} ref={drawerRef}>
          <div id="custom-drawer-view">{renderedView}</div>
        </Component>
        {renderBookmarks("right")}
      </div>
    );
  };
};

export const exposedMethods = Object.values(PLUGINS.RIGHT_DRAWER.CALL);

export default withBookmarks;
