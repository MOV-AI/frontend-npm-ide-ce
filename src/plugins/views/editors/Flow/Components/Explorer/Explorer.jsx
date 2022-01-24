import React, { useCallback } from "react";
import PropTypes from "prop-types";
import _get from "lodash/get";
import _set from "lodash/set";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { withViewPlugin } from "../../../../../../engine/ReactPlugin/ViewReactPlugin";
import { useTranslation } from "../../../_shared/mocks";
import VirtualizedTree from "./../../../../Explorer/components/VirtualizedTree/VirtualizedTree";

const useStyles = makeStyles(theme => ({
  typography: {
    overflowY: "auto",
    overflowX: "hidden",
    justifyContent: "center",
    width: "100%"
  },
  header: {
    marginBottom: 6
  }
}));

const Explorer = props => {
  const { on, emit, height } = props;
  const classes = useStyles();
  const [data, setData] = React.useState([]);

  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                     Handle Events                                    *
   *                                                                                      */
  //========================================================================================

  /**
   * Expand tree or open document depending on the node deepness
   *  0 : collapse others and expand tree node
   *  1 : open document node
   * @param {{id: String, deepness: String, url: String, name: String, scope: String}} node : Clicked node
   */
  const requestScopeVersions = useCallback(
    node => {
      const deepnessToAction = {
        0: () => {
          // Toggle the expansion of the clicked panel
          setData(prevData => {
            const nextData = [...prevData];
            const isExpanded = _get(
              prevData,
              [node.id, "state", "expanded"],
              false
            );
            _set(nextData, [node.id, "state"], {
              expanded: !isExpanded
            });

            // Close other panels
            prevData
              .filter(elem => elem.id !== node.id)
              .forEach(panel => {
                _set(nextData, [panel.id, "state"], {
                  expanded: false
                });
              });
            return nextData;
          });
        },
        1: () => {
          emit("addNode", node);
        }
      };
      _get(deepnessToAction, node.deepness, () => {
        console.log("action not implemented");
      })();
    },
    [emit]
  );

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
    return setData(_ =>
      [docManager.getStore("Node"), docManager.getStore("Flow")].map(
        (store, id) => {
          const { name, title } = store;
          return {
            id,
            name,
            title,
            children: store.getDocs().map((doc, childId) => {
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

  React.useEffect(() => {
    on("docManager", "loadDocs", loadDocs);
  }, [on, loadDocs]);

  //========================================================================================
  /*                                                                                      *
   *                                       Render                                         *
   *                                                                                      */
  //========================================================================================

  return (
    <Typography component="div">
      <h1 className={classes.header}>{t("Explorer")}</h1>
      <Typography component="div" className={classes.typography}>
        <VirtualizedTree
          data={data}
          onClickNode={requestScopeVersions}
          height={height}
        ></VirtualizedTree>
      </Typography>
    </Typography>
  );
};

export default withViewPlugin(Explorer);

Explorer.propTypes = {
  call: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Explorer.defaultProps = {
  height: 700
};
