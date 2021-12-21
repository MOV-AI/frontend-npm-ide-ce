import React, { useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { MTableToolbar, MTableEditRow } from "material-table";
import MaterialTable from "../../../_shared/MaterialTable/MaterialTable";
import IOPorts from "./IOPorts/IOPorts";
import CollapsibleHeader from "../_shared/CollapsibleHeader";
import { Typography } from "@material-ui/core";
import { useTranslation } from "../../../_shared/mocks";
import useIOConfigColumns from "./hooks/useIOConfigColumns";

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
    autoFocus,
    editable
  } = props;

  // State hooks
  const [scopePorts, setScopePorts] = React.useState({});
  const [scopeSystemPortsData, setScopeSystemPortsData] = React.useState({});

  // Other hooks
  const classes = useStyles();
  const { t } = useTranslation();
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
   * Format data : Convert object in array to be rendered in Material Table
   * @param {*} _data : Raw data (can be an object of objects)
   * @returns {array} Formatted data
   */
  const formatData = _data => {
    if (Array.isArray(_data)) return _data;
    return Object.keys(_data).map(key => ({
      name: _data[key].name,
      ..._data[key]
    }));
  };

  /**
   * Update lock rows : Add fade out effect to detail panel when editing table
   * @returns
   */
  const updateLockRows = () => {
    if (!tableRef.current) return;
    if (
      tableRef?.current?.dataManager.lastEditingRow ||
      tableContainerRef?.current?.querySelector("tr[mode='add']")
    ) {
      tableContainerRef?.current?.classList.add("editing");
    } else {
      tableContainerRef?.current?.classList.remove("editing");
    }
  };

  //========================================================================================
  /*                                                                                      *
   *                                      Edit Events                                     *
   *                                                                                      */
  //========================================================================================

  /**
   *
   * @param {*} newData
   * @returns
   */
  const handleRowAdd = useCallback(
    newData => {
      return new Promise((resolve, reject) => {
        onIOConfigRowSet(newData, resolve, reject);
      });
    },
    [onIOConfigRowSet]
  );

  /**
   *
   * @param {*} newData
   * @param {*} oldData
   * @returns
   */
  const handleRowUpdate = useCallback(
    (newData, oldData) => {
      return new Promise((resolve, reject) => {
        onIOConfigRowSet(newData, resolve, reject, oldData);
      });
    },
    [onIOConfigRowSet]
  );

  /**
   *
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
   *
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
   *
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
          detailPanel={panelData => {
            return (
              <IOPorts
                classNames="child-row"
                editable={editable}
                rowData={panelData.rowData}
                handleIOPortsInputs={handleIOPortsInputs}
                handleOpenCallback={handleOpenCallback}
                handleOpenSelectScopeModal={handleOpenSelectScopeModal}
              />
            );
          }}
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
  ioConfig: PropTypes.array,
  scopePorts: PropTypes.object,
  scopePortsData: PropTypes.object,
  onIOConfigRowSet: PropTypes.func,
  onIOConfigRowDelete: PropTypes.func,
  editable: PropTypes.bool
};

IOConfig.defaultProps = {
  editable: true,
  ioConfig: [
    {
      name: "undefined",
      Template: "undefined",
      Package: "undefined",
      Message: "undefined",
      ioports: [
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
  ],
  scopePorts: {
    "ROS1/Subscriber": {},
    "ROS1/Publisher": {},
    "MovAi/Widget": {}
  },
  scopeSystemPortsData: {
    ROS1_action: {},
    ROS1_msg: {},
    ROS1_srv: {}
  }
};

export default IOConfig;
