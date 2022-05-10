import { makeStyles } from "@material-ui/core/styles";

export const explorerStyles = makeStyles(_theme => ({
  typography: {
    overflow: "hidden",
    justifyContent: "center",
    width: "100%",
    flex: "1 1 auto",
    "& + div": {
      height: "0px"
    }
  },
  header: {
    marginBottom: "6px",
    "& img": {
      maxWidth: "65%",
      marginRight: "10px"
    }
  }
}));
