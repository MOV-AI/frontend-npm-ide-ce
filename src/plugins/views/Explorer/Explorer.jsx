import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import _get from "lodash/get";
import _set from "lodash/set";
import PropTypes from "prop-types";
import React from "react";
import VirtualizedTree from "./components/VirtualizedTree/VirtualizedTree";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
// import PluginManagerIDE from "../../../engine/PluginManagerIDE/PluginManagerIDE";

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

  React.useEffect(() => {
    const loadDocs = docs => {
      setData(_ => {
        return Object.values(docs.getDocTypes()).map((docType, id) => {
          return {
            id,
            name: docType.name,
            title: docType.title,
            children: docs
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
      <h1>Explorer</h1>
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
