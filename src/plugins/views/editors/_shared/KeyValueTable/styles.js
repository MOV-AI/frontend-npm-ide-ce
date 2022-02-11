import { makeStyles } from "@material-ui/core/styles";

export const parametersDialogStyles = makeStyles(theme => ({
  valueOptions: {
    flexDirection: "row"
  },
  disabledValue: {
    color: "grey",
    fontStyle: "italic"
  }
}));

export const keyValueEditorDialogStyles = makeStyles(theme => ({
  input: { fontSize: "13px" },
  label: {
    marginTop: "20px",
    fontSize: "16px",
    transform: "translate(0, 1.5px) scale(0.75)",
    transformOrigin: "top left",
    color: "rgba(255, 255, 255, .7)"
  },
  marginTop: { marginTop: "10px" },
  paper: { minWidth: "50%" },
  container: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  codeContainer: {
    height: "200px",
    width: "100%"
  },
  accordion: {
    margin: "0px !important"
  },
  accordionSummary: {
    paddingLeft: "0px",
    paddingRight: "0px",
    minHeight: "auto !important",
    alignItems: "flex-end",

    "& > div": {
      margin: "0px !important",
      padding: "0px"
    }
  },
  noHorizontalPadding: {
    paddingLeft: 0,
    paddingRight: 0
  }
}));
