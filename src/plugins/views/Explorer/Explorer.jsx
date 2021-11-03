import { makeStyles } from "@mui/styles";
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

const INITIAL_SCOPE_DATA = [
  {
    id: 1,
    name: "Callbacks",
    scope: "Callback",
    children: []
  },
  {
    id: 2,
    name: "Configurations",
    scope: "Configuration",
    children: []
  },
  {
    id: 3,
    name: "Flows",
    scope: "Flow",
    children: []
  },
  {
    id: 4,
    name: "Nodes",
    scope: "Node",
    children: []
  }
];

const Explorer = ({ profile, call, on, emit, onTopic }) => {
  // const classes = useStyles();
  const [data, setData] = React.useState(INITIAL_SCOPE_DATA);

  React.useEffect(() => {
    const loadDocs = docs => {
      const newData = data.map(e => ({
        ...e,
        children: docs.has(e.scope) ? docs.get(e.scope) : []
      }));
      setData(newData);
    };

    on("docManager", "loadDocs", loadDocs);
  }, [on, data]);

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
