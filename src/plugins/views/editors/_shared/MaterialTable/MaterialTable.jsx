import React from "react";
import PropTypes from "prop-types";
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
  const openedPanels = React.useRef({});
  const oldFunction = React.useRef();
  const tableRef = ref || defaultTableRef;

  React.useEffect(() => {
    if (!oldFunction.current) {
      oldFunction.current = tableRef.current?.onToggleDetailPanel;
    }

    if (oldFunction.current === tableRef.current?.onToggleDetailPanel) {
      tableRef.current.onToggleDetailPanel = (path, render) => {
        if (tableRef.current.props.data[path[0]]?.tableData?.showDetailPanel) {
          delete openedPanels.current[path[0]];
        } else {
          openedPanels.current = {
            ...openedPanels.current,
            [path[0]]: true
          };
        }

        oldFunction.current(path, render);
      };
    }
  }, [ref, tableRef]);

  return (
    <MaterialTableCore
      tableRef={tableRef}
      style={{ boxShadow: "none", justifyContent: "center" }}
      title={title ? title : ""}
      detailPanel={detailPanel}
      columns={columns}
      actions={actions}
      editable={editable}
      components={components}
      data={
        data?.map((d, i) => {
          const detailPanelFunction =
            typeof props.detailPanel === "function"
              ? props.detailPanel
              : rowData => props.detailPanel[0](rowData).render();
          return {
            ...d,
            tableData: {
              showDetailPanel: openedPanels.current[i]
                ? detailPanelFunction
                : null
            }
          };
        }) || []
      }
      options={{
        ...options,
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
  );
});

MaterialTable.propTypes = {
  data: PropTypes.array,
  options: PropTypes.object
};

MaterialTable.defaultProps = {
  options: {}
};

export default MaterialTable;
