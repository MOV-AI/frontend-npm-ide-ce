import { makeStyles } from "@material-ui/core/styles";

const sharedStyles = {
  paper: {
    margin: "10px",
    flex: 1,
    borderRadius: "5px"
  },
  columnTitle: {
    padding: "14px",
    fontSize: "24px"
  },
  columnBody: {
    margin: "7px",
    display: "flex",
    flexFlow: "column"
  }
};

export const shortcutsStyles = makeStyles(theme => ({
  root: {
    height: "100%",
    width: "100%",
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    backgroundColor: theme.robotDetails.backgroundColor
  },
  body: {
    flex: "1 1 auto",
    display: "flex",
    padding: "0 5px",
    marginTop: "15px"
  },
  smallColumn: {
    flex: "0 0 30%",
    display: "flex",
    flexDirection: "column"
  },
  bigColumn: {
    flex: "0 0 70%",
    display: "flex",
    flexDirection: "column"
  }
}));

export const shortcutsListStyles = makeStyles(_theme => ({
  ...sharedStyles,
  listItem: {
    padding: "20px 10px",
    borderBottom: "1px solid #666",
    borderRadius: "3px"
  },
  listContent: {
    display: "inline-flex",
    width: "100%",
    justifyContent: "space-between"
  }
}));

export const shortcutsTableStyles = makeStyles(_theme => ({
  ...sharedStyles,
  columnBody: {
    ...sharedStyles.columnBody,
    "& .MuiToolbar-root": {
      paddingLeft: "0px"
    }
  }
}));
