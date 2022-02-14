import React from "react";
import PropTypes from "prop-types";
import { ListItem, ListItemText, Typography } from "@material-ui/core";
import NodeLink from "./NodeLink";
import { DEFAULT_FUNCTION, useTranslation } from "../../../../_shared/mocks";

import { menuDetailsStyles } from "../styles";

const MenuDetails = props => {
  // Props
  const { id, template, model, type, openDoc } = props;
  // Other hooks
  const classes = menuDetailsStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <>
      <h2 className={classes.header}>{id}</h2>
      <ListItem divider>
        <ListItemText primary={t("Name:")} />
        <NodeLink name={template} scope={model} openDoc={openDoc}>
          {template}
        </NodeLink>
      </ListItem>
      <ListItem divider>
        <ListItemText primary={t("Scope:")} />
        <Typography>{model}</Typography>
      </ListItem>
      <ListItem divider>
        <ListItemText primary={t("Type:")} />
        <Typography>{type}</Typography>
      </ListItem>
    </>
  );
};

MenuDetails.propTypes = {
  id: PropTypes.string,
  template: PropTypes.string,
  model: PropTypes.string,
  type: PropTypes.string,
  openDoc: PropTypes.func
};

MenuDetails.defaultProps = {
  id: "",
  template: "-",
  model: "-",
  type: "-",
  openDoc: () => DEFAULT_FUNCTION("openDoc")
};

export default MenuDetails;
