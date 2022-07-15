import React, { useCallback, useEffect, useState, useRef, memo } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import _isEqual from "lodash/isEqual";
import { MTableToolbar, MTableEditRow } from "material-table";
import { Typography } from "@material-ui/core";
import { PLUGINS } from "../../../../../utils/Constants";
import MaterialTable from "../../../../_shared/MaterialTable/MaterialTable";
import CollapsibleHeader from "../../../../_shared/CollapsibleHeader/CollapsibleHeader";
import useIOConfigColumns from "./hooks/useIOConfigColumns";
import useHelper from "./hooks/useHelper";
import IOPorts from "./IOPorts/IOPorts";

import { ioConfigStyles } from "./styles";

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
  const [scopePorts, setScopePorts] = useState({});
  const [scopeSystemPortsData, setScopeSystemPortsData] = useState({});
  const [ioData, setIOData] = useState([]);

  // Other hooks
  const classes = ioConfigStyles();
  const { t } = useTranslation();
  const { getEffectiveMessage } = useHelper();
  const { getColumns } = useIOConfigColumns({
    scopeSystemPortsData,
    scopePorts,
    autoFocus
  });

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
  const formatData = useCallback(
    _data => {
      const newData = Array.isArray(_data)
        ? _data
        : Object.values(_data).map(item => ({
            ...item,
            name: item.name
          }));
      setIOData(prevState =>
        _isEqual(prevState, newData) ? prevState : newData
      );
    },
    [setIOData]
  );

  /**
   * Format port data
   */
  const formatPortData = useCallback(
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
   * Set in port data from template
   */
  const setPortDataIn = useCallback(
    rowData => {
      rowData.portIn = scopePorts[rowData.template]?.In || {};

      // Update CallbackOptions and EffectiveMessage = (pkg/msg) of in ioport
      Object.keys(rowData.portIn).forEach(key => {
        rowData = formatPortData(rowData, "portIn", key);
      });
      return rowData;
    },
    [scopePorts, formatPortData]
  );

  /**
   * Set out port data from template
   */
  const setPortDataOut = useCallback(
    rowData => {
      rowData.portOut = scopePorts[rowData.template]?.Out || {};

      // Update CallbackOptions and EffectiveMessage = (pkg/msg) of out ioport
      Object.keys(rowData.portOut).forEach(key => {
        rowData = formatPortData(rowData, "portOut", key);
      });
      return rowData;
    },
    [scopePorts, formatPortData]
  );

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
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
        const templateChanged = newData.template !== oldData.template;

        // Set templated port in
        if (
          // template changed
          templateChanged ||
          // or there's no previous data in the port IN
          !newData.portIn?.in
        ) {
          newData = setPortDataIn(newData);
        }

        // Set templated port out
        if (
          // template changed
          templateChanged ||
          // or there's no previous data in the port OUT
          !newData.portOut?.out
        ) {
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
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
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

  useEffect(() => {
    formatData(ioConfig);
  }, [ioConfig, formatData]);

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
    <CollapsibleHeader
      testId="section_io-configuration"
      title={t("IOConfiguration")}
      defaultExpanded={true}
    >
      <Typography
        component="div"
        className={classes.details}
        ref={tableContainerRef}
      >
        <MaterialTable
          ref={tableRef}
          columns={getColumns()}
          data={ioData}
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
