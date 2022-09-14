import { makeStyles } from "@material-ui/core/styles";
import { DEFAULT_EXPLORER_ROW_HEIGHT } from "../../../../../utils/Constants";

export const listItemsTreeWithSearchStyles = makeStyles(_theme => ({
  list: {
    paddingLeft: "0px",
    paddingRight: "0px",
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  listHolder: {
    height: "100%",
    paddingBottom: "10px"
  }
}));

export const itemRowStyles = makeStyles(theme => ({
  listItem: {
    height: DEFAULT_EXPLORER_ROW_HEIGHT,
    cursor: "pointer"
  },
  spaceBetween: {
    display: "flex",
    width: "100%",
    justifyContent: "space-between"
  },
  preContainer: {
    paddingLeft: "20px",
    boxSizing: "border-box",
    justifyContent: "space-between",
    "& button": {
      display: "none"
    },
    "&:hover": {
      backgroundColor: `${theme.palette.primary.main}26`,
      "& button": {
        display: "inline-flex"
      }
    }
  },
  ellipsis: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 2
  },
  displayContents: {
    display: "contents"
  },
  iconSpace: {
    flex: 1,
    textAlign: "right",
    maxWidth: 38,
    "& button": {
      position: "relative",
      bottom: 7,
      padding: 7
    }
  },
  contextMenuIcon: {
    color: "white",
    fontSize: 18
  }
}));
