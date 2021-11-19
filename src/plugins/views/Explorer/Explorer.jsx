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
  }
}));

const Explorer = props => {
  const { call, on } = props;
  const classes = useStyles();
  const [data, setData] = React.useState([]);

  const { t } = useTranslation();

  /* eslint-disable react-hooks/exhaustive-deps */
  React.useEffect(() => {
    const loadDocs = docManager => {
      setData(_ => {
        return docManager.getDocTypes().map((docType, id) => {
          return {
            id,
            name: docType.name,
            title: docType.title,
            children: docManager
              .getDocsFromType(docType.scope)
              .map((docFromType, innerId) => {
                return {
                  id: innerId,
                  name: docFromType.name,
                  title: docFromType.name,
                  scope: docType.scope,
                  url: docFromType.url
                };
              })
          };
        });
      });
    };
    on("docManager", "loadDocs", loadDocs);

    const updateDocs = (docManager, { action, documentName, documentType }) => {
      const updateByActionMap = {
        delete: () => {
          setData(oldData => {
            const newData = [...oldData];
            // TODO: optimize time
            const typeIndex = newData.findIndex(
              type => type.name === documentType
            );
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
        },
        update: () => {
          setData(oldData => {
            const newData = [...oldData];
            // TODO: optimize time
            const typeIndex = newData.findIndex(
              type => type.name === documentType
            );
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
                  pushSorted(
                    newData[typeIndex].children,
                    {
                      name: document.name,
                      title: document.name,
                      scope: document.getScope(),
                      url: document.url
                    },
                    (a, b) => {
                      const nameA = a.name.toLowerCase();
                      const nameB = b.name.toLowerCase();
                      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
                    }
                  );
                }
              }
            }
            return newData;
          });
        }
      };
      Maybe.fromNull(updateByActionMap[action]).forEach(updateAction =>
        updateAction()
      );
    };
    on("docManager", "updateDocs", updateDocs);
  }, [on]);

  const requestScopeVersions = node => {
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
        console.log("debug node", node);
        const tabName = `${node.name}.conf`;
        call("tabs", "openEditor", {
          id: node.url,
          title: tabName,
          name: node.name,
          scope: node.scope
        });
      }
    };
    _get(deepnessToAction, node.deepness, () => {})();
  };

  return (
    <Typography component="div">
      <h1>{t("Explorer")}</h1>
      <Typography component="div" className={classes.typography}>
        <VirtualizedTree
          onClickNode={async node => {
            requestScopeVersions(node);
          }}
          data={data}
          handleChange={nodes => {
            console.log("debug handle change", nodes);
          }}
          handleCopyClick={node => {
            console.log("debug copy node", node);
          }}
          handleDeleteClick={node => {
            console.log("debug delete node", node);
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

function pushSorted(list, elem, comparator) {
  list.push(elem);
  return list.sort(comparator).map((x, i) => ({ ...x, id: i }));
}
