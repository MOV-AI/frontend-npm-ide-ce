import { makeStyles } from "@material-ui/core/styles";

export const explorerStyles = makeStyles(theme => ({
  typography: {
    overflowY: "auto",
    overflowX: "hidden",
    justifyContent: "center",
    width: "100%"
  },
  header: {
    marginBottom: "6px",
    "& img": {
      maxWidth: "60%",
      marginRight: "10px"
    }
  }
}));
