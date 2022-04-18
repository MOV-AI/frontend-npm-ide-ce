import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import {
  MenuItem,
  Select,
  FormControl,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup
} from "@material-ui/core";
import { withTheme } from "../../../../../decorators/withTheme";
import { ERROR_MESSAGES } from "../../../../../utils/Messages";
import {
  DATA_TYPES,
  DISABLED_VALUE,
  ALERT_SEVERITIES
} from "../../../../../utils/Constants";
import withAlerts from "../../../../../decorators/withAlerts";
import KeyValueEditorDialog from "../KeyValueTable/KeyValueEditorDialog";
import useDataTypes from "../hooks/useDataTypes";

import { parametersDialogStyles } from "./styles";

const VALUE_OPTIONS = {
  CUSTOM: "custom",
  DEFAULT: "default",
  DISABLED: "disabled"
};

const ParameterEditorDialog = props => {
  const {
    isNew,
    disableType,
    customValidation,
    preventRenderType,
    showValueOptions,
    alert
  } = props;

  // Hooks
  const [data, setData] = useState({});
  const [valueOption, setValueOption] = useState(VALUE_OPTIONS.DEFAULT);
  const { t } = useTranslation();
  const classes = parametersDialogStyles();
  const { getDataTypes, getLabel, getEditComponent, getValidValue, validate } =
    useDataTypes();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methdos                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Renders a value related to to it's type
   * @param {*} value : value to be rendered
   */
  const renderValue = useCallback(
    value => {
      if (props.data.type === DATA_TYPES.STRING) {
        return `"${value}"`;
      }

      return value;
    },
    [props.data.type]
  );

  /**
   * Get Default Value Option
   * @param {*} defaultValue : Default value to check
   * @param {*} value : Value to check
   */
  const getValueOption = useCallback(value => {
    let result = VALUE_OPTIONS.CUSTOM;

    if (value === DISABLED_VALUE) {
      result = VALUE_OPTIONS.DISABLED;
    }
    if (value === "") {
      result = VALUE_OPTIONS.DEFAULT;
    }

    return result;
  }, []);

  /**
   * @private Stringify value if type string
   * @param {{type: string, value: *}} formData
   * @returns {*} Formatted value
   */
  const valueToRender = useCallback(formData => {
    const formValue = formData.value || formData.defaultValue;
    return formData?.type === DATA_TYPES.STRING
      ? JSON.stringify(formValue)
      : formValue;
  }, []);

  /**
   * @private Parse value if type string
   * @param {{type: string, value: *}} formData
   * @returns {*} Formatted value
   */
  const valueToSave = useCallback(
    formData => {
      const type = formData.type;

      if (showValueOptions) {
        if (valueOption === VALUE_OPTIONS.DEFAULT) {
          return "";
        }
        if (valueOption === VALUE_OPTIONS.DISABLED) {
          return DISABLED_VALUE;
        }
      }

      return type === DATA_TYPES.STRING
        ? JSON.parse(formData.value)
        : formData.value;
    },
    [showValueOptions, valueOption]
  );

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
        value:
          showValueOptions && valueOption === VALUE_OPTIONS.DEFAULT
            ? ""
            : data.value,
        type: data.type
      };

      if (customValidation) return customValidation(dataToValidate);

      return validate(dataToValidate)
        .then(res => {
          if (!res.success)
            throw new Error(
              t(res.error) || t(ERROR_MESSAGES.DATA_VALIDATION_FAILED)
            );
          // Prepare data to submit
          if (res.parsed) data.value = res.parsed.toString();
          const dataToSubmit = {
            ...dataToValidate,
            value: valueToSave(data)
          };
          return { ...res, data: dataToSubmit };
        })
        .catch(err => {
          alert({ message: err.message, severity: ALERT_SEVERITIES.ERROR });
          return err;
        });
    },
    [
      showValueOptions,
      valueOption,
      data,
      alert,
      validate,
      valueToSave,
      customValidation,
      t
    ]
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

  /**
   * Handle Value Option onChange Event
   * @param {*} evt
   */
  const handleChangeValueOption = useCallback(
    evt => {
      const opt = evt.target.value;
      setData(prevState => {
        if (opt === VALUE_OPTIONS.DISABLED) {
          return { ...prevState, value: DISABLED_VALUE };
        }
        if (opt === VALUE_OPTIONS.DEFAULT || opt === VALUE_OPTIONS.CUSTOM) {
          return { ...prevState, value: renderValue(props.data.defaultValue) };
        }
        return prevState;
      });

      setValueOption(opt);
    },
    [props.data.defaultValue, renderValue]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    if (showValueOptions) setValueOption(getValueOption(props.data.value));

    setData({ ...props.data, value: valueToRender(props.data) });
  }, [props.data, showValueOptions, valueToRender, getValueOption]);

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
      <FormControl className={classes.marginTop}>
        <InputLabel>{`${t("Type")} *`}</InputLabel>
        <Select
          fullWidth
          value={data.type || DATA_TYPES.ANY}
          onChange={handleTypeChange}
          disabled={disableType}
          inputProps={{ "data-testid": "input_type" }}
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
    classes,
    data,
    preventRenderType,
    disableType,
    getDataTypes,
    getLabel,
    handleTypeChange,
    t
  ]);

  const renderValueOptions = useCallback(() => {
    return (
      <FormControl component="fieldset">
        <RadioGroup
          data-testid="section_value-option"
          value={valueOption}
          onChange={handleChangeValueOption}
          className={classes.valueOptions}
        >
          <FormControlLabel
            value={VALUE_OPTIONS.CUSTOM}
            control={<Radio inputProps={{ "data-testid": "input_custom" }} />}
            label={t("UseCustomValue")}
          />
          <FormControlLabel
            value={VALUE_OPTIONS.DEFAULT}
            control={<Radio inputProps={{ "data-testid": "input_default" }} />}
            label={t("UseDefaultValue")}
          />
          <FormControlLabel
            value={VALUE_OPTIONS.DISABLED}
            control={<Radio inputProps={{ "data-testid": "input_disabled" }} />}
            label={t("DisableParamType", {
              paramType: data.paramType || t("Value")
            })}
          />
        </RadioGroup>
      </FormControl>
    );
  }, [data.paramType, valueOption, classes, handleChangeValueOption, t]);

  /**
   * Render Value Editor Component
   */
  const renderValueEditor = useCallback(
    (defaultValue, options) => {
      const editComponent = getEditComponent(data.type);
      if (!editComponent) return <></>;
      return (
        <>
          {!options.isDefault && showValueOptions && renderValueOptions()}
          {!options.isDefault && valueOption === VALUE_OPTIONS.DISABLED ? (
            <p className={classes.disabledValue}>
              {t("DisabledParamType", {
                paramType: data.paramType || t("Value")
              })}
            </p>
          ) : (
            getEditComponent(data.type)(
              {
                rowData: {
                  value: options.isDefault
                    ? renderValue(defaultValue)
                    : data.value
                },
                onChange: _value => {
                  if (
                    valueOption !== VALUE_OPTIONS.CUSTOM &&
                    renderValue(options.defaultValue) !== _value
                  ) {
                    setValueOption(VALUE_OPTIONS.CUSTOM);
                  }
                  setData(prevState => {
                    return { ...prevState, value: _value };
                  });
                },
                disabled: options.disabled,
                isNew: options.isNew ?? isNew
              },
              "dialog"
            )
          )}
        </>
      );
    },
    [
      valueOption,
      showValueOptions,
      data,
      isNew,
      classes,
      renderValueOptions,
      renderValue,
      getEditComponent,
      t
    ]
  );

  return (
    <KeyValueEditorDialog
      {...props}
      validate={onValidate}
      renderValueEditor={renderValueEditor}
      renderCustomContent={renderTypeSelector}
    />
  );
};

ParameterEditorDialog.propTypes = {
  data: PropTypes.object.isRequired,
  isNew: PropTypes.bool,
  disableType: PropTypes.bool,
  preventRenderType: PropTypes.bool,
  showValueOptions: PropTypes.bool,
  customValidation: PropTypes.func,
  alert: PropTypes.func
};

export default withAlerts(withTheme(ParameterEditorDialog));
