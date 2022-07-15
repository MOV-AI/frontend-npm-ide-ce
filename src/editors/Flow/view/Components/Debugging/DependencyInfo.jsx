import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { LINK_DEPENDENCY } from "../../../../../utils/Constants";

import { dependencyInfoStyles } from "./styles";

const DependencyInfo = () => {
  const [minified, setMinified] = useState(false);

  // Translation hook
  const { t } = useTranslation();
  // Style hook
  const classes = dependencyInfoStyles();

  const toggleMinify = useCallback(() => {
    setMinified(prevState => !prevState);
  }, []);

  return (
    <Card
      data-testid="section_dependency-info"
      className={`${classes.root} ${minified ? "minified" : ""}`}
    >
      <CardContent data-testid="input_minify-toggle" onClick={toggleMinify}>
        <h3>
          {minified
            ? t("MinifiedDependencyInfoTitle")
            : t("DependencyInfoTitle")}
          <ArrowDropDownIcon />
        </h3>
        {Object.values(LINK_DEPENDENCY).map((dep, i) => {
          return (
            <div key={`${dep.LABEL}_${i}`} className={classes.infoContainer}>
              <p>{t(dep.LABEL)}</p>
              <div
                className={classes.colorChip}
                style={{ backgroundColor: dep.COLOR }}
              ></div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default DependencyInfo;
