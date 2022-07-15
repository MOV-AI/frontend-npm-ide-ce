import { makeStyles } from "@material-ui/core/styles";

const container = {
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  height: "100%"
};

export const configurationStyles = makeStyles(theme => ({
  container: {
    ...container
  },
  codeContainer: {
    ...container,
    maxHeight: "calc(100% - 48px)"
  },
  appBar: {
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    "& button span": {
      color: theme.palette.text.primary
    }
  }
}));
