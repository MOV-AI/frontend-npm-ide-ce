import { makeStyles } from "@material-ui/core/styles";

export const alertBeforeActionStyles = makeStyles(_ => ({
  icon: {
    float: "left",
    marginRight: 20
  },
  message: {
    whiteSpace: "pre-wrap"
  }
}));

export const alertDialogStyles = makeStyles(_ => ({
  container: {
    whiteSpace: "pre-wrap"
  }
}));
