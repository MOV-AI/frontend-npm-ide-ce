import { makeStyles } from "@material-ui/core/styles";

export const bookmarkStyles = (side, oppositeSide) =>
  makeStyles(theme => ({
    bookmarksContainer: { position: "relative" },
    panel: {
      position: "absolute",
      [oppositeSide]: -40,
      background: "#fff0",
      top: "60px",
      width: "40px",
      zIndex: 999
    },
    bookmark: {
      width: "40px",
      height: "40px",
      margin: "3px 0 !important",
      border: `solid 1px ${theme.palette.background.primary} !important`,
      [`border-${side}`]: "none !important",
      borderRadius: "0px !important",
      background: `${theme.palette.background.secondary} !important`
    },
    unselectedBookmark: {
      color: "white"
    }
  }));
