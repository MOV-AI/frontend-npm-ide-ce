import React from "react";
import { useTranslation } from "react-i18next";
import InfoLogo from "@material-ui/icons/Info";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { DATA_TYPES } from "../../../../../../utils/Constants";
import { HtmlTooltip } from "../../../_shared/HtmlTooltip/HtmlTooltip";

import { keyValueHookStyles } from "./styles";

const useKeyValueMethods = () => {
  // Hooks
  const classes = keyValueHookStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                 Render sub-components                                *
   *                                                                                      */
  //========================================================================================

  const renderInfoIcon = rowData => {
    return (
      <HtmlTooltip
        title={
          <>
            <Typography color="inherit" component="h3">
              <b>{rowData.name}</b>
            </Typography>
            <p>{rowData.description}</p>
          </>
        }
      >
        <IconButton className={classes.logo}>
          <InfoLogo />
        </IconButton>
      </HtmlTooltip>
    );
  };

  /**
   * Render of Value column
   * @param {*} rowData
   * @returns Row value column
   */
  const renderValue = rowData => {
    if (rowData.type === DATA_TYPES.STRING)
      return JSON.stringify(rowData.value);
    return rowData.value;
  };

  //========================================================================================
  /*                                                                                      *
   *                                   Exported methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Get table columns definitions
   *  Info  : Tooltip with name and description
   *  Name  : Key name
   *  Value : Key value
   * @returns {array} Table columns
   */
  const getColumns = () => {
    return [
      {
        title: "",
        field: "description",
        width: "5%",
        cellStyle: { padding: "10px", textAlign: "start" },
        sorting: false,
        render: renderInfoIcon
      },
      {
        title: t("Name"),
        field: "name",
        width: "45%",
        defaultSort: "asc",
        cellStyle: {
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden"
        }
      },
      {
        title: t("Value"),
        field: "value",
        render: renderValue,
        width: "45%",
        cellStyle: {
          maxWidth: 200,
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden"
        }
      }
    ];
  };

  return { getColumns };
};

export default useKeyValueMethods;
