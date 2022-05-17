import React from "react";
import { useTranslation } from "react-i18next";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { LINK_DEPENDENCY } from "../../../../../../utils/Constants";

import { dependencyInfoStyles } from "./styles";

const DependencyInfo = () => {
  // Translation hook
  const { t } = useTranslation();
  // Style hook
  const classes = dependencyInfoStyles();

  return (
    <Card className={classes.root}>
      <CardContent>
        <h3>{t("DependencyInfoTitle")}</h3>
        {Object.values(LINK_DEPENDENCY).map(dep => {
          return (
            <div className={classes.infoContainer}>
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
