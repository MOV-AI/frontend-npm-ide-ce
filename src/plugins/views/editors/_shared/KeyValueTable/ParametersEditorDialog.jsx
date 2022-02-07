import React, { useCallback, forwardRef } from "react";
import PropTypes from "prop-types";
import { MenuItem, Select, FormControl, InputLabel } from "@material-ui/core";
import { withTheme } from "../../../../../decorators/withTheme";
import withAlerts from "../../../../../decorators/withAlerts";
import KeyValueEditorDialog from "../KeyValueTable/KeyValueEditorDialog";
import useDataTypes from "../hooks/useDataTypes";

const ParameterEditorDialog = forwardRef((props, ref) => {
  const {
    isNew,
    disableType,
    customValidation,
    preventRenderType,
    alert,
    alertSeverities
  } = props;
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
    return formData?.type === "string"
      ? JSON.stringify(formData.value)
      : formData.value;
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
  const onValidate = useCallback(
    formData => {
      const dataToValidate = {
        ...formData,
        value: data.value,
        type: data.type
      };
      if (customValidation) return customValidation(dataToValidate);

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
    },
    [data, alertSeverities.ERROR, alert, validate, customValidation]
  );

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
    if (preventRenderType) return null;
    return (
      <FormControl style={{ marginTop: 15 }}>
        <InputLabel>Type *</InputLabel>
        <Select
          fullWidth
          value={data.type || "any"}
          onChange={handleTypeChange}
          disabled={disableType}
        >
          {getDataTypes().map(key => (
            <MenuItem key={key} value={key}>
              {getLabel(key)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }, [
    data,
    preventRenderType,
    disableType,
    getDataTypes,
    getLabel,
    handleTypeChange
  ]);

  /**
   * Render Value Editor Component
   */
  const renderValueEditor = useCallback(
    (defaultValue, options) => {
      const editComponent = getEditComponent(data.type);
      if (!editComponent) return <></>;
      return getEditComponent(data.type)(
        {
          ...options,
          rowData: { value: options.isDefault ? defaultValue : data.value },
          onChange: _value => {
            setData(prevState => {
              return { ...prevState, value: _value };
            });
          },
          isNew: options.isNew ?? isNew
        },
        "dialog"
      );
    },
    [data, isNew, getEditComponent]
  );

  return (
    <KeyValueEditorDialog
      {...props}
      validate={onValidate}
      renderValueEditor={renderValueEditor}
      renderCustomContent={renderTypeSelector}
    />
  );
});

ParameterEditorDialog.propTypes = {
  data: PropTypes.object.isRequired,
  isNew: PropTypes.bool,
  disableType: PropTypes.bool,
  customValidation: PropTypes.func,
  preventRenderType: PropTypes.bool,
  alert: PropTypes.func,
  alertSeverities: PropTypes.object
};

export default withAlerts(withTheme(ParameterEditorDialog));
