import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import _get from "lodash/get";
import _set from "lodash/set";
import PropTypes from "prop-types";
import React from "react";
import VirtualizedTree from "./components/VirtualizedTree/VirtualizedTree";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import PluginManagerIDE from "../../../engine/PluginManagerIDE/PluginManagerIDE";
import Configuration from "../editors/Configuration/Configuration";

const useStyles = makeStyles(() => ({
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
    const loadDocs = docs => {
      setData(_ => {
        return Object.values(docs.getDocTypes()).map((docTypeName, id) => {
          return {
            id,
            name: docTypeName,
            children: docs
              .getDocsFromType(docTypeName)
              .map((docFromType, innerId) => {
                return {
                  id: innerId,
                  name: docFromType.name,
                  url: docFromType.url
                };
              })
          };
        });
      });
    };
    on("docManager", "loadDocs", loadDocs);
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
        const tabName = `${node.name}.conf`;
        const viewPlugin = new Configuration(
          { name: node.url },
          { id: node.url, name: node.name }
        );
        PluginManagerIDE.install(node.url, viewPlugin).then(() => {
          // Open tab
          call("tabs", "open", {
            id: node.url,
            title: tabName,
            content: viewPlugin.render()
          });
        });
      }
    };
    _get(deepnessToAction, node.deepness, () => {})();
  };

  return (
    <div style={{ padding: 5 }}>
      <h1>Explorer</h1>
      <Typography component="div" className={classes.typography}>
        <VirtualizedTree
          onClickNode={async node => {
            console.log("debug click node", node);
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
    </div>
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
