import { makeStyles } from "@material-ui/core/styles";

export const explorerStyles = makeStyles(_theme => ({
  flowExplorerHolder: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  typography: {
    overflow: "hidden",
    justifyContent: "center",
    width: "100%",
    flex: "1 1 auto"
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
