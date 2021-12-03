import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import _get from "lodash/get";
import _set from "lodash/set";
import { Maybe } from "monet";
import PropTypes from "prop-types";
import React from "react";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import VirtualizedTree from "./components/VirtualizedTree/VirtualizedTree";

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
  const { call, on } = props;
  const classes = useStyles();
  const [data, setData] = React.useState([]);

  const { t } = useTranslation();

  //========================================================================================
  /*                                                                                      *
   *                                    Private Methods                                   *
   *                                                                                      */
  //========================================================================================

  /**
   * Push element into list in correct position
   * @param {Array} list
   * @param {TreeNode} element
   */
  const _pushSorted = React.useCallback((list, element) => {
    /**
     * Compare objects' name property to sort
     * @param {*} a
     * @param {*} b
     * @returns
     */
    const compareByName = (a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    };
    // Insert element
    list.push(element);
    // Return sorted list
    return list.sort(compareByName).map((x, i) => ({ ...x, id: i }));
  }, []);

  /**
   * Delete document from local list
   * @param {{documentName: String, documentType: String}} docData
   */
  const _deleteDocument = React.useCallback(docData => {
    const { documentName, documentType } = docData;
    setData(prevState => {
      const newData = [...prevState];
      // TODO: optimize time
      const typeIndex = newData.findIndex(type => type.name === documentType);
      if (typeIndex >= 0) {
        const documentIndex = newData[typeIndex].children.findIndex(
          doc => doc.name === documentName
        );
        if (documentIndex >= 0) {
          newData[typeIndex].children.splice(documentIndex, 1);
        }
      }
      return newData;
    });
  }, []);

  /**
   * Insert newly created document
   * @param {DocManager} docManager
   * @param {{documentName: String, documentType: String}} docData
   */
  const _addDocument = React.useCallback(
    (docManager, docData) => {
      const { documentName, documentType } = docData;
      setData(prevState => {
        // TODO: optimize time
        const newData = [...prevState];
        const typeIndex = newData.findIndex(type => type.name === documentType);
        if (typeIndex >= 0) {
          const documentIndex = newData[typeIndex].children.findIndex(
            doc => doc.name === documentName
          );
          if (documentIndex < 0) {
            const document = docManager.getDocFromNameType(
              documentName,
              documentType
            );
            if (document) {
              _pushSorted(newData[typeIndex].children, {
                name: document.getName(),
                title: document.getName(),
                scope: document.getScope(),
                url: document.getUrl()
              });
            }
          }
        }
        return newData;
      });
    },
    [_pushSorted]
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
  const loadDocs = React.useCallback(docManager => {
    return setData(_ =>
      docManager.getStores().map((store, id) => {
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
      })
    );
  }, []);

  /**
   *
   * @param {DocManager} docManager
   * @param {{action: String, documentName: String, documentType: String}} docData
   */
  const updateDocs = React.useCallback(
    (docManager, docData) => {
      const { action } = docData;
      const updateByActionMap = {
        delete: () => _deleteDocument(docData),
        update: () => _addDocument(docManager, docData)
      };
      Maybe.fromNull(updateByActionMap[action]).forEach(updateAction =>
        updateAction()
      );
    },
    [_deleteDocument, _addDocument]
  );

  //========================================================================================
  /*                                                                                      *
   *                                   React lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  React.useEffect(() => {
    on("docManager", "loadDocs", loadDocs);
    on("docManager", "updateDocs", updateDocs);
  }, [on, loadDocs, updateDocs]);

  /**
   * Expand tree or open document depending on the node deepness
   *  0 : collapse others and expand tree node
   *  1 : open document node
   * @param {{id: String, deepness: String, url: String, name: String, scope: String}} node : Clicked node
   */
  const _requestScopeVersions = node => {
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
        const tabName = `${node.name}.conf`;
        call("tabs", "openEditor", {
          id: node.url,
          title: tabName,
          name: node.name,
          scope: node.scope
        });
      }
    };
    _get(deepnessToAction, node.deepness, () => {
      console.log("action not implemented");
    })();
  };

  return (
    <Typography component="div">
      <h1 className={classes.header}>{t("Explorer")}</h1>
      <Typography component="div" className={classes.typography}>
        <VirtualizedTree
          onClickNode={async node => {
            _requestScopeVersions(node);
          }}
          data={data}
          handleChange={nodes => {
            console.log("debug handle change", nodes);
          }}
          handleCopyClick={node => {
            const { name, scope } = node;
            call("dialog", "copyDocument", {
              scope,
              name,
              onSubmit: newName =>
                new Promise((resolve, reject) => {
                  call("docManager", "copy", { name, scope }, newName).then(
                    () => resolve()
                  );
                })
            });
          }}
          handleDeleteClick={node => {
            const { name, scope } = node;
            call("dialog", "confirmation", {
              title: t("Confirm to delete"),
              onSubmit: () => call("docManager", "delete", { name, scope }),
              message: `Are you sure you want to delete the document "${name}"?`
            });
          }}
          handleCompareClick={node => {
            console.log("debug compare click", node);
          }}
          showIcons={true}
          height={props.height}
        ></VirtualizedTree>
      </Typography>
    </Typography>
  );
};

export default withViewPlugin(Explorer);

Explorer.propTypes = {
  call: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

Explorer.defaultProps = {
  profile: { name: "explorer" }
};

function useTranslation() {
  return { t: s => s };
}
