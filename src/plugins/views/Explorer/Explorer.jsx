import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import { withViewPlugin } from "../../../engine/ReactPlugin/ViewReactPlugin";
import ExplorerTree from "./ExplorerTree";

const useStyles = makeStyles(() => ({
  icon: {
    color: "primary",
    "&:hover": {
      cursor: "pointer"
    }
  }
}));

const Explorer = props => {
  const { profile, call, on, emit, onTopic } = props;
  // const classes = useStyles();
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    const loadDocs = docs => {
      setData(_ => {
        const docsByType = docs.getDocumentsByType();
        return Object.values(docsByType).map(docType => {
          const docsFromType = docType.docs;
          const docTypeName = docType.name;
          return {
            name: docTypeName,
            children: Object.keys(docsFromType).map(key => {
              return { name: docsFromType[key].name, children: [] };
            })
          };
        });
      });
    };
    on("docManager", "loadDocs", loadDocs);
  }, [on]);

  return (
    <>
      <h1>Explorer</h1>
      <ExplorerTree tree={data} onClickNode={node => {}} />
    </>
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
