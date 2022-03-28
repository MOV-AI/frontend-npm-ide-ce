import { makeStyles } from "@material-ui/core/styles";

const common = {
  itemValue: {
    padding: "15px 15px 15px 25px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    fontSize: "14px"
  },
  disabled: {
    color: "gray"
  }
};

const groupItem = {
  ...common,
  groupRow: {
    display: "flex",
    flexDirection: "row"
  },
  groupItem: {
    flexGrow: 1,
    padding: "10px 25px"
  }
};

const parameters = {
  parametersContainer: {
    overflowY: "auto",
    overflowX: "hidden",
    padding: "0px 6px 0px 6px",
    flexGrow: 1,
    minHeight: 0
  }
};

const menuStyles = makeStyles(theme => ({
  ...common,
  ...parameters,
  description: {
    whiteSpace: "normal !important",
    textAlign: "justify"
  },
  link: {
    fontSize: "1rem"
  }
}));

export const groupItemStyles = makeStyles(theme => groupItem);
export const nodeGroupStyles = makeStyles(theme => ({
  ...groupItem,
  ...parameters
}));

export const propertiesStyles = makeStyles(theme => ({
  gridAlign: {
    textAlign: "left"
  }
}));

export const menuDetailsStyles = makeStyles(theme => ({
  header: {
    textAlign: "center"
  }
}));

export const nodeMenuStyles = makeStyles(theme => ({
  root: {
    width: "100%"
  },
  gridContainer: {
    padding: "10px 20px 20px"
  }
}));

export const linkMenuStyles = makeStyles(theme => ({
  dependencyContainer: {
    padding: "5px 25px"
  },
  directionContainer: {
    padding: "0 10px"
  }
}));

export const portStyles = makeStyles(theme => ({
  ...common,
  portIcon: {
    paddingLeft: "30px"
  },
  portRow: {
    display: "flex",
    flexDirection: "column",
    padding: "0 16px"
  },
  portName: {
    textAlign: "end",
    fontSize: "0.875rem",
    marginTop: "6px",
    paddingRight: "6px"
  },
  portCallbackLink: {
    textAlign: "end",
    fontSize: "0.875rem",
    padding: "6px"
  },
  detailsSection: {
    paddingLeft: "20px",
    fontSize: "1rem",
    paddingTop: "15px"
  },
  detailsContent: {
    display: "flex",
    flexDirection: "column",
    marginTop: "10px",
    overflowY: "auto",
    overflowX: "hidden",
    "& .content": { fontSize: "0.95rem", paddingLeft: "8px" }
  },
  detailRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  }
}));

export const keyValueSectionStyles = makeStyles(theme => ({
  ...common,
  ...parameters
}));

export const tableKeyValueStyles = makeStyles(theme => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  searchHolder: {
    padding: "5px 10px 15px"
  }
}));

export const rowKeyValueStyles = makeStyles(theme => ({
  rowContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  keyContainer: {
    flexGrow: 1,
    paddingLeft: "8px",
    fontSize: "0.875rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    maxWidth: "60%"
  },
  valueContainer: {
    textAlign: "center",
    flexGrow: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    padding: "0px 12px 0px 12px",
    maxWidth: "40%",
    width: "40%"
  },
  valueDefault: {
    color: "grey",
    padding: "0 5px"
  },
  valueNone: {
    color: "grey",
    textDecoration: "line-through"
  }
}));

export default menuStyles;
