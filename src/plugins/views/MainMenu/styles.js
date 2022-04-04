import { makeStyles } from "@material-ui/core/styles";

export const mainMenuStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.primary.main,
    cursor: "pointer",
    "& svg": {
      color: theme.palette.primary.main
    }
  },
  movaiIcon: {
    padding: "10px",
    width: "25px",
    height: "25px"
  }
}));
