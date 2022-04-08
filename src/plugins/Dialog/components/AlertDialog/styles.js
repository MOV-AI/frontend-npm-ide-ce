import { makeStyles } from "@material-ui/core/styles";

export const alertBeforeActionStyles = makeStyles(_theme => ({
  icon: {
    float: "left",
    marginRight: 20
  },
  message: {
    whiteSpace: "pre-wrap"
  }
}));

export const alertDialogStyles = makeStyles(_theme => ({
  container: {
    whiteSpace: "pre-wrap"
  }
}));
