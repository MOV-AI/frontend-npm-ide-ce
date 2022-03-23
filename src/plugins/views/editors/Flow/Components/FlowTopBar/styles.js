import { makeStyles } from "@material-ui/core/styles";

export const buttonStyles = makeStyles(theme => ({
  buttonPill: {
    borderRadius: "99px"
  }
}));

export const flowTopBarStyles = makeStyles(theme => ({
  flowLink: {
    textDecoration: "underline",
    cursor: "pointer"
  },
  defaultRobot: {
    fontWeight: "bold"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 170,
    maxWidth: 350,
    "& i": {
      marginRight: 15
    }
  },
  whichFlowText: {
    marginLeft: theme.spacing(5),
    fontSize: "15px",
    flexGrow: 1
  },
  visualizationToggle: {
    marginRight: "10px"
  },
  grow: {
    flexGrow: 1
  }
}));
