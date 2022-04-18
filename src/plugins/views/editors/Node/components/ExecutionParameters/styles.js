import { makeStyles } from "@material-ui/core/styles";

export const executionParamStyles = makeStyles(theme => ({
  root: {
    padding: "5px 0px 5px 0px",
    width: "100%"
  },
  heading: {
    fontSize: "1.5rem"
  },
  details: {
    display: "flex",
    flexDirection: "column"
  },
  column: {
    flexBasis: "90%"
  },
  input: {
    margin: theme.spacing(1),
    fontFamily: "inherit",
    width: "80%",
    fontWeight: "bold"
  },
  text: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  row: {
    display: "flex",
    flexDirection: "row"
  },
  center: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap"
  },
  centerCheckboxTooltip: {
    justifyContent: "center",
    display: "flex",
    flexDirection: "row",
    flexGrow: 1
  },
  logo: {
    margin: "12px 12px 12px 12px",
    padding: "0px"
  },
  formControlLabel: {
    margin: "0%"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  noMargin: {
    margin: 0
  }
}));
