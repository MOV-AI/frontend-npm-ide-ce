import { makeStyles } from "@material-ui/core/styles";

export const keyValueEditorDialogStyles = makeStyles(_ => ({
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

export const keyValueHookStyles = makeStyles(_ => ({
  logo: {
    margin: "2px",
    padding: "0px"
  },
  codeContainer: {
    height: "100px",
    width: "100%"
  }
}));
