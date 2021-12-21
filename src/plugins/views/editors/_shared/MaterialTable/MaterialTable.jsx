import React from "react";
import MaterialTableCore from "@material-table/core";
import { useTheme } from "@material-ui/core/styles";
import { useTranslation } from "../mocks";

const MaterialTable = React.forwardRef((props, ref) => {
  const {
    columns,
    actions,
    data,
    editable,
    options,
    title,
    detailPanel,
    components
  } = props;
  // Hooks
  const theme = useTheme();
  const { t } = useTranslation();
  // Refs
  const defaultTableRef = React.useRef();
  const tableRef = ref || defaultTableRef;

  return (
    <MaterialTableCore
      tableRef={tableRef}
      style={{ boxShadow: "none", justifyContent: "center" }}
      title={title ? title : ""}
      detailPanel={detailPanel}
      columns={columns}
      data={data}
      actions={actions}
      editable={editable}
      components={components}
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
        paging: false,
        ...options
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
  );
});

export default MaterialTable;
