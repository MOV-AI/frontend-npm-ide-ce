import { makeStyles } from "@material-ui/core/styles";

export const IOPortStyles = makeStyles(theme => ({
  root: {
    padding: "0 12px",
    width: "calc(100% - 24px)"
  },
  heading: {
    fontSize: "0.875rem"
  },
  ioPortTitle: {
    boxShadow: "none",
    padding: "0px 50px 0px 50px"
  },
  portBase: { fontSize: "1.5rem" },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  paddingLR: {
    padding: "0px 12px",
    lineHeight: "100%"
  },
  details: {
    display: "flex",
    flexDirection: "column",
    padding: "0px 100px 0px 100px"
  }
}));
