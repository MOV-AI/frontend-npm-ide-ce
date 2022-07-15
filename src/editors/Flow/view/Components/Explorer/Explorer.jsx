import React, { useCallback, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Typography } from "@material-ui/core";
import ListItemsTreeWithSearch, {
  toggleExpandRow
} from "./../../../../../plugins/views/Explorer/components/ListItemTree/ListItemsTreeWithSearch";
import { withViewPlugin } from "../../../../../engine/ReactPlugin/ViewReactPlugin";
import { PLUGINS } from "../../../../../utils/Constants";
import Preview from "./Preview";

import { explorerStyles } from "./styles";

const Explorer = props => {
  const { flowId, call, on, emit, mainInterface } = props;
  const classes = explorerStyles();
  const [data, setData] = useState([]);
  const [selectedNode, setSelectedNode] = useState({});
  const shouldUpdatePreview = useRef(true);

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    if (!mainInterface) return;
    mainInterface.mode.default.onEnter.subscribe(() => {
      shouldUpdatePreview.current = true;
      setSelectedNode({});
    });
  }, [mainInterface]);

  /**
   * Expand tree or open document depending on the node deepness
   *  0 : collapse others and expand tree node
   *  1 : open document node
   * @param {{id: String, deepness: String, url: String, name: String, scope: String}} node : Clicked node
   */
  const requestScopeVersions = useCallback(
    node => {
      if (node.children?.length) {
        setData(toggleExpandRow(node, data));
      } else {
        shouldUpdatePreview.current = false;
        setSelectedNode(node);
        emit(PLUGINS.FLOW_EXPLORER.ON.ADD_NODE, node);
      }
    },
    [data, emit]
  );

  //========================================================================================
  /*                                                                                      *
   *                                       Handlers                                       *
   *                                                                                      */
  //========================================================================================

  /**
   * Handle Mouse Enter on Node
   * @param {NodeObject} node
   */
  const handleMouseEnterNode = useCallback(node => {
    if (shouldUpdatePreview.current) {
      setSelectedNode(node);
    }
  }, []);

  /**
   * Handle Mouse Leave on Node
   * @param {NodeObject} node
   */
  const handleMouseLeaveNode = useCallback(_node => {
    if (shouldUpdatePreview.current) {
      setSelectedNode({});
    }
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                   React callbacks                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Load documents
   * @param {DocManager} docManager
   */
  const loadDocs = useCallback(docManager => {
    return setData(_node =>
      [docManager.getStore("Node"), docManager.getStore("Flow")].map(
        (store, id) => {
          const { name, title } = store;
          const filteredChildren = store.getDocs().filter(d => !d.isNew);
          return {
            id,
            name,
            title,
            children: filteredChildren.map((doc, childId) => {
              return {
                id: childId,
                name: doc.getName(),
                title: doc.getName(),
                scope: doc.getScope(),
                url: doc.getUrl()
              };
            })
          };
        }
      )
    );
  }, []);

  //========================================================================================
  /*                                                                                      *
   *                                   React lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  useEffect(() => {
    on(PLUGINS.DOC_MANAGER.NAME, PLUGINS.DOC_MANAGER.ON.LOAD_DOCS, loadDocs);
  }, [on, loadDocs]);

  //========================================================================================
  /*                                                                                      *
   *                                       Render                                         *
   *                                                                                      */
  //========================================================================================

  return (
    <Typography
      className={classes.flowExplorerHolder}
      data-testid="section_flow-explorer-menu"
      component="div"
    >
      <Typography component="div">
        <Preview node={selectedNode} flowId={flowId} call={call} />
      </Typography>
      <Typography component="div" className={classes.typography}>
        {data && (
          <ListItemsTreeWithSearch
            data={data}
            onClickNode={requestScopeVersions}
            onMouseEnter={handleMouseEnterNode}
            onMouseLeave={handleMouseLeaveNode}
          ></ListItemsTreeWithSearch>
        )}
      </Typography>
    </Typography>
  );
};

export default withViewPlugin(Explorer);

Explorer.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired
};
