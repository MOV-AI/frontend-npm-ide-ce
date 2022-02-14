import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { IconButton, Tooltip, Typography } from "@material-ui/core";
import LayersIcon from "@material-ui/icons/Layers";
import LayersClearIcon from "@material-ui/icons/LayersClear";

import { nodeGroupStyles } from "../../styles";

const NodeGroupSection = props => {
  const { nodeGroups, flowGroups, handleBelongGroup } = props;
  // State hooks
  const [groups, setGroups] = React.useState([]);
  // Other hooks
  const classes = nodeGroupStyles();
  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    setGroups(Object.values(flowGroups));
  }, [flowGroups]);

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return groups.length ? (
    <Typography component="div" className={classes.parametersContainer}>
      {groups.map(group => {
        const key = group.id;
        const groupName = group.name;
        const checked = nodeGroups.includes(key);
        return (
          <Typography component="div" className={classes.groupRow} key={key}>
            <Tooltip title={groupName}>
              <Typography
                component="div"
                className={`${classes.itemValue} ${classes.groupItem}`}
              >
                {groupName}
              </Typography>
            </Tooltip>
            <IconButton onClick={() => handleBelongGroup(key, !checked)}>
              {checked && <LayersIcon fontSize="small" color="primary" />}
              {!checked && (
                <LayersClearIcon fontSize="small" color="disabled" />
              )}
            </IconButton>
          </Typography>
        );
      })}
    </Typography>
  ) : (
    <Typography className={`${classes.itemValue} ${classes.disabled}`}>
      {t("No groups")}
    </Typography>
  );
};

NodeGroupSection.propTypes = {
  handleBelongGroup: PropTypes.func.isRequired,
  nodeGroups: PropTypes.array,
  flowGroups: PropTypes.object
};

NodeGroupSection.defaultProps = {
  nodeGroups: [],
  flowGroups: {}
};

export default NodeGroupSection;
