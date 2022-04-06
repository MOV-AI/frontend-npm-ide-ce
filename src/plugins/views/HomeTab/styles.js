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
    marginTop: "15px"
  },
  column: {
    flex: "0 0 50%",
    display: "flex",
    flexDirection: "column"
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "2px",
    marginBottom: "10px"
  },
  socialIconBadge: {
    color: theme.palette.text.primary,
    "&:hover": {
      color: theme.palette.text.primary
    }
  },
  title: {
    padding: "15px",
    paddingBottom: "0px"
  },
  movaiLogo: {
    padding: "15px",
    paddingBottom: "0px",
    width: "178px",
    height: "56px"
  },
  movaiIcon: {
    height: "30px"
  }
}));

export const quickAccessStyles = makeStyles(theme => ({
  ...sharedStyles,
  link: {
    color: "#3db5e6",
    fontSize: "16px",
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
    marginRight: "10px",
    fontSize: "20px"
  }
}));

export const recentDocumentsStyles = makeStyles(theme => ({
  ...sharedStyles,
  flexTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  recentPaper: {
    maxHeight: "calc(100% - 78px)",
    overflow: "auto"
  },
  clearIcon: {
    color: theme.palette.text.primary,
    fontSize: "8px"
  }
}));

export const examplesDocumentsStyles = makeStyles(_ => ({
  ...sharedStyles,
  examplePaper: {
    maxHeight: "calc(100% - 20px)"
  },
  cardDivider: {
    height: "3px",
    margin: "0 20px"
  },
  columnExample: {
    margin: "3px",
    overflow: "auto",
    maxHeight: "calc(100% - 90px)"
  }
}));

export const homeTabCardStyles = makeStyles(theme => ({
  card: {
    display: "flex",
    margin: "2px",
    padding: "5px",
    borderRadius: "2px",
    alignItems: "center",
    "&:hover": {
      cursor: "pointer",
      backgroundColor: `${theme.palette.primary.main}26`
    }
  },
  haveImage: {
    width: "calc(100% - 185px)",
    marginRight: "15px"
  },
  fullWidth: {
    width: "100%"
  },
  exampleImage: {
    width: 170,
    height: 170,
    borderRadius: "5px",
    border: "4px solid white",
    boxShadow: "1px 1px 8px 0px #000",
    "& > img": {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  },
  cardHeader: {
    display: "flex",
    flexFlow: "row",
    margin: "10px 5px",
    fontSize: "20px",
    color: theme.palette.text.primary,
    alignItems: "center"
  },
  cardBody: {
    display: "flex",
    flexFlow: "column",
    margin: "0px 5px"
  },
  cardFooter: {
    margin: "30px 5px 10px",
    "& > button": {
      margin: "0px"
    }
  },
  cardIcon: {
    backgroundColor: theme.palette.text.primary,
    color: "rgb(0, 127, 255)",
    borderRadius: "5px",
    marginRight: "10px",
    fontSize: "15px"
  },
  title: {
    fontWeight: 600,
    display: "flex",
    alignItems: "flex-start"
  },
  icon: {
    color: theme.palette.text.primary,
    padding: "3px",
    paddingRight: "20px",
    "&:hover": {
      color: theme.palette.text.primary
    }
  },
  avatar: {
    display: "inherit",
    marginLeft: "10px"
  },
  paragraph: {
    marginBottom: "0px"
  },
  movaiIcon: {
    width: "15px",
    height: "15px"
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
    fontSize: "16px",
    margin: "2px 10px",
    fontWeight: 600
  },
  iconLink: {
    display: "flex",
    alignItems: "center",
    "& svg": {
      fontSize: "20px"
    }
  },
  iconFont: {
    fontSize: "20px"
  }
}));
