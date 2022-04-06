import { makeStyles } from "@material-ui/core/styles";

export const explorerStyles = makeStyles(_ => ({
  typography: {
    overflowY: "auto",
    overflowX: "hidden",
    justifyContent: "center",
    width: "100%"
  },
  header: {
    marginBottom: "6px"
  }
}));

export const previewStyles = makeStyles(theme => ({
  previewHolder: {
    padding: "20px",
    height: "60px",
    borderBottom: `1px dashed ${theme.icon.color}`
  }
}));
