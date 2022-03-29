import React, { forwardRef, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import MaterialTableCore from "@material-table/core";
import { useTheme } from "@material-ui/core/styles";

import materialTableStyles from "./styles";

const MaterialTable = forwardRef((props, ref) => {
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
  const classes = materialTableStyles();
  const { t } = useTranslation();
  // Refs
  const defaultTableRef = useRef();
  const openedPanels = useRef({});
  const oldFunction = useRef();
  const tableRef = ref || defaultTableRef;

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Simple extract method to get the table title
   * @returns {String} to be used as table title
   */
  const getTitle = () => {
    let tableTitle = "";

    if (title) tableTitle = title;

    return tableTitle;
  };

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    if (!oldFunction.current) {
      oldFunction.current = tableRef.current?.onToggleDetailPanel;
    }

    if (oldFunction.current === tableRef.current?.onToggleDetailPanel) {
      tableRef.current.onToggleDetailPanel = (path, render) => {
        const index = tableRef.current.state.data[path[0]]?.id || path[0];
        if (openedPanels.current[index]) {
          delete openedPanels.current[index];
        } else {
          openedPanels.current[index] = true;
        }

        oldFunction.current(path, render);
      };
    }
  }, [ref, tableRef]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div className={classes.tableContainer}>
      <MaterialTableCore
        tableRef={tableRef}
        title={getTitle()}
        detailPanel={detailPanel}
        columns={columns}
        actions={actions}
        editable={editable}
        components={components}
        data={data}
        options={{
          ...options,
          rowStyle: (rowData, index) => {
            return (
              index % 2 !== 0 && {
                backgroundColor: theme.nodeEditor.stripeColor
              }
            );
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
    </div>
  );
});

MaterialTable.propTypes = {
  data: PropTypes.array,
  options: PropTypes.object
};

MaterialTable.defaultProps = {
  options: {},
  data: []
};

export default MaterialTable;
