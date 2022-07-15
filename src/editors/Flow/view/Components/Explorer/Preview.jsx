import React, { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Factory from "../Nodes/Factory";
import { generateContainerId } from "../../Constants/constants";
import { previewStyles } from "./styles";

const Preview = props => {
  const { flowId, node, call } = props;
  const classes = previewStyles();
  const { t } = useTranslation();
  const containerId = useRef(`preview_${generateContainerId(flowId)}`);
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
          containerId: containerId.current,
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
          d3.select(obj.el)
            .append("svg:defs")
            .append("filter")
            .attr("id", `shadow-${containerId.current}`)
            .append("feDropShadow")
            .attr("dx", "1.5")
            .attr("dy", "1.5")
            .attr("stdDeviation", "1");
          svg.current.appendChild(obj.el);
        }
      });
    },
    [call]
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
        <div id={containerId.current} ref={svg}></div>
      ) : (
        <p>{t("PreviewHelperText")}</p>
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
