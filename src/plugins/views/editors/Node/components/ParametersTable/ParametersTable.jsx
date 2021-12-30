import React, { memo } from "react";
import PropTypes from "prop-types";
import _isEqual from "lodash/isEqual";
import KeyValueTable from "../KeyValueTable/KeyValueTable";
import ParameterEditorDialog from "./ParametersEditorDialog";
import useDataTypes from "./DataTypes/hooks/useDataTypes";
import { useTranslation, DEFAULT_FUNCTION } from "../../../_shared/mocks";

const ParametersTable = props => {
  // Props
  const { editable, data, openEditDialog, onRowDelete, defaultColumns } = props;
  // Hooks
  const { getLabel } = useDataTypes();
  const { t } = useTranslation();
  // Override default columns
  const typeColumn = {
    title: t("Type"),
    field: "type",
    width: 150,
    cellStyle: {
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden"
    },
    render: rowData => getLabel(rowData.type)
  };
  // Add type column to position 2 of columns array
  const columns = [...defaultColumns];
  columns.splice(2, 0, typeColumn);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <KeyValueTable
      title={t("Parameters")}
      varName="parameters"
      editable={editable}
      data={data}
      columns={columns}
      onRowDelete={onRowDelete}
      openEditDialog={(varName, dataId) =>
        openEditDialog(varName, dataId, ParameterEditorDialog)
      }
    ></KeyValueTable>
  );
};

ParametersTable.propTypes = {
  data: PropTypes.array,
  defaultColumns: PropTypes.array,
  onRowDelete: PropTypes.func,
  openEditDialog: PropTypes.func,
  editable: PropTypes.bool
};

ParametersTable.defaultProps = {
  data: [],
  defaultColumns: [],
  onRowDelete: () => DEFAULT_FUNCTION("onRowDelete"),
  openEditDialog: () => DEFAULT_FUNCTION("openEditDialog"),
  editable: false
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  return _isEqual(prevProps.data, nextProps.data);
}

export default memo(ParametersTable, arePropsEqual);
