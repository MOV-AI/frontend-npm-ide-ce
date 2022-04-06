import React, { memo } from "react";
import PropTypes from "prop-types";
import _isEqual from "lodash/isEqual";
import { useTranslation } from "react-i18next";
import { DEFAULT_FUNCTION } from "../../../../../../utils/Utils";
import ParameterEditorDialog from "../../../_shared/KeyValueTable/ParametersEditorDialog";
import useDataTypes from "../../../_shared/hooks/useDataTypes";
import KeyValueTable from "../KeyValueTable/KeyValueTable";

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
    tableData: {
      columnOrder: 1.5 // Workaround to add this column after 1, but before 2
    },
    cellStyle: {
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden"
    },
    render: rowData => getLabel(rowData.type)
  };
  const columns = [...defaultColumns];
  columns.push(typeColumn);

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
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
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
