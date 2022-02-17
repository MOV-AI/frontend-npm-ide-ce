import React, { useCallback } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";

const BookmarkTab = props => {
  const { active, bookmark, classes, selectBookmark } = props;

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  const handleOnClick = useCallback(() => {
    selectBookmark(bookmark.name);
  }, [bookmark.name, selectBookmark]);

  return (
    <Tooltip title={bookmark.title || bookmark.name} placement="left">
      <IconButton
        onClick={handleOnClick}
        aria-label={bookmark.title}
        className={classes.bookmark}
        size="small"
      >
        <p
          className={active !== bookmark.name ? classes.unselectedBookmark : ""}
        >
          {bookmark.icon}
        </p>
      </IconButton>
    </Tooltip>
  );
};

export default BookmarkTab;
