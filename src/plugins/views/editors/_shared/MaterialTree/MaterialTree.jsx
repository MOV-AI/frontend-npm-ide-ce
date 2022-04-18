import React, { memo } from "react";
import PropTypes from "prop-types";
import SvgIcon from "@material-ui/core/SvgIcon";
import { alpha, withStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import _isEqual from "lodash/isEqual";

function MinusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 11.023h-11.826q-.375 0-.669.281t-.294.682v0q0 .401.294 .682t.669.281h11.826q.375 0 .669-.281t.294-.682v0q0-.401-.294-.682t-.669-.281z" />
    </SvgIcon>
  );
}

function PlusSquare(props) {
  return (
    <SvgIcon fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0zM17.873 12.977h-4.923v4.896q0 .401-.281.682t-.682.281v0q-.375 0-.669-.281t-.294-.682v-4.896h-4.923q-.401 0-.682-.294t-.281-.669v0q0-.401.281-.682t.682-.281h4.923v-4.896q0-.401.294-.682t.669-.281v0q.401 0 .682.281t.281.682v4.896h4.923q.401 0 .682.281t.281.682v0q0 .375-.281.669t-.682.294z" />
    </SvgIcon>
  );
}

function CloseSquare(props) {
  return (
    <SvgIcon className="close" fontSize="inherit" {...props}>
      {/* tslint:disable-next-line: max-line-length */}
      <path d="M17.485 17.512q-.281.281-.682.281t-.696-.268l-4.12-4.147-4.12 4.147q-.294.268-.696.268t-.682-.281-.281-.682.294-.669l4.12-4.147-4.12-4.147q-.294-.268-.294-.669t.281-.682.682-.281.696 .268l4.12 4.147 4.12-4.147q.294-.268.696-.268t.682.281 .281.669-.294.682l-4.12 4.147 4.12 4.147q.294.268 .294.669t-.281.682zM22.047 22.074v0 0-20.147 0h-20.12v0 20.147 0h20.12zM22.047 24h-20.12q-.803 0-1.365-.562t-.562-1.365v-20.147q0-.776.562-1.351t1.365-.575h20.147q.776 0 1.351.575t.575 1.351v20.147q0 .803-.575 1.365t-1.378.562v0z" />
    </SvgIcon>
  );
}

const StyledTreeItem = withStyles(theme => ({
  iconContainer: {
    "& .close": {
      opacity: 0.3
    }
  },
  group: {
    marginLeft: 12,
    paddingLeft: 12,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`
  }
}))(props => <TreeItem {...props} />);

const MaterialTree = props => {
  // Props
  const { data, multiSelect, onNodeSelect, onSelectItem } = props;

  //========================================================================================
  /*                                                                                      *
   *                                  Private Methods                                     *
   *                                                                                      */
  //========================================================================================

  /**
   * Get object tree item to be rendered
   *  This function is implemented to comply with SonarLint rule:
   *    Ternary operators should not be nested (javascript:S3358)
   * @returns {ReactElement} Element to be rendered
   */
  const _getObjectTreeItem = (obj, id, key, innerKey) => {
    // Extracted element IDs to comply with rule:
    //  Ternary operators should not be nested (javascript:S3358)
    const parentElementId = id ? id + "." + key : key;
    const elementId = [parentElementId, innerKey].join(".");

    // Return module item to be rendered
    return obj[key].modules !== undefined && innerKey === "modules" ? (
      <StyledTreeItem key={elementId} nodeId={elementId} label={innerKey}>
        {recursiveObjectTree(obj[key].modules, parentElementId)}
      </StyledTreeItem>
    ) : (
      <div key={elementId}></div>
    );
  };

  //========================================================================================
  /*                                                                                      *
   *                                      Render                                          *
   *                                                                                      */
  //========================================================================================

  /**
   * Render tree in array format
   * @param {array} array : Tree data
   * @param {string} id : Parent ID
   * @returns {ReactElement} Rendered Tree
   */
  const recursiveArrayTree = (array, id) => {
    return array.map(elem => {
      const elementId = id ? `${id}/${elem.text}` : elem.text;

      return elem.children === undefined ? (
        <StyledTreeItem
          data-testid="input_select-tree-item"
          key={elementId}
          nodeId={elementId}
          label={elem.text}
          onClick={() => onSelectItem(elem, elementId.split("/"))}
        />
      ) : (
        <StyledTreeItem
          data-testid="input_select-tree-item"
          key={elementId}
          nodeId={elementId}
          label={elem.text}
        >
          {recursiveArrayTree(elem.children, elementId)}
        </StyledTreeItem>
      );
    });
  };

  /**
   * Render tree in object format
   * @param {object} obj : Tree data
   * @param {string} id : Parent ID
   * @returns {ReactElement} Rendered Tree
   */
  const recursiveObjectTree = (obj, id) => {
    return Object.keys(obj)
      .sort()
      .map(key => {
        const elementId = id ? `${id}.${key}` : key;
        return (
          <StyledTreeItem
            data-testid="input_select-tree-item"
            key={elementId}
            nodeId={elementId}
            label={key}
            onClick={() => onSelectItem(key, id || key)}
          >
            {Object.keys(obj[key]).map(innerKey => {
              return obj[key][innerKey].length > 0 ? (
                <StyledTreeItem
                  data-testid="input_select-tree-item"
                  key={elementId + "." + innerKey}
                  nodeId={elementId + "." + innerKey}
                  label={innerKey}
                  onClick={() => onSelectItem(key, id || key)}
                >
                  {obj[key][innerKey].map(elem => {
                    return (
                      <StyledTreeItem
                        data-testid="input_select-tree-item"
                        key={elementId + "." + innerKey + "." + elem}
                        nodeId={elementId + "." + innerKey + "." + elem}
                        label={elem}
                        onClick={() => onSelectItem(elem, elementId + ".")}
                      />
                    );
                  })}
                </StyledTreeItem>
              ) : (
                _getObjectTreeItem(obj, id, key, innerKey)
              );
            })}
          </StyledTreeItem>
        );
      });
  };

  return (
    <TreeView
      data-testid="section_tree-view"
      multiSelect={multiSelect}
      style={{ marginTop: 15 }}
      onNodeSelect={(_, selectedNodes) => onNodeSelect(selectedNodes)}
      defaultExpanded={["1"]}
      defaultCollapseIcon={<MinusSquare />}
      defaultExpandIcon={<PlusSquare />}
      defaultEndIcon={<CloseSquare />}
    >
      {Array.isArray(data)
        ? recursiveArrayTree(data, null)
        : recursiveObjectTree(data, null)}
    </TreeView>
  );
};

MaterialTree.propTypes = {
  data: PropTypes.object,
  onNodeSelect: PropTypes.func,
  onSelectItem: PropTypes.func,
  multiSelect: PropTypes.bool
};

MaterialTree.defaultProps = {
  data: {},
  onSelectItem: (elem, path) => console.log(elem, path),
  onNodeSelect: (elem, path) => console.log(elem, path),
  multiSelect: false
};

//The function returns true when the compared props equal, preventing the component from re-rendering
// When data changes => component will render (return false)
function arePropsEqual(prevProps, nextProps) {
  return _isEqual(prevProps.data, nextProps.data);
}

export default memo(MaterialTree, arePropsEqual);
