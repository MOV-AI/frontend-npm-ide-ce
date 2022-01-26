import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Factory from "../Nodes/Factory";
import { generateContentId } from "../../Constants/constants";
import { previewStyles } from "./styles";
import { useCallback } from "react";

const Preview = props => {
  const { flowId, node, call } = props;
  const classes = previewStyles();
  const { t } = useTranslation();
  const svg = useRef(null);

  //========================================================================================
  /*                                                                                      *
   *                                   Component Methods                                  *
   *                                                                                      */
  //========================================================================================

  /**
   * Render the Node and add it to the svg
   */
  const renderNodePreview = useCallback(
    nodeName => {
      if (!nodeName) return;
      // Add temp node
      Factory.create(call, Factory.OUTPUT.PREV_NODE, {
        canvas: {
          containerId: generateContentId(flowId),
          setMode: () => {}
        },
        node: {
          Template: nodeName
        },
        events: {}
      }).then(obj => {
        if (svg.current) {
          svg.current.innerHTML = "";
          svg.current.appendChild(obj.el);
        }
      });
    },
    [flowId, call]
  );

  //========================================================================================
  /*                                                                                      *
   *                                    React Lifecycle                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Renders Node Preview when node.name changes
   */
  useEffect(() => {
    renderNodePreview(node.name);
  }, [node.name, call, renderNodePreview]);

  return (
    <div className={classes.previewHolder}>
      {!node.children && node.name ? (
        <div ref={svg}></div>
      ) : (
        <p>{t("Hover a node to see more information")}</p>
      )}
    </div>
  );
};

export default Preview;

Preview.propTypes = {
  flowId: PropTypes.string,
  node: PropTypes.object,
  call: PropTypes.func
};
