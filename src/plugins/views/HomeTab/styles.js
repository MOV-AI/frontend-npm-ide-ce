import { makeStyles } from "@material-ui/core/styles";

const sharedStyles = {
  paper: {
    margin: 10,
    flex: 1,
    borderRadius: 5
  },
  columnTitle: {
    padding: 14,
    fontSize: 24
  },
  columnBody: {
    margin: 7,
    display: "flex",
    flexFlow: "column"
  },
}

export const homeTabStyles = makeStyles(theme => ({
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
      height: "calc(100% - 56px - 48px - 12px)",
      padding: "0 5px",
      marginTop: 15
    },
    column: {
      flex: "0 0 50%",
      display: "flex",
      flexDirection: "column"
    },
    footer: {
      display: "flex",
      justifyContent: "center",
      marginTop: 2,
      marginBottom: 10
    },
    socialIconBadge: {
      color: theme.palette.text.primary,
      "&:hover": {
        color: theme.palette.text.primary
      }
    },
    title: {
      padding: 15,
      paddingBottom: 0
    },
    movaiLogo: {
      padding: 15,
      paddingBottom: 0,
      width: 178,
      height: 56
    },
    movaiIcon: {
      width: 24,
      height: 24
    },
}));

export const quickAccessStyles = makeStyles(theme => ({
  ...sharedStyles,
  link: {
    color: "#3db5e6",
    fontSize: 16,
    padding: "5px 10px",
    fontWeight: 600,
    display: "flex",
    "&:hover": {
      cursor: "pointer",
      backgroundColor: `${theme.palette.primary.main}26`,
      color: theme.palette.text.primary,
      textDecoration: "none"
    }
  },
  linkIcon: {
    color: theme.palette.text.primary,
    marginRight: 10,
    fontSize: 20
  },
}));

export const recentDocumentsStyles = makeStyles(theme => ({
  ...sharedStyles,
  flexTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentPaper: {
    maxHeight: "calc(100% - 78px)",
    overflow: "auto"
  },
  clearIcon: {
    color: theme.palette.text.primary,
    fontSize: 8
  }
}));

export const samplesDocumentsStyles = makeStyles(theme => ({
  ...sharedStyles,
  samplePaper: {
    maxHeight: "calc(100% - 20px)"
  },
  cardDivider: {
    height: 3,
    margin: "0 20px"
  },
  columnSample: {
    margin: 3,
    overflow: "auto",
    maxHeight: "calc(100% - 90px)"
  }
}));

export const homeTabCardStyles = makeStyles(theme => ({
  card: {
    display: "flex",
    margin: 2,
    padding: 5,
    borderRadius: 2,
    "&:hover": {
      cursor: "pointer",
      backgroundColor: `${theme.palette.primary.main}26`
    }
  },
  cardHeader: {
    display: "flex",
    flexFlow: "row",
    margin: "10px 5px",
    fontSize: 20,
    color: theme.palette.text.primary,
    alignItems: "center"
  },
  cardBody: {
    display: "flex",
    flexFlow: "column",
    margin: "0px 5px"
  },
  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
    margin: "3px 5px"
  },
  cardIcon: {
    backgroundColor: theme.palette.text.primary,
    color: "rgb(0, 127, 255)",
    borderRadius: 5,
    marginRight: 10
  },
  title: {
    fontWeight: 600
  },
  icon: {
    color: theme.palette.text.primary,
    padding: 3,
    paddingRight: 20,
    "&:hover": {
      color: theme.palette.text.primary
    }
  },
  avatar: {
    display: "flex",
    marginTop: 10,
    marginRight: 10
  },
  paragraph: {
    marginBottom: 0
  },
  movaiIcon: {
    width: 35,
    height: 35
  },
  externalLinkButton: {
    fontWeight: 600,
    color: theme.palette.text.primary,
    "&:hover": {
      color: theme.palette.text.primary,
      textDecoration: "none",
      backgroundColor: `${theme.palette.primary.main}c4`,
      "& $externalLinkLabel": {
        color: theme.palette.text.primary
      }
    }
  },
  externalLinkLabel: {
    color: theme.palette.text.primary,
    "&:hover": {
      textDecoration: "none"
    }
  }
}));

export const homeTabLinkStyles = makeStyles(theme => ({
  deleteDocument: {
    visibility: "hidden"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "2px 10px",
    "&:hover": {
      cursor: "pointer",
      backgroundColor: `${theme.palette.primary.main}26`,
      "& $link": {
        color: theme.palette.text.primary
      },
      "& $deleteDocument": {
        visibility: "visible"
      }
    }
  },
  deleted: {
    textDecoration: "line-through"
  },
  link: {
    color: theme.palette.primary.light,
    fontSize: 16,
    margin: "2px 10px",
    fontWeight: 600
  },
  iconLink: {
    display: "flex",
    alignItems: "center",
    "& svg": {
      fontSize: 20
    }
  },
  iconFont: {
    fontSize: 20
  }
}));