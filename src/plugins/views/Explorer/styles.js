import { makeStyles } from "@material-ui/core/styles";

export const explorerStyles = makeStyles(_ => ({
  typography: {
    overflowY: "auto",
    overflowX: "hidden",
    justifyContent: "center",
    width: "100%"
  },
  header: {
    marginBottom: "6px",
    "& img": {
      maxWidth: "65%",
      marginRight: "10px"
    }
  }
}));
