import React, { useCallback, useRef, memo } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { MTableToolbar, MTableEditRow } from "material-table";
import MaterialTable from "../../../_shared/MaterialTable/MaterialTable";
import IOPorts from "./IOPorts/IOPorts";
import CollapsibleHeader from "../_shared/CollapsibleHeader";
import { Typography } from "@material-ui/core";
import _isEqual from "lodash/isEqual";
import { useTranslation, DEFAULT_FUNCTION } from "../../../_shared/mocks";
import useIOConfigColumns from "./hooks/useIOConfigColumns";
import useHelper from "./hooks/useHelper";

const useStyles = makeStyles(theme => ({
  details: {
    padding: "8px 24px 24px",
    "&.editing div[class^='MTableToolbar-actions'] .MuiIconButton-root, &.editing .Mui-selected, &.editing .child-row":
      {
        opacity: "0.2",
        transition: "all 300ms ease 0s",
        cursor: "default",
        pointerEvents: "none"
      }
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  control: {
    fontSize: "0.875rem"
  },
  toolbar: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  toolbarComponents: {
    width: "100%"
  }
}));

const IOConfig = props => {
  // Refs
  const tableRef = useRef();
  const tableContainerRef = useRef();

  // Props
  const {
    ioConfig,
    call,
    scope,
    onIOConfigRowSet,
    onIOConfigRowDelete,
    handleIOPortsInputs,
    handleOpenSelectScopeModal,
    handleOpenCallback,
    handleNewCallback,
    autoFocus,
    editable
  } = props;

  // State hooks
  const [scopePorts, setScopePorts] = React.useState({});
  const [scopeSystemPortsData, setScopeSystemPortsData] = React.useState({});

  // Other hooks
  const classes = useStyles();
  const { t } = useTranslation();
  const { getEffectiveMessage } = useHelper();
  const { getColumns } = useIOConfigColumns({
    scopeSystemPortsData,
    scopePorts,
    autoFocus
  });

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    // Initialize state
    call("docManager", "getStore", scope).then(store => {
      // Get All transport / protocol to fill first selector
      store.helper.getAllTransportProtocol().then(res => {
        if (res) setScopePorts(res);
      });
      // Get All ports data to fill second selector
      store.helper.getPortsData().then(res => {
        if (res) setScopeSystemPortsData(res);
      });
    });
  }, [call, scope]);

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Update lock rows : Add fade out effect to detail panel when editing table
   * @returns
   */
  const updateLockRows = () => {
    if (!tableRef.current || !tableContainerRef.current) return;
    setTimeout(() => {
      const editingRow = tableRef.current.dataManager.lastEditingRow;
      const addingRow =
        tableContainerRef?.current?.querySelector("tr[mode='add']");
      if (editingRow || addingRow) {
        tableContainerRef?.current?.classList.add("editing");
      } else {
        tableContainerRef?.current?.classList.remove("editing");
      }
    });
  };

  /**
   * Format data : Convert object in array to be rendered in Material Table
   * @param {*} _data : Raw data (can be an object of objects)
   * @returns {array} Formatted data
   */
  const formatData = _data => {
    if (Array.isArray(_data)) return _data;
    return Object.entries(_data).map(([key, item]) => {
      return {
        ...item,
        id: key, // Just to have an id on the rows (to prevent error thrown)
        name: item.name
      };
    });
  };

  /**
   * Format port data
   */
  const formatPortData = React.useCallback(
    (rowData, direction, key) => {
      // Set port properties
      const effectiveMessage = getEffectiveMessage(rowData, direction, key);
      rowData[direction][key]["message"] = effectiveMessage;
      rowData[direction][key]["callback"] = rowData[direction][key].Callback;
      rowData[direction][key]["parameters"] = rowData[direction][key].Parameter;
      // Delete LinkEnabled
      delete rowData[direction][key]["LinkEnabled"];
      if (direction === "portOut") return rowData;
      return rowData;
    },
    [getEffectiveMessage]
  );

  /**
   * Set port data
   */
  const setPortData = React.useCallback(
    rowData => {
      rowData.portIn = scopePorts[rowData.template]?.In;
      rowData.portOut = scopePorts[rowData.template]?.Out;
      // Update CallbackOptions and EffectiveMessage = (pkg/msg) of each ioport
      if (rowData.portIn !== undefined) {
        Object.keys(rowData.portIn).forEach(key => {
          rowData = formatPortData(rowData, "portIn", key);
        });
      }
      if (rowData.portOut !== undefined) {
        Object.keys(rowData.portOut).forEach(key => {
          rowData = formatPortData(rowData, "portOut", key);
        });
      }
      return rowData;
    },
    [scopePorts, formatPortData]
  );

  //========================================================================================
  /*                                                                                      *
   *                                      Edit Events                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle Add of new config
   * @param {*} newData
   * @returns
   */
  const handleRowAdd = useCallback(
    newData => {
      return new Promise((resolve, reject) => {
        // Set port in/out
        newData = setPortData(newData);
        // Call method to set row
        onIOConfigRowSet(newData, resolve, reject);
      });
    },
    [onIOConfigRowSet, setPortData]
  );

  /**
   * Handle Update of config
   * @param {*} newData
   * @param {*} oldData
   * @returns
   */
  const handleRowUpdate = useCallback(
    (newData, oldData) => {
      return new Promise((resolve, reject) => {
        // Set port in/out
        newData = setPortData(newData);
        // Call method to set row
        onIOConfigRowSet(newData, resolve, reject, oldData);
      });
    },
    [onIOConfigRowSet, setPortData]
  );

  /**
   * Handle Delete of config
   * @param {*} value
   * @returns
   */
  const handleRowDelete = useCallback(
    value => {
      return new Promise(resolve => {
        onIOConfigRowDelete(value, resolve);
      });
    },
    [onIOConfigRowDelete]
  );

  //========================================================================================
  /*                                                                                      *
   *                            Render Custom Table Components                            *
   *                                                                                      */
  //========================================================================================

  /**
   * Render custom Toolbar
   * @param {*} _props
   * @returns
   */
  const renderCustomToolbar = _props => {
    return (
      <Typography component="div" className={classes.toolbar}>
        <Typography component="div" className={classes.toolbarComponents}>
          <MTableToolbar {..._props} />
        </Typography>
      </Typography>
    );
  };

  /**
   * Render custom edit row
   * @param {*} _props
   * @returns
   */
  const renderCustomEditRow = _props => {
    updateLockRows();
    return (
      <MTableEditRow
        {..._props}
        onEditingCanceled={mode => {
          _props.onEditingCanceled(mode);
          updateLockRows();
        }}
        onEditingApproved={(mode, newData, oldData) => {
          _props.onEditingApproved(mode, newData, oldData);
          updateLockRows();
        }}
      />
    );
  };

  /**
   * Render Details Panel
   * @param {*} panelData
   * @returns
   */
  const renderDetailPanel = useCallback(
    panelData => {
      return (
        <IOPorts
          classNames="child-row"
          editable={editable}
          rowData={panelData.rowData}
          handleIOPortsInputs={handleIOPortsInputs}
          handleOpenCallback={handleOpenCallback}
          handleNewCallback={handleNewCallback}
          handleOpenSelectScopeModal={handleOpenSelectScopeModal}
        />
      );
    },
    [
      editable,
      handleIOPortsInputs,
      handleOpenCallback,
      handleNewCallback,
      handleOpenSelectScopeModal
    ]
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <CollapsibleHeader title={t("I/O Configuration")} defaultExpanded={true}>
      <Typography
        component="div"
        className={classes.details}
        ref={tableContainerRef}
      >
        <MaterialTable
          ref={tableRef}
          columns={getColumns()}
          data={formatData(ioConfig)}
          detailPanel={renderDetailPanel}
          editable={{
            isEditable: () => editable,
            isDeletable: () => editable,
            onRowAdd: editable ? handleRowAdd : null,
            onRowUpdate: handleRowUpdate,
            onRowDelete: handleRowDelete
          }}
          components={{
            Toolbar: renderCustomToolbar,
            EditRow: renderCustomEditRow
          }}
        />
      </Typography>
    </CollapsibleHeader>
  );
};

IOConfig.propTypes = {
  ioConfig: PropTypes.object,
  onIOConfigRowSet: PropTypes.func,
  onIOConfigRowDelete: PropTypes.func,
  handleIOPortsInputs: PropTypes.func,
  handleOpenSelectScopeModal: PropTypes.func,
  handleOpenCallback: PropTypes.func,
  handleNewCallback: PropTypes.func,
  editable: PropTypes.bool
};

IOConfig.defaultProps = {
  editable: true,
  onIOConfigRowSet: () => DEFAULT_FUNCTION("onIOConfigRowSet"),
  onIOConfigRowDelete: () => DEFAULT_FUNCTION("onIOConfigRowDelete"),
  handleIOPortsInputs: () => DEFAULT_FUNCTION("IOInputs"),
  handleOpenSelectScopeModal: () => DEFAULT_FUNCTION("openSelectScopeModal"),
  handleOpenCallback: () => DEFAULT_FUNCTION("handleOpenCallback"),
  handleNewCallback: () => DEFAULT_FUNCTION("handleNewCallback"),
  ioConfig: [
    {
      name: "undefined",
      template: "undefined",
      msgPackage: "undefined",
      message: "undefined",
      portIn: [
        {
          name: "undefined",
          message: "undefined",
          type: "iport",
          callback: "undefined",
          parameters: [
            { name: "undefined", value: "Check DB" },
            { name: "undefined", value: "Check DB", options: ["Check DB"] }
          ]
        }
      ]
    }
  ]
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  return _isEqual(prevProps.ioConfig, nextProps.ioConfig);
}

export default memo(IOConfig, arePropsEqual);
