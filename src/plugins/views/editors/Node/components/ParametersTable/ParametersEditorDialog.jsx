import React, { useCallback, forwardRef } from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@material-ui/core";
import { withTheme } from "../../../../../../decorators/withTheme";
import withAlerts from "../../../../../../decorators/withAlerts";
import KeyValueEditorDialog from "../KeyValueTable/KeyValueEditorDialog";
import useDataTypes from "./DataTypes/hooks/useDataTypes";

const ParameterEditorDialog = forwardRef((props, ref) => {
  const { alert, alertSeverities } = props;
  // Hooks
  const [data, setData] = React.useState({});
  const { getDataTypes, getLabel, getEditComponent, getValidValue, validate } =
    useDataTypes();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methdos                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Stringify value if type string
   * @param {{type: string, value: *}} formData
   * @returns {*} Formatted value
   */
  const valueToRender = formData => {
    const type = formData.type;
    return type === "string" ? JSON.stringify(formData.value) : formData.value;
  };

  /**
   * @private Parse value if type string
   * @param {{type: string, value: *}} formData
   * @returns {*} Formatted value
   */
  const valueToSave = formData => {
    const type = formData.type;
    return type === "string" ? JSON.parse(formData.value) : formData.value;
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Component Methods                                  *
   *                                                                                      */
  //========================================================================================
  /**
   * Validate form data to submit
   * @param {*} formData
   * @returns
   */
  const onValidate = formData => {
    const dataToValidate = {
      ...formData,
      value: data.value,
      type: data.type
    };
    return validate(dataToValidate)
      .then(res => {
        if (!res.success)
          throw new Error(res.error || "Data validation failed");
        // Prepare data to submit
        if (res.parsed) data.value = res.parsed.toString();
        const dataToSubmit = {
          ...dataToValidate,
          value: valueToSave(data)
        };
        return { ...res, data: dataToSubmit };
      })
      .catch(err => {
        alert({ message: err.message, severity: alertSeverities.ERROR });
        return err;
      });
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Component Handlers                                 *
   *                                                                                      */
  //========================================================================================
  /**
   * Handle Type Select onChange Event
   * @param {*} evt
   * @returns
   */
  const handleTypeChange = useCallback(
    evt => {
      const type = evt?.target?.value;

      getValidValue(type, data.value).then(newValue => {
        setData(prevState => {
          return {
            ...prevState,
            type,
            value: newValue ?? prevState.value
          };
        });
      });
    },
    [data, getValidValue]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    setData({ ...props.data, value: valueToRender(props.data) });
  }, [props.data]);

  //========================================================================================
  /*                                                                                      *
   *                                    Render Methods                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Render Data Type Selector
   * @returns {ReactComponent} Form control with data type selector
   */
  const renderTypeSelector = useCallback(() => {
    return (
      <FormControl style={{ marginTop: 15 }}>
        <InputLabel>Type *</InputLabel>
        <Select
          fullWidth
          value={data.type || "any"}
          onChange={handleTypeChange}
        >
          {getDataTypes().map(key => (
            <MenuItem key={key} value={key}>
              {getLabel(key)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }, [data, getDataTypes, getLabel, handleTypeChange]);

  /**
   * Render Value Editor Component
   */
  const renderValueEditor = useCallback(() => {
    const editComponent = getEditComponent(data.type);
    if (!editComponent) return <></>;
    return getEditComponent(data.type)(
      {
        rowData: { value: data.value },
        onChange: _value => {
          setData(prevState => {
            return { ...prevState, value: _value };
          });
        },
        isNew: props.isNew
      },
      "dialog"
    );
  }, [getEditComponent, data, props.isNew]);

  return (
    <KeyValueEditorDialog
      {...props}
      validate={onValidate}
      renderValueEditor={renderValueEditor}
      renderCustomContent={renderTypeSelector}
    />
  );
});

export default withAlerts(withTheme(ParameterEditorDialog));
