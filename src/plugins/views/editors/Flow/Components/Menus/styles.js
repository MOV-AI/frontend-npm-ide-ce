const styles = theme => ({
  root: {
    width: "100%"
  },
  itemValue: {
    padding: "15px 15px 15px 25px",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    fontSize: "14px"
  },
  disabled: {
    color: "gray"
  },
  link: {
    fontSize: "1rem"
  },
  parametersContainer: {
    overflowY: "auto",
    overflowX: "hidden",
    padding: "0px 6px 0px 6px",
    flexGrow: 1,
    minHeight: 0
  },
  groupRow: {
    display: "flex",
    flexDirection: "row"
  },
  groupItem: {
    flexGrow: 1,
    padding: "10px 25px"
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
  },
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
  }
});

export default styles;
