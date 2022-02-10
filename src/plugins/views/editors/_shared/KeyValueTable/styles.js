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
