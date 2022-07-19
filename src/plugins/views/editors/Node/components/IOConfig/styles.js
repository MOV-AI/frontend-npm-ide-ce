import { makeStyles } from "@material-ui/core/styles";

export const ioConfigStyles = makeStyles(theme => ({
  details: {
    padding: "8px 24px 24px",
    "&.editing div[class^='MTableToolbar-actions'] .MuiIconButton-root, &.editing .Mui-selected, &.editing .child-row":
      {
        opacity: "0.2",
        transition: "all 300ms ease 0s",
        cursor: "default",
        pointerEvents: "none"
      }
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  control: {
    fontSize: "0.875rem"
  },
  toolbar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  toolbarComponents: {
    width: "100%"
  }
}));

export const IOPortStyles = makeStyles(_theme => ({
  root: {
    padding: "0 12px",
    width: "calc(100% - 24px)"
  },
  heading: {
    fontSize: "0.875rem"
  },
  ioPortTitle: {
    boxShadow: "none",
    padding: "0px 50px 0px 50px"
  },
  portBase: { fontSize: "1.5rem" },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  paddingLR: {
    padding: "0px 12px",
    lineHeight: "100%"
  },
  details: {
    display: "flex",
    flexDirection: "column",
    padding: "0px 100px 0px 100px"
  }
}));
