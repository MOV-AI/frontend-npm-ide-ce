import { makeStyles } from "@material-ui/core/styles";

export const descriptionStyles = makeStyles(theme => ({
  root: {
    padding: "5px 0px 5px 0px",
    width: "100%"
  },
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
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
  center: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap"
  },
  nodeTypeMini: {
    width: "12px",
    height: "12px",
    marginRight: "6px",
    borderRadius: "3px"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  typeContainer: {
    display: "flex",
    alignItems: "center",
    position: "absolute",
    right: "100px",
    top: "20px"
  },
  details: { display: "flex", flexDirection: "column" },
  row: { display: "flex", flexDirection: "row" },
  heading: { fontSize: "1.5rem" },
  column: { flexBasis: "90%" }
}));
