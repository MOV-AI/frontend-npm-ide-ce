import React, { memo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "../../../_shared/mocks";
import { HtmlTooltip } from "../_shared/HtmlTooltip";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Divider from "@material-ui/core/Divider";
import MaterialTable from "@material-table/core";
import AddBox from "@material-ui/icons/AddBox";
import IconButton from "@material-ui/core/IconButton";
import Edit from "@material-ui/icons/Edit";
import InfoLogo from "@material-ui/icons/Info";
import _isEqual from "lodash/isEqual";

const useStyles = makeStyles(theme => ({
  root: {
    padding: "5px 0px 5px 0px",
    width: "100%"
  },
  heading: {
    fontSize: "1.5rem"
  },
  details: {
    padding: "8px 24px 24px"
  },
  column: {
    flexBasis: "80%"
  },
  logo: {
    margin: "2px",
    padding: "0px"
  },
  input: {
    fontSize: "13px"
  }
}));

const KeyValueTable = props => {
  // Props
  const { varName, data, title, onRowDelete, openEditDialog, editable } = props;
  // Hooks
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Format data : Convert object in array to be rendered in Material Table
   * @param {*} _data : Raw data (can be an object of objects)
   * @returns {array} Formatted data
   */
  const formatData = _data => {
    if (Array.isArray(_data)) return _data;
    return Object.keys(_data).map(key => ({
      name: _data[key].name,
      value: _data[key].value,
      info: _data[key].description
    }));
  };

  //========================================================================================
  /*                                                                                      *
   *                                 Render sub-components                                *
   *                                                                                      */
  //========================================================================================

  const renderInfoIcon = rowData => {
    return (
      <HtmlTooltip
        title={
          <React.Fragment>
            <Typography color="inherit" component="h3">
              <b>{rowData.name}</b>
            </Typography>
            <p>{rowData.info}</p>
          </React.Fragment>
        }
      >
        <IconButton className={classes.logo}>
          <InfoLogo />
        </IconButton>
      </HtmlTooltip>
    );
  };

  /**
   * Render of Value column
   * @param {*} rowData
   * @returns Row value column
   */
  const renderValue = rowData => {
    if (rowData.type === "string") return JSON.stringify(rowData.value);
    return rowData.value;
  };

  //========================================================================================
  /*                                                                                      *
   *                                     Table Methods                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Get table actions definitions
   *  Add     : If editable -> open modal with empty data
   *  Edit    : Always rendered, but not always enabled (depends on editable prop) -> open modal with current data
   *  Delete  : Not necessary to add in this function because it should have the default behavior from material table
   * @returns {array} Array of actions availabe on Material table
   */
  const getActions = () => {
    const actions = [
      rowData => ({
        icon: () => <Edit></Edit>,
        disabled: !editable,
        tooltip: t("Edit"),
        onClick: () => openEditDialog(varName, rowData.name)
      })
    ];
    // Add row button if editable
    if (editable)
      actions.push({
        icon: () => <AddBox></AddBox>,
        tooltip: `${t("Add")} ${title}`,
        isFreeAction: true,
        onClick: () => openEditDialog(varName)
      });
    return actions;
  };

  /**
   * Get table columns definitions
   *  Info  : Tooltip with name and description
   *  Name  : Key name
   *  Value : Key value
   * @returns {array} Table columns
   */
  const getColumns = () => {
    return [
      {
        title: "",
        field: "description",
        cellStyle: { padding: "10px", textAlign: "start", width: "5%" },
        sorting: false,
        render: renderInfoIcon
      },
      {
        title: t("Name"),
        field: "name",
        cellStyle: {
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
          width: "40%"
        }
      },
      {
        title: t("Value"),
        field: "value",
        render: renderValue,
        cellStyle: {
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
          width: "40%"
        }
      }
    ];
  };

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <Typography component="div" className={classes.root} key={varName}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography component="div" className={classes.column}>
            <Typography className={classes.heading}>{title}</Typography>
          </Typography>
        </AccordionSummary>
        <Divider />
        <Typography component="div" className={classes.details}>
          <MaterialTable
            style={{ boxShadow: "none", justifyContent: "center" }}
            title=""
            columns={getColumns()}
            data={formatData(data)}
            actions={getActions()}
            editable={{
              isEditable: () => editable,
              isDeletable: () => editable,
              onRowDelete: rowData => onRowDelete(varName, rowData.name)
            }}
            options={{
              rowStyle: (rowData, index) => {
                return index % 2 === 0
                  ? {}
                  : { backgroundColor: theme.nodeEditor.stripeColor };
              },
              search: true,
              searchFieldAlignment: "left",
              actionsCellStyle: {
                textAlign: "right",
                color: theme.palette.primary.main
              },
              actionsColumnIndex: -1,
              draggable: false,
              grouping: false,
              paging: false
            }}
            localization={{
              toolbar: { searchPlaceholder: t("Search") },
              pagination: {
                labelDisplayedRows: "{from}-{to} of {count}"
              },
              header: {
                actions: t("Actions")
              },
              body: {
                emptyDataSourceMessage: t("No records to display"),
                deleteTooltip: t("Delete"),
                editTooltip: t("Edit"),
                addTooltip: t("Add"),
                editRow: {
                  cancelTooltip: t("Cancel"),
                  saveTooltip: t("Confirm")
                }
              }
            }}
          />
        </Typography>
      </Accordion>
    </Typography>
  );
};

const DEFAULT_FUNCTION = name => console.log(`${name} not implemented`);

KeyValueTable.propTypes = {
  varName: PropTypes.string,
  data: PropTypes.array,
  title: PropTypes.string,
  onRowDelete: PropTypes.func,
  openEditDialog: PropTypes.func,
  editable: PropTypes.bool
};

KeyValueTable.defaultProps = {
  varName: "cmdLine",
  data: [],
  title: "Title",
  onRowDelete: () => DEFAULT_FUNCTION("onRowDelete"),
  openEditDialog: () => DEFAULT_FUNCTION("openEditDialog"),
  editable: false
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  return _isEqual(prevProps.data, nextProps.data);
}

export default memo(KeyValueTable, arePropsEqual);
