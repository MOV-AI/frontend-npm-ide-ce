import { makeStyles } from "@material-ui/styles";

export const dependencyInfoStyles = makeStyles(theme => ({
  root: {
    position: "absolute",
    bottom: "15px",
    right: "15px",
    cursor: "pointer",
    border: "2px solid transparent",
    transition: "border-color .5s",
    "&:hover": {
      borderColor: theme.palette.grey[500]
    },
    "& h3": {
      marginTop: "0",
      fontSize: "24px",
      display: "flex",
      alignItems: "center",
      transition: "font-size .5s"
    },
    "& h3 > svg": {
      transition: "transform .5s"
    },
    "&.minified": {
      maxHeight: "35px",
      maxWidth: "70px",
      borderColor: theme.palette.grey[50],
      "&:hover": {
        borderColor: "transparent"
      },
      "& > div": {
        padding: "5px 10px"
      },
      "& h3": {
        fontSize: "18px"
      },
      "& h3 > svg": {
        transform: "rotate(180deg)"
      }
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
