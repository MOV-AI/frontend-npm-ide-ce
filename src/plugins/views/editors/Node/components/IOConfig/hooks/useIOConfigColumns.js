import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  FormControl,
  NativeSelect,
  TextField,
  Tooltip
} from "@material-ui/core";
import { useTranslation } from "../../../../_shared/mocks";
import useSelectOptions from "./useSelectOptions";

const useStyles = makeStyles(theme => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  control: {
    fontSize: "0.875rem"
  }
}));

const useIOConfigColumns = data => {
  const { autoFocus, scopePorts, scopeSystemPortsData } = data;
  // Hooks
  const classes = useStyles();
  const { t } = useTranslation();
  const { getGroupOptions, getPackageOptions, getMessageOptions } =
    useSelectOptions({ scopeSystemPortsData, scopePorts });

  //========================================================================================
  /*                                                                                      *
   *                                 Render Sub-Components                                *
   *                                                                                      */
  //========================================================================================

  /**
   * Render selectable options
   * @param {array<{label: string, value: string}>} options
   * @returns {ReactElement} List of options available
   */
  const renderOptions = options => {
    return (
      options !== undefined &&
      options.map((option, optionIndex) => {
        return (
          <option key={optionIndex} value={option.value}>
            {option.label}
          </option>
        );
      })
    );
  };

  /**
   * @private Render port icon
   * @param {*} rowData
   * @returns {ReactElement} Element to be rendered as port icon
   */
  const renderPortIcon = rowData => {
    const inIcon = Object.keys(rowData.portIn).length ? (
      <Tooltip title="Iport">
        <i className="icon-in" style={{ fontSize: "1.5rem" }}></i>
      </Tooltip>
    ) : undefined;
    const outIcon = Object.keys(rowData.portOut).length ? (
      <Tooltip title="Oport">
        <i className="icon-out" style={{ fontSize: "1.5rem" }}></i>
      </Tooltip>
    ) : undefined;
    return (
      <>
        {inIcon}
        {outIcon}
      </>
    );
  };

  /**
   * @private Get Name edit component
   * @param {*} props : edit element props
   * @returns {ReactElement} TextField to edit name
   */
  const getNameEditComponent = props => {
    return (
      <TextField
        autoFocus={autoFocus}
        placeholder={props.columnDef.title}
        value={props.value === undefined ? "" : props.value}
        onChange={event => props.onChange(event.target.value)}
        inputProps={{
          style: {
            fontSize: 13,
            textAlign: "left"
          }
        }}
      />
    );
  };

  /**
   * @private Get Transport/Protocol edit component
   * @param {*} props : edit element props
   * @returns {ReactElement} Element to edit Transport/Protocol
   */
  const getTransportEditComponent = props => {
    /**
     * On Changte Transport / Protocol
     * @param {Event} event
     */
    const onChange = event => {
      const newData = { ...props.rowData };
      newData.template = event.target.value;

      // Autofill if only one package and message
      const packageOptions = getPackageOptions(newData);
      // If only one package
      if (packageOptions.length === 1) {
        newData.msgPackage = packageOptions[0].value;
        const messageOptions = getMessageOptions(newData);
        // If only one message
        if (messageOptions.length === 1) {
          newData.message = messageOptions[0].value;
        } else {
          newData.message = "";
        }
      } else {
        newData.msgPackage = "";
        newData.message = "";
      }
      props.onRowDataChange(newData);
    };

    // When you click edit, second column should be a selector with the Transport/Protocol
    const options = getGroupOptions(scopePorts);
    return (
      <div style={{ width: "100%" }}>
        <FormControl className={classes.formControl}>
          <NativeSelect
            className={classes.control}
            value={props.value}
            onChange={onChange}
          >
            <option value="" />
            {options.map((transport, transportIndex) => {
              return transport.options !== undefined ? (
                <optgroup key={transportIndex} label={` - ${transport.label}`}>
                  {transport.options.map((protocol, protocolIndex) => {
                    return (
                      <option key={protocolIndex} value={protocol.value}>
                        {protocol.label}
                      </option>
                    );
                  })}
                </optgroup>
              ) : (
                <option
                  key={"standalone" + transportIndex}
                  value={transport.value}
                >
                  {transport.label}
                </option>
              );
            })}
          </NativeSelect>
        </FormControl>
      </div>
    );
  };

  /**
   * @private Get Package edit component
   * @param {*} props : edit element props
   * @returns {ReactElement} Element to edit Package
   */
  const getPackageEditComponent = props => {
    /**
     * On change event for package selector
     * @param {Event} event
     */
    const onChange = event => {
      const newData = { ...props.rowData };
      newData.msgPackage = event.target.value;
      newData.message = "";
      props.onRowDataChange(newData);
    };

    // When you click edit, third column should be a selector with the Packages
    const options = getPackageOptions(props.rowData);
    return (
      <div style={{ width: "100%" }}>
        <FormControl className={classes.formControl}>
          <NativeSelect
            className={classes.control}
            value={props.value}
            onChange={onChange}
          >
            <option value="" />
            {renderOptions(options)}
          </NativeSelect>
        </FormControl>
      </div>
    );
  };

  /**
   * @private Get Message edit component
   * @param {*} props : edit element props
   * @returns {ReactElement} Element to edit Message
   */
  const getMessageEditComponent = props => {
    /**
     * On change message selector
     * @param {*} evt
     */
    const onChange = evt => {
      const newData = { ...props.rowData };
      newData.message = evt.target.value;
      props.onRowDataChange(newData);
    };

    // When you click edit, fourth column should be a selector with the Message
    const options = getMessageOptions(props.rowData);
    return (
      <div style={{ width: "100%" }}>
        <FormControl className={classes.formControl}>
          <NativeSelect
            className={classes.control}
            value={props.value}
            onChange={onChange}
          >
            <option value="" />
            {renderOptions(options)}
          </NativeSelect>
        </FormControl>
      </div>
    );
  };

  //========================================================================================
  /*                                                                                      *
   *                                    Exposed Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   *
   * @returns
   */
  const getColumns = () => {
    return [
      {
        title: "",
        field: "portType",
        render: rowData => renderPortIcon(rowData),
        editable: "never",
        width: 50
      },
      {
        title: t("Name"),
        field: "name",
        editComponent: getNameEditComponent
      },
      {
        title: t("Transport / Protocol"),
        field: "template",
        render: rowData => <div>{scopePorts[rowData?.template]?.Label}</div>, // what you see (not in edit mode)
        editComponent: getTransportEditComponent
      },
      {
        title: t("Package"),
        field: "msgPackage",
        editComponent: getPackageEditComponent
      },
      {
        title: t("Message"),
        field: "message",
        editComponent: getMessageEditComponent
      }
    ];
  };

  return { getColumns };
};

export default useIOConfigColumns;
