import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

import PropertyItem from "./PropertyItem";

const PropertiesSection = ({
  editable,
  onChangeProperties,
  templateData,
  nodeInstance
}) => {
  const { t } = useTranslation();
  const properties = useMemo(
    () => ({
      persistent: {
        title: t("Persistent"),
        options: [
          { text: t("IsPersistent"), value: true },
          { text: t("NotPersistent"), value: false }
        ]
      },
      remappable: {
        title: t("Remappable"),
        options: [
          { text: t("IsRemappable"), value: true },
          { text: t("NotRemappable"), value: false }
        ]
      },
      launch: {
        title: t("Launch"),
        options: [
          { text: t("ToLaunch"), value: true },
          { text: t("NotToLaunch"), value: false }
        ]
      }
    }),
    [t]
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return Object.entries(properties).map(([key, item]) => (
    <PropertyItem
      key={"properties-item-" + key}
      title={item.title}
      options={item.options}
      name={key}
      value={nodeInstance[key]}
      templateValue={templateData[key]}
      editable={editable}
      onChangeProperties={onChangeProperties}
    />
  ));
};

PropertiesSection.propTypes = {
  templateData: PropTypes.object.isRequired,
  nodeInstance: PropTypes.object.isRequired,
  onChangeProperties: PropTypes.func.isRequired,
  editable: PropTypes.bool
};

PropertiesSection.defaultProps = {
  editable: false
};

export default PropertiesSection;
