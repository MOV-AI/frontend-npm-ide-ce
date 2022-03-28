import React, { useCallback, useRef, memo } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import _isEqual from "lodash/isEqual";
import { MTableToolbar, MTableEditRow } from "material-table";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import { PLUGINS } from "../../../../../../utils/Constants";
import MaterialTable from "../../../_shared/MaterialTable/MaterialTable";
import CollapsibleHeader from "../_shared/CollapsibleHeader";
import useIOConfigColumns from "./hooks/useIOConfigColumns";
import useHelper from "./hooks/useHelper";
import IOPorts from "./IOPorts/IOPorts";

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
    protectedCallbacks,
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
    call(
      PLUGINS.DOC_MANAGER.NAME,
      PLUGINS.DOC_MANAGER.CALL.GET_STORE,
      scope
    ).then(store => {
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
   * Set in port data
   */
  const setPortDataIn = React.useCallback(
    rowData => {
      rowData.portIn = scopePorts[rowData.template]?.In;
      // Update CallbackOptions and EffectiveMessage = (pkg/msg) of in ioport
      if (rowData.portIn !== undefined) {
        Object.keys(rowData.portIn).forEach(key => {
          rowData = formatPortData(rowData, "portIn", key);
        });
      }
      return rowData;
    },
    [scopePorts, formatPortData]
  );

  /**
   * Set out port data
   */
  const setPortDataOut = React.useCallback(
    rowData => {
      rowData.portOut = scopePorts[rowData.template]?.Out;
      // Update CallbackOptions and EffectiveMessage = (pkg/msg) of out ioport
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
        newData = setPortDataIn(newData);
        newData = setPortDataOut(newData);
        // Call method to set row
        onIOConfigRowSet(newData, resolve, reject);
      });
    },
    [onIOConfigRowSet, setPortDataIn, setPortDataOut]
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
        if (!oldData.portIn?.in) {
          newData = setPortDataIn(newData);
        }
        if (!oldData.portIn?.out) {
          newData = setPortDataOut(newData);
        }
        // Call method to set row
        onIOConfigRowSet(newData, resolve, reject, oldData);
      });
    },
    [onIOConfigRowSet, setPortDataIn, setPortDataOut]
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
          protectedCallbacks={protectedCallbacks}
          handleIOPortsInputs={handleIOPortsInputs}
          handleOpenCallback={handleOpenCallback}
          handleNewCallback={handleNewCallback}
          handleOpenSelectScopeModal={handleOpenSelectScopeModal}
        />
      );
    },
    [
      editable,
      protectedCallbacks,
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
  ioConfig: PropTypes.object.isRequired,
  onIOConfigRowSet: PropTypes.func.isRequired,
  onIOConfigRowDelete: PropTypes.func.isRequired,
  handleIOPortsInputs: PropTypes.func.isRequired,
  handleOpenSelectScopeModal: PropTypes.func.isRequired,
  handleOpenCallback: PropTypes.func.isRequired,
  handleNewCallback: PropTypes.func.isRequired,
  protectedCallbacks: PropTypes.array,
  editable: PropTypes.bool
};

IOConfig.defaultProps = {
  editable: true,
  protectedCallbacks: []
};

//The function returns true when the compared props equal, preventing the component from re-rendering
function arePropsEqual(prevProps, nextProps) {
  const sameConfig = _isEqual(prevProps.ioConfig, nextProps.ioConfig);
  const sameProtectedDocs = _isEqual(
    prevProps.protectedCallbacks,
    nextProps.protectedCallbacks
  );
  return sameConfig && sameProtectedDocs;
}

export default memo(IOConfig, arePropsEqual);
