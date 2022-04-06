import { makeStyles } from "@material-ui/core/styles";

export const menuStyles = makeStyles(_ => ({
  itemValue: {
    padding: "15px 15px 15px 25px",
    fontSize: "14px"
  },
  itemLibValue: {
    paddingLeft: "10px",
    "& span": {
      fontSize: "14px"
    }
  },
  disabled: {
    color: "gray"
  }
}));
