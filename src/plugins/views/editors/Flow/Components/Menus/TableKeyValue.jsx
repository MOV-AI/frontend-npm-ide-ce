import React from "react";
import { Typography } from "@material-ui/core";
import Edit from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import IconButton from "@material-ui/core/IconButton";
import VisibilityIcon from "@material-ui/icons/Visibility";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import { DEFAULT_FUNCTION } from "../../../_shared/mocks";
import Search, { filter } from "../../../_shared/Search/Search";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  rowContainer: {
    display: "flex",
    flexDirection: "row",
    // flexWrap: "wrap",
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

/**
 * List to show key and input with the value
 * @param {array} list { key: "bla", value: "bla", defaultValue: "place" }
 */
const TableKeyValue = props => {
  const { list } = props;
  const [searchValue, setSearchValue] = React.useState("");
  const classes = useStyles();
  const viewOnly = !props.allowEdit && !props.allowDelete;

  /**
   * Render strings with quotes and other types as it is
   * @param {*} value
   * @param {String} type
   * @returns {String} rendered value
   */
  const renderValue = (value, type) => {
    return type === "string" ? JSON.stringify(value) : value;
  };

  const renderParamRow = obj => {
    if (obj.value === "" || obj.value === null) {
      return (
        <Typography
          component="div"
          className={`${classes.valueDefault} ${classes.valueContainer}`}
        >
          {renderValue(obj.defaultValue, obj.type)}
        </Typography>
      );
    } else if (obj.value === "None") {
      return (
        <Typography
          component="div"
          className={`${classes.valueNone} ${classes.valueContainer}`}
        >
          {renderValue(obj.defaultValue, obj.type)}
        </Typography>
      );
    } else {
      return (
        <Typography component="div" className={classes.valueContainer}>
          {renderValue(obj.value, obj.type)}
        </Typography>
      );
    }
  };

  return (
    <Typography component="div" className={classes.root}>
      {props.allowSearch && (
        <div style={{ padding: "5px 10px 15px" }}>
          <Search onSearch={value => setSearchValue(value)}></Search>
        </div>
      )}
      {filter(searchValue, list)
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((obj, index) => {
          return (
            <Typography
              component="div"
              className={classes.rowContainer}
              key={index}
            >
              <Typography
                component="div"
                className={`${classes.keyContainer} ${
                  obj.value === "None" ? classes.valueNone : ""
                }`}
              >
                {obj.key}
              </Typography>
              {renderParamRow(obj)}
              {viewOnly && !props.allowEditFunction(obj) && (
                <IconButton
                  onClick={() =>
                    props.handleParameterEditModal(obj, props.type)
                  }
                  size="small"
                >
                  <VisibilityIcon />
                </IconButton>
              )}
              {(props.allowEdit || props.allowEditFunction(obj)) && (
                <IconButton
                  onClick={() =>
                    props.handleParameterEditModal(obj, props.type)
                  }
                  size="small"
                >
                  <Edit></Edit>
                </IconButton>
              )}
              {(props.allowDelete || props.allowDeleteFunction(obj)) && (
                <IconButton
                  onClick={() =>
                    props.handleParameterDeleteModal(obj, props.type)
                  }
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Typography>
          );
        })}
    </Typography>
  );
};

TableKeyValue.propTypes = {
  list: PropTypes.array, //[{ key: "bla", value: "bla", defaultValue: "place" }]
  type: PropTypes.string,
  handleParameterEditModal: PropTypes.func,
  handleParameterDeleteModal: PropTypes.func,
  allowDelete: PropTypes.bool,
  allowEdit: PropTypes.bool,
  allowSearch: PropTypes.bool
};

TableKeyValue.defaultProps = {
  list: [],
  type: "params", //params, cmdline , env
  allowDelete: false,
  allowEdit: false,
  allowSearch: false,
  // prop functions
  handleParameterEditModal: () => DEFAULT_FUNCTION("handleParameterEditModal"),
  handleParameterDeleteModal: () => DEFAULT_FUNCTION("deleteModal"),
  allowEditFunction: () => DEFAULT_FUNCTION("allowEditFunction"),
  allowDeleteFunction: () => DEFAULT_FUNCTION("allowDeleteFunction")
};

export default TableKeyValue;
