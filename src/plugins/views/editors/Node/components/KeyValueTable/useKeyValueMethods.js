import React from "react";
import _toString from "lodash/toString";
import InfoLogo from "@material-ui/icons/Info";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { MonacoCodeEditor } from "@mov-ai/mov-fe-lib-code-editor";
import { useTranslation } from "../../../_shared/mocks";
import { HtmlTooltip } from "../_shared/HtmlTooltip";

const useStyles = makeStyles(theme => ({
  logo: {
    margin: "2px",
    padding: "0px"
  },
  codeContainer: {
    height: "200px",
    width: "100%"
  }
}));

const useKeyValueMethods = () => {
  // Hooks
  const classes = useStyles();
  const theme = useTheme();
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
          <React.Fragment>
            <Typography color="inherit" component="h3">
              <b>{rowData.name}</b>
            </Typography>
            <p>{rowData.description}</p>
          </React.Fragment>
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
    if (rowData.type === "string") return JSON.stringify(rowData.value);
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
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden"
        }
      }
    ];
  };

  /**
   * Render default value editor in Monaco code editor
   * @param {string} value : Value
   * @param {{disabled: boolean, onChange: function, isNew: boolean}} props
   * @returns
   */
  const renderValueEditor = (value, props) => {
    const { disabled, onChange, isNew } = props;
    return (
      <Typography component="div" className={classes.codeContainer}>
        <MonacoCodeEditor
          value={_toString(value)}
          onLoad={editor => {
            if (!isNew) editor.focus();
          }}
          language="python"
          theme={theme.codeEditor.theme}
          options={{ readOnly: disabled }}
          onChange={newValue => onChange(newValue)}
        />
      </Typography>
    );
  };

  return { getColumns, renderValueEditor };
};

export default useKeyValueMethods;
