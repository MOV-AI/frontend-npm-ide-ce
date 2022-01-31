import React, { useCallback } from "react";
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
    <IconButton
      onClick={handleOnClick}
      aria-label={bookmark.title}
      className={classes.bookmark}
      size="small"
    >
      <p className={active !== bookmark.name ? classes.unselectedBookmark : ""}>
        {bookmark.icon}
      </p>
    </IconButton>
  );
};

export default BookmarkTab;
