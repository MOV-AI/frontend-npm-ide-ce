import { makeStyles } from "@material-ui/core/styles";

export const searchStyles = makeStyles(theme => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "100%"
  },
  input: {
    marginLeft: 10,
    flex: 1,
    "& input::placeholder": {
      color: theme.backdrop.color
    }
  },
  iconButton: { padding: 10 },
  icon: {
    color: theme.palette.primary.main
  }
}));
