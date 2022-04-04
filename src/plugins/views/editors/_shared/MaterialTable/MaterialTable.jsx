import React, { forwardRef, useEffect, useRef, memo } from "react";
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
    title = "",
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
  const toggleDetailPanelHandler = useRef();
  const tableRef = ref || defaultTableRef;

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Get a row style to apply to alternated rows
   * @param {*} _
   * @param {Int} rowIndex : the rowIndex
   * @returns
   */
  const getRowStyle = (_, rowIndex) => {
    return (
      rowIndex % 2 !== 0 && {
        backgroundColor: theme.nodeEditor.stripeColor
      }
    );
  };

  // TODO Dependent on backend ticket: https://movai.atlassian.net/browse/BP-546
  // const openOpenedDetails = useCallback(() => {
  //   const tableData = tableRef.current?.state?.data;
  //   if (!tableData) return;
  //   tableData.forEach((row, i) => {
  //     if (openedPanels.current[row.id])
  //       toggleDetailPanelHandler.current([i], openedPanels.current[row.id]);
  //   });
  // }, [tableRef]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    if (!toggleDetailPanelHandler.current) {
      toggleDetailPanelHandler.current = tableRef.current?.onToggleDetailPanel;
    }

    if (
      toggleDetailPanelHandler.current === tableRef.current?.onToggleDetailPanel
    ) {
      tableRef.current.onToggleDetailPanel = (path, render) => {
        const index = tableRef.current.state.data[path[0]]?.id || path[0];
        if (openedPanels.current[index]) {
          delete openedPanels.current[index];
        } else {
          openedPanels.current[index] = render;
        }

        toggleDetailPanelHandler.current(path, render);
      };
    }
  }, [tableRef]);

  // TODO while faking id's works in the meanwhile, deep stuff, like checking after new data comes
  // for id, makes faking id's not work. This is dependent on backend ticket: https://movai.atlassian.net/browse/BP-546
  // useEffect(() => {
  //   openOpenedDetails(data);
  // }, [data, openOpenedDetails]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <div className={classes.tableContainer}>
      <MaterialTableCore
        tableRef={tableRef}
        title={title}
        detailPanel={detailPanel}
        columns={columns}
        actions={actions}
        editable={editable}
        components={components}
        data={data}
        options={{
          ...options,
          rowStyle: getRowStyle,
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

export default memo(MaterialTable);
