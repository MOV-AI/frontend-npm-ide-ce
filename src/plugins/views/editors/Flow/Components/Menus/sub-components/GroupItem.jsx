import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Typography, IconButton, Tooltip } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/DeleteOutline";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import { groupItemStyles } from "../styles";

const GroupItem = ({
  item: { id, name, enabled },
  editable,
  model,
  editGroupName,
  handleGroupVisibility
}) => {
  const classes = groupItemStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handler to Toggle Group visibility
   */
  const handleGroupActive = useCallback(() => {
    handleGroupVisibility(id, enabled);
    model.current.toggleGroupVisibility(id, !enabled);
  }, [model, enabled, id, handleGroupVisibility]);

  /**
   * Handler to Edit this Group (right now we're only able to edit the name)
   */
  const handleGroupEdit = useCallback(() => {
    editGroupName(
      newName => model.current.editGroup(id, { name: newName }),
      name
    );
  }, [model, name, id, editGroupName]);

  /**
   * Handler to Delete this Group
   */
  const handleGroupDelete = useCallback(() => {
    model.current.deleteGroup(id);
  }, [model, id]);

  return (
    <Typography component="div" className={classes.groupRow}>
      <Tooltip title={name}>
        <Typography
          component="div"
          className={`${classes.itemValue} ${classes.groupItem}`}
        >
          {name}
        </Typography>
      </Tooltip>
      <IconButton onClick={handleGroupActive}>
        {enabled && (
          <VisibilityIcon fontSize="small" color="primary"></VisibilityIcon>
        )}
        {!enabled && (
          <VisibilityOffIcon
            fontSize="small"
            color="disabled"
          ></VisibilityOffIcon>
        )}
      </IconButton>
      {editable && (
        <Tooltip title={t("EditGroup")}>
          <IconButton onClick={handleGroupEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {editable && (
        <Tooltip title={t("DeleteGroup")}>
          <IconButton onClick={handleGroupDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Typography>
  );
};

GroupItem.propTypes = {
  model: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  editGroupName: PropTypes.func.isRequired,
  editable: PropTypes.bool
};

export default GroupItem;
