import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import BasicWorkspaceTree from "../../../_shared/BasicWorkspaceTree/BasicWorkspaceTree";
import _get from "lodash/get";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";

const styles = theme => ({});

// TO REMOVE
const MasterDB = {
  subscribe: () => {},
  unsubscribe: () => {}
};

class LNodesMenu extends Component {
  state = {
    Nodes: {},
    searchNodes: "",
    Flows: {},
    searchFlows: "",
    height: "100%",
    treeData:
      this.props.parentType === "flow"
        ? [
            {
              id: 0,
              name: "Nodes",
              scope: "Node",
              children: []
            },
            {
              id: 1,
              name: "Flows",
              scope: "Flow",
              children: []
            }
          ]
        : [
            {
              id: 0,
              name: "Nodes",
              scope: "StateMachine",
              children: []
            }
          ]
  };
  subscribersList = [];
  database = MasterDB;

  //========================================================================================
  /*                                                                                      *
   *                                   React Lifecycles                                   *
   *                                                                                      */
  //========================================================================================

  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  //========================================================================================
  /*                                                                                      *
   *                                   Handler Functions                                  *
   *                                                                                      */
  //========================================================================================

  subscribe = () => {
    this.nodesSubscriber();
    if (this.props.parentType === "flow") this.flowsSubscriber();
  };

  nodesSubscriber = () => {
    const pattern = {
      Scope: "Node",
      Name: "*",
      Label: "*"
    };
    this.subscribersList.push(pattern);
    this.database.subscribe(
      pattern,
      data => {
        const { treeData, Nodes } = this.state;
        // get changes
        const nodesChanged = Object.keys(data.key.Node).map(key => {
          return { Label: key, name: key, id: key, scope: "Node" };
        });
        nodesChanged.forEach(node => {
          if (data.event === "del") delete Nodes[node.id];
          else if (data.event === "set") Nodes[node.id] = node;
        });
        // Update state variables
        treeData[0].children = this._formatNodes2Tree(Nodes);
        this.setState({ treeData, Nodes });
      },
      data => {
        // load data
        const treeData = [...this.state.treeData];
        treeData[0].children = this._formatNodes2Tree(data.value.Node);
        this.setState({ treeData, Nodes: data.value.Node });
      }
    );
  };

  flowsSubscriber = () => {
    const pattern = {
      Scope: "Flow",
      Name: "*",
      Label: "*"
    };
    this.subscribersList.push(pattern);
    this.database.subscribe(
      pattern,
      data => {
        const { treeData, Flows } = this.state;
        // get changes
        const flowsChanged = Object.keys(data.key.Flow).map(key => {
          return { Label: key, name: key, id: key, scope: "Flow" };
        });
        flowsChanged.forEach(flow => {
          if (data.event === "del") delete Flows[flow.id];
          else if (data.event === "set") Flows[flow.id] = flow;
        });
        treeData[1].children = this._formatFlows2Tree(Flows);
        this.setState({ treeData, Flows });
      },
      data => {
        // load data
        const treeData = [...this.state.treeData];
        treeData[1].children = this._formatFlows2Tree(data.value.Flow);
        this.setState({ treeData, Flows: data.value.Flow });
      }
    );
  };

  __nodes_flow = (node, key) => {
    if (key.includes("@SM")) {
      return null;
    }
    return { name: node.Label, id: key, scope: "Node" };
  };

  __nodes_sm = (node, key) => {
    if (!key.includes("@SM")) {
      return null;
    }
    return { name: node.Label.replace("@SM_", ""), id: key, scope: "Node" };
  };

  _formatNodes2Tree = nodes => {
    const _nodes = Object.keys(nodes)
      .map(key => {
        const node = nodes[key];
        // call __nodes_flow or __nodes_sm depending on parent type (flow or sm)
        return this[`__nodes_${this.props.parentType}`](node, key);
      })
      .filter(node => node !== null)
      .sort((a, b) => a.id.localeCompare(b.id));
    return _nodes;
  };

  _formatFlows2Tree = flows => {
    const _flows = Object.keys(flows)
      .map(key => {
        const flow = flows[key];
        return { name: flow.Label, id: key, scope: "Flow" };
      })
      .filter(flow => flow !== null && flow.id !== this.props.parentId) // cannot add own flow to canvas
      .sort((a, b) => a.id.localeCompare(b.id));
    return _flows;
  };

  unsubscribe = () => {
    this.subscribersList.forEach(pattern => {
      this.database.unsubscribe(pattern);
    });
    this.subscribersList = [];
  };

  /* available menus
  @key menu unique key
  @text title
  @available parent types where the menu is available
  @data fn to get menu data
  @onClick fn to forward selected item to parent
  */
  menus = [
    {
      key: "menu_nodes",
      text: "Add Node",
      scope: "Node",
      available: ["flow", "sm"],
      data: () => this.state.Nodes,
      onClick: item_id => this.props.addNodeToCanvas(item_id)
    },
    {
      key: "menu_flows",
      text: "Add Flow",
      scope: "Flow",
      available: ["flow"],
      data: () => this.state.Flows,
      onClick: item_id => this.props.addFlowToCanvas(item_id)
    }
  ];

  //========================================================================================
  /*                                                                                      *
   *                                        Render                                        *
   *                                                                                      */
  //========================================================================================

  render() {
    return (
      <BasicWorkspaceTree
        scopeList={
          this.props.parentType === "flow"
            ? [
                {
                  id: 0,
                  name: "Nodes",
                  scope: "Node",
                  children: [{ name: "" }]
                },
                {
                  id: 1,
                  name: "Flows",
                  scope: "Flow",
                  children: [{ name: "" }]
                }
              ]
            : [
                {
                  id: 0,
                  name: "Nodes",
                  scope: "Node",
                  children: [{ name: "" }]
                }
              ]
        }
        onSelectTree={treeNode => {
          const actionMap = {
            0: () => {
              const treeData = _cloneDeep(this.state.treeData);
              // Toggle the expansion of the panel in global
              const isExpanded = _get(
                treeData,
                [treeNode.id, "state", "expanded"],
                false
              );
              _set(treeData, [treeNode.id, "state"], {
                expanded: !isExpanded
              });
              this.setState({ treeData });
            },
            1: () => {
              // In global workspace mode
              this.props[`add${treeNode.scope}ToCanvas`](treeNode.id);
            },
            2: () => {
              // Other workspaces
              this.props[`add${treeNode.scope}ToCanvas`](treeNode.url);
            }
          };
          _get(actionMap, treeNode.deepness, () => {})();
        }}
        data={this.state.treeData}
        setData={treeData => this.setState({ treeData })}
      ></BasicWorkspaceTree>
    );
  }
}

LNodesMenu.propTypes = {
  addNodeToCanvas: PropTypes.func,
  addFlowToCanvas: PropTypes.func,
  parentType: PropTypes.string,
  parentLabel: PropTypes.string,
  parentId: PropTypes.string,
  editable: PropTypes.bool
};

export default withStyles(styles, { withTheme: true })(LNodesMenu);
