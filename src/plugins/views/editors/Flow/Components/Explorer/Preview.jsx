import React, { useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Factory from "../Nodes/Factory";
import { generateContainerId } from "../../Constants/constants";
import { previewStyles } from "./styles";

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
    (name, scope) => {
      if (!name || !scope) return;
      const factoryOutput = {
        Node: Factory.OUTPUT.PREV_NODE,
        Flow: Factory.OUTPUT.PREV_FLOW
      };
      // Add temp node
      Factory.create(call, factoryOutput[scope], {
        canvas: {
          containerId: generateContainerId(flowId),
          setMode: () => {
            /* empty */
          }
        },
        node: {
          Template: name
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
    renderNodePreview(node.name, node.scope);
  }, [node.name, node.scope, renderNodePreview]);

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
