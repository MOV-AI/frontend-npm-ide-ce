import React from "react";
import PropTypes from "prop-types";
import { useROS } from "../../../../api/ROS/ROS";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "column",
    padding: 6,
    height: "100%"
  },
  list: {
    // flexGrow: 1,
    overflowY: "auto",
    minHeight: 40,
    padding: "0px 6px 6px 6px"
  }
}));

const RDebugNodeMenu = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { getNodeDetails, nodeDetails, isConnected } = useROS();
  const { nodeInst } = props;

  /* eslint-disable react-hooks/exhaustive-deps */
  React.useEffect(() => {
    getNodeDetails(`/${nodeInst.NodeLabel}`);
  }, [nodeInst]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const getList = (list, title) => (
    <>
      <Typography variant="h6">{title}</Typography>
      <div className={classes.list}>
        {!!list.length ? (
          list.map(element => (
            <Typography color="textSecondary" key={element}>
              {element}
            </Typography>
          ))
        ) : (
          <Typography color="textSecondary" key={`noList-${title}`}>
            {t("no data")}
          </Typography>
        )}
      </div>
    </>
  );

  return isConnected ? (
    <div className={classes.container}>
      {getList(nodeDetails?.publishing || [], "Publishers:")}
      {getList(nodeDetails?.subscribing || [], "Subscribers:")}
      {getList(nodeDetails?.services || [], "Services:")}
    </div>
  ) : (
    <div className={classes.container}>
      {t("Not connected, make sure rosbridge is running")}
    </div>
  );
};

RDebugNodeMenu.propTypes = {
  nodeInst: PropTypes.object.isRequired,
  editable: PropTypes.bool
};

RDebugNodeMenu.defaultProps = {
  editable: true
};

export default RDebugNodeMenu;
