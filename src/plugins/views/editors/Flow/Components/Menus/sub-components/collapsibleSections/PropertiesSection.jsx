import React, { useCallback } from "react";
import PropTypes from "prop-types";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select
} from "@material-ui/core";
import { DEFAULT_FUNCTION } from "../../../../../_shared/mocks";
import { useTranslation } from "react-i18next";

const PropertiesSection = props => {
  const {
    editable,
    onChangeProperties,
    persistent,
    remappable,
    launch,
    templateData
  } = props;
  // State hooks
  const [properties, setProperties] = React.useState([]);
  // Other hooks
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * @private Get default text for properties template value
   * @param {boolean} isDefault : If option is default value
   * @returns {string} string to concatenate with label
   */
  const getDefaultText = useCallback(isDefault => {
    return isDefault ? "(default)" : "";
  }, []);

  /**
   * @private Get parameters to render in menu
   * @returns {array} Formatted parameters to render in right menu
   */
  const getProperties = useCallback(() => {
    setProperties([
      {
        title: t("Persistent"),
        value: {
          template: templateData.Persistent,
          instance: persistent
        },
        onChange: evt => onChangeProperties(evt.target.value, "Persistent"),
        options: [
          { text: t("Is persistent"), value: true },
          { text: t("Not persistent"), value: false }
        ]
      },
      {
        title: t("Remappable"),
        value: {
          template: templateData.Remappable,
          instance: remappable
        },
        onChange: evt => onChangeProperties(evt.target.value, "Remappable"),
        options: [
          { text: t("Is remappable"), value: true },
          { text: t("Not remappable"), value: false }
        ]
      },
      {
        title: t("Launch"),
        value: {
          template: templateData.Launch,
          instance: launch
        },
        onChange: evt => onChangeProperties(evt.target.value, "Launch"),
        options: [
          { text: t("To launch"), value: true },
          { text: t("Not to launch"), value: false }
        ]
      }
    ]);
  }, [
    launch,
    persistent,
    remappable,
    t,
    onChangeProperties,
    templateData.Launch,
    templateData.Persistent,
    templateData.Remappable
  ]);

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    getProperties();
  }, [getProperties]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return properties.map((item, index) => {
    const itemValue =
      typeof item.value.instance === "boolean"
        ? item.value.instance
        : item.value.template ?? false;
    return (
      <Grid
        key={"properties-item-" + index}
        item
        xs={12}
        style={{ textAlign: "left" }}
      >
        <FormControl fullWidth={true}>
          <InputLabel>{item.title}</InputLabel>
          <Select
            value={itemValue.toString()}
            onChange={item.onChange}
            disabled={!editable}
          >
            {item.options.map((option, optIndex) => {
              return (
                <MenuItem
                  key={"properties-options-" + optIndex}
                  value={option.value}
                >
                  {`${option.text} ${getDefaultText(
                    option.value === item.value.template
                  )}`}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
    );
  });
};

PropertiesSection.propTypes = {
  editable: PropTypes.bool,
  onChangeProperties: PropTypes.func,
  persistent: PropTypes.bool,
  remappable: PropTypes.bool,
  launch: PropTypes.bool,
  templateData: PropTypes.object
};

PropertiesSection.defaultProps = {
  editable: false,
  templateData: {},
  onChangeProperties: () => DEFAULT_FUNCTION("onChangeProperties")
};

export default PropertiesSection;
