import React, { memo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import _isEqual from "lodash/isEqual";
import AddBox from "@material-ui/icons/AddBox";
import Edit from "@material-ui/icons/Edit";
import CollapsibleHeader from "../CollapsibleHeader/CollapsibleHeader";
import MaterialTable from "../MaterialTable/MaterialTable";

const KeyValueTable = props => {
  // Props
  const {
    varName,
    data,
    title,
    onRowDelete,
    openEditDialog,
    editable,
    columns
  } = props;
  // Hooks
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
    return Object.values(_data).map((item, i) => {
      return {
        id: `${i}_${item.name}`,
        name: item.name,
        value: item.value,
        type: item.type,
        description: item.description
      };
    });
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

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <CollapsibleHeader title={title}>
      <MaterialTable
        columns={columns}
        data={formatData(data)}
        actions={getActions()}
        editable={{
          isEditable: () => editable,
          isDeletable: () => editable,
          onRowDelete: rowData => onRowDelete(varName, rowData.name)
        }}
      />
    </CollapsibleHeader>
  );
};

KeyValueTable.propTypes = {
  varName: PropTypes.string.isRequired,
  onRowDelete: PropTypes.func.isRequired,
  openEditDialog: PropTypes.func.isRequired,
  title: PropTypes.string,
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  columns: PropTypes.array,
  editable: PropTypes.bool
};

KeyValueTable.defaultProps = {
  data: [],
  columns: [
    { field: "name", title: "Name" },
    { field: "value", title: "Value" }
  ],
  editable: false
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  return _isEqual(prevProps.data, nextProps.data);
}

export default memo(KeyValueTable, arePropsEqual);
