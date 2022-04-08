import { makeStyles } from "@material-ui/core/styles";

export const configColumnsStyles = makeStyles(theme => ({
  formHolder: {
    width: "100%"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: "120px"
  },
  control: {
    fontSize: "0.875rem"
  }
}));
