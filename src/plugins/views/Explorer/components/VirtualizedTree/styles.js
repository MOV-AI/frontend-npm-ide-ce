export const virtualizedTreeStyles = theme => ({
  horizFlex: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  spaceBetween: {
    display: "flex",
    width: "100%",
    justifyContent: "space-between"
  },
  preContainer: {
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
});
