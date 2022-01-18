import React from "react";
import styles from "../styles";
import { makeStyles } from "@material-ui/styles";
import { Link } from "@material-ui/core";

const useStyles = makeStyles(styles);

/**
 * Node Link Component
 * @param {*} props: Component props
 * @returns {ReactElement}
 */
const NodeLink = props => {
  const { scope, name, openDoc, children } = props;
  const classes = useStyles();

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * On click link : open document
   * @param {Event} event : Click event
   */
  const onClickLink = React.useCallback(
    event => {
      openDoc({
        name,
        scope,
        ctrlKey: event.ctrlKey
      });
    },
    [openDoc, name, scope]
  );

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  return (
    <Link component="button" className={classes.link} onClick={onClickLink}>
      {children}
    </Link>
  );
};

export default NodeLink;
