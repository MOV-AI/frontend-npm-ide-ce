import { makeStyles } from "@material-ui/styles";

export const dependencyInfoStyles = makeStyles(_theme => ({
  root: {
    position: "absolute",
    bottom: "15px",
    right: "15px",
    "& h3": {
      fontSize: "24px"
    }
  },
  infoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    "& > p": {
      margin: "0"
    }
  },
  colorChip: {
    width: "40px",
    height: "4px"
  }
}));
