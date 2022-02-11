import { makeStyles } from "@material-ui/core/styles";

export const keyValueEditorDialogStyles = makeStyles(theme => ({
  input: { fontSize: "13px" },
  marginTop: { marginTop: "10px" },
  paper: { minWidth: "50%" },
  container: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  codeContainer: {
    height: "100px",
    width: "100%"
  }
}));
