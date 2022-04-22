import { amber, green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/styles";

const commonStyles = {
  display: "flex",
  justifyContent: "space-between"
};

export const warningsStyles = makeStyles(theme => ({
  root: {
    position: "absolute",
    top: "20px",
    right: "50px"
  },
  snackbar: {
    margin: "5px",
    minWidth: "200px"
  },
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  info: {
    backgroundColor: theme.palette.primary.main
  },
  warning: {
    backgroundColor: amber[700]
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: 10
  },
  message: {
    display: "flex",
    whiteSpace: "pre",
    alignItems: "center"
  }
}));

export const invalidLinksWarningStyles = makeStyles(_theme => ({
  invalidLinksHeader: {
    ...commonStyles,
    marginBottom: "20px"
  },
  invalidLinkHolder: {
    ...commonStyles,
    paddingBottom: "10px",
    borderBottom: "1px dashed #ccc",
    marginBottom: "10px",
    "& > div": {
      overflow: "hidden",
      maxWidth: "230px",
      textOverflow: "ellipsis",
      "& > p": {
        margin: "0px"
      }
    },
    "& > div:last-of-type": {
      textAlign: "right"
    }
  },
  fixMessage: {
    marginTop: "40px"
  }
}));
