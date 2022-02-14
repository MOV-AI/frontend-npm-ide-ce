const styles = theme => ({
  bar: {
    height: "25px",
    width: "100%"
  },
  grow: {
    flexGrow: 1
  },
  active: {
    background: theme.palette.primary.light,
    color: "black"
  },
  default: {
    color: "white",
    background: theme.palette.background.primary,
    borderTop: "solid 1px black"
  },
  tooltip: {
    fontSize: "1em"
  },
  action: {
    cursor: "pointer",
    width: "fit-content",
    display: "inline-block",
    padding: "0 15px",
    borderRight: `solid 1px ${theme.palette.background.secondary}`,
    "& i": { marginRight: 10, fontSize: "14px" },
    "&:hover": {
      filter: `drop-shadow(2px 4px 6px white)`
    }
  },
  actionActive: {
    filter: `drop-shadow(2px 4px 6px gray)`
  },
  alignRight: {
    float: "right",
    borderLeft: `solid 1px ${theme.palette.background.secondary}`
  }
});

export default styles;
