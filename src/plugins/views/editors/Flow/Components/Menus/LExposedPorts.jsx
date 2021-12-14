import React, { Component } from "react";
import PropTypes from "prop-types";
import { ListItemsWithSearch } from "../../../_shared/ListItems/ListItems";
import CollapseListManager from "../../../_shared/ListItems/CollapseListManager";
import CollapseItem from "../../../_shared/ListItems/CollapseItem";
import { Item } from "../../../_shared/ListItems/Item";
import { Button } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import LinkOffIcon from "@material-ui/icons/LinkOff";
import LinkIcon from "@material-ui/icons/Link";
import Box from "@material-ui/core/Box";

import MasterComponent from "../../../MasterComponent/MasterComponent";
import { MasterDB } from "@mov-ai/mov-fe-lib-core";
import { withTranslation } from "react-i18next";

const styles = theme => ({});

class ExposedPorts extends Component {
  state = {
    searchNodes: "",
    nodes: [],
    exposedPorts: {},
    loading: false,
    dataChanged: false // data was changed by the user
  };

  //========================================================================================
  /*                                                                                      *
   *                                       Lifecycle                                      *
   *                                                                                      */
  //========================================================================================

  componentDidMount() {
    this.fetchData();
    // anti-pattern because the way lateral menus are rendered
    // this is the most efficient way to update data
    this.interval = setInterval(this.fetchData, 1500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  //========================================================================================
  /*                                                                                      *
   *                                        getters                                       *
   *                                                                                      */
  //========================================================================================

  updateGraph = (exposedPorts, flow_id) => {
    const updatedState = {};
    // get exposedPorts updated
    try {
      const flowExposedPorts = exposedPorts[flow_id].ExposedPorts;
      if (
        JSON.stringify(flowExposedPorts) !==
        JSON.stringify(this.state.exposedPorts)
      ) {
        updatedState["exposedPorts"] = { ...flowExposedPorts };
        this.setState({ ...updatedState });
      }
    } catch (error) {}
  };

  fetchData = () => {
    if (this.state.dataChanged === true) return;
    const parent = this.props.parent;
    const flow_id = this.props.uid;
    if (!!parent.state.graph) {
      try {
        const nodes = JSON.parse(JSON.stringify(parent.state.graph.nodes));
        if (this.shouldUpdateNodes(nodes, this.state.nodes)) {
          this.setState({ nodes: [...nodes] });
        }
      } catch (error) {}
    }
    const exposedPorts = JSON.parse(JSON.stringify(parent.state.ExposedPorts));
    this.updateGraph(exposedPorts, flow_id);
  };

  shouldUpdateNodes = (newNodes, previousNodes) => {
    const newNodesNames = newNodes.map(node => node.NodeLabel);
    const previousNodesNames = previousNodes.map(node => node.NodeLabel);
    if (newNodesNames.length !== previousNodesNames.length) {
      // if node length is not the same
      return true;
    }
    if (!newNodesNames.every(node => previousNodesNames.includes(node))) {
      // if nodes names are not the same
      return true;
    }
    return false;
  };

  getNodes = () => {
    try {
      const { nodes } = this.state;
      const jNodes = JSON.parse(JSON.stringify(nodes));
      return jNodes;
    } catch (error) {
      return [];
    }
  };

  getStateExposedPorts = () =>
    JSON.parse(JSON.stringify(this.state.exposedPorts));

  getExpTemplate = template => {
    if (!!this.state.exposedPorts[template]) {
      const _templateObj = JSON.parse(
        JSON.stringify(this.state.exposedPorts[template])
      );
      return { ..._templateObj };
    } else {
      return {};
    }
  };

  getExpTemplates = () => {
    return JSON.parse(JSON.stringify(this.state.exposedPorts));
  };

  getExpOtherTemplates = template => {
    // get all templates in exposedPorts state
    const allTemplates = this.getExpTemplates();
    let filteredTemplates = {};
    Object.keys(allTemplates)
      .filter(name => name !== template)
      .forEach(name => {
        const _template = allTemplates[name];
        const template = { [name]: { ..._template } };
        filteredTemplates = {
          ...template,
          ...filteredTemplates
        };
      });
    return filteredTemplates;
  };

  getExpNode = (template, node) => {
    const _nodeObjs = this.getExpTemplate(template);
    return !!_nodeObjs[node] ? { [node]: _nodeObjs[node] } : {};
  };

  getExpOtherNodes = (template, node) => {
    const nodes = this.getExpTemplate(template);
    let filteredNodes = {};
    Object.keys(nodes)
      .filter(name => name !== node)
      .forEach(name => {
        const _node = { [name]: nodes[name] };
        filteredNodes = { ..._node, ...filteredNodes };
      });
    return filteredNodes;
  };

  getExpPorts = (template, node) => {
    const nodeObj = this.getExpNode(template, node);
    return !!nodeObj[node] ? [...nodeObj[node]] : [];
  };

  addExposedPort = (template, node, port) => {
    const ports = this.getExpPorts(template, node);
    ports.push(port);
    const nodePorts = { [node]: [...ports] };
    const otherExposedPorts = this.getExpOtherNodes(template, node);
    const tempNodes = { [template]: { ...nodePorts, ...otherExposedPorts } };
    const otherTemplates = this.getExpOtherTemplates(template);
    this.setState({
      exposedPorts: {
        ...tempNodes,
        ...otherTemplates
      }
    });
  };

  //========================================================================================
  /*                                                                                      *
   *                                       handlers                                       *
   *                                                                                      */
  //========================================================================================

  removeExposedPort = (template, node, port) => {
    const ports = this.getExpPorts(template, node);
    ports.splice(ports.indexOf(port), 1);
    let nodes = this.getExpOtherNodes(template, node);
    if (ports.length > 0) {
      // add node object
      nodes = { ...nodes, [node]: [...ports] };
    }

    if (Object.keys(nodes).length > 0) {
      this.setState({
        exposedPorts: {
          ...this.state.exposedPorts,
          [template]: { ...nodes }
        }
      });
    } else {
      // template does not have any node with exposed ports
      const otherTemplates = this.getExpOtherTemplates(template);
      this.setState({
        exposedPorts: {
          ...otherTemplates
        }
      });
    }
  };

  handlePortChange = (template, node, port) => {
    if (this.isPortExposed(template, node, port)) {
      // remove port
      this.removeExposedPort(template, node, port);
    } else {
      // add port
      this.addExposedPort(template, node, port);
    }
    this.setState({ dataChanged: true });
  };

  handleReset = () => {
    this.setState({ dataChanged: false });
    this.fetchData();
  };

  handleSave = () => {
    const { uid } = this.props.uid;
    const message = "Exposed ports updated.";
    const dataModel = "Flow";
    const exposedPorts = this.getStateExposedPorts();

    this.setState({ loading: true }, () => {
      if (Object.keys(exposedPorts).length > 0) {
        MasterDB.post(
          dataModel,
          uid,
          { ExposedPorts: "*" },
          { ...exposedPorts },
          (data, res) => this.parseResponse(message, data, res)
        );
      } else {
        MasterDB.delete(
          dataModel,
          uid,
          (data, res) => this.parseResponse(message, data, res),
          { ExposedPorts: "" }
        );
      }
    });
  };

  parseResponse = (message, data, res) => {
    if (data.success === false) {
      MasterComponent.alert(res.statusText, "error");
    } else {
      MasterComponent.alert(message);
    }
    this.setState({ loading: false, dataChanged: false });
  };

  isPortExposed = (template, node, port) => {
    const exposedPorts = this.getStateExposedPorts();
    try {
      //this will raise an exception if the template, node and port does not exist
      return exposedPorts[template][node].includes(port);
    } catch (error) {
      return false;
    }
  };

  createMenus() {
    const data = [];
    const nodes = this.getNodes();
    nodes.forEach(node => {
      if (node.id === "start" || !!node.NodeLabel === false) return;
      const ports = [...node.inPorts, ...node.outPorts];
      data.push({
        key: `key_${node.NodeLabel}`,
        text: node.NodeLabel,
        template: node.Template,
        data: ports,
        onClick: (name, template, port) =>
          this.handlePortChange(template, name, port)
      });
    });
    return data;
  }

  //========================================================================================
  /*                                                                                      *
   *                                        render                                        *
   *                                                                                      */
  //========================================================================================

  render() {
    const { t } = this.props;
    const menus = this.createMenus();
    const { loading, dataChanged } = this.state;
    const height = "100%";
    return (
      <React.Fragment>
        <ListItemsWithSearch
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
            height: "70vh"
          }}
          onSearch={input =>
            this.setState({
              searchNodes: input
            })
          }
          height={height}
        >
          <CollapseListManager>
            {menus.map(obj => {
              if (
                obj.text
                  .toLowerCase()
                  .includes(this.state.searchNodes.toLowerCase())
              ) {
                return (
                  <CollapseItem
                    key={obj.key}
                    height="40vh"
                    item={
                      <Item style={{ paddingRight: "15px" }} text={obj.text} />
                    }
                  >
                    {obj.data.map(menuObj => {
                      return (
                        <Item
                          key={menuObj.id}
                          before={
                            this.isPortExposed(
                              obj.template,
                              obj.text,
                              menuObj.id
                            ) ? (
                              <LinkIcon
                                style={{
                                  marginLeft: "5px",
                                  paddingRight: "5px"
                                }}
                              />
                            ) : (
                              <LinkOffIcon
                                style={{
                                  marginLeft: "5px",
                                  paddingRight: "5px"
                                }}
                              />
                            )
                          }
                          text={menuObj.id}
                          onClick={() => {
                            const filter = obj.data.filter(
                              item => item.id === menuObj.id
                            );
                            if (filter.length > 0) {
                              if (filter[0].id) {
                                obj.onClick(
                                  obj.text,
                                  obj.template,
                                  filter[0].id
                                );
                              }
                            }
                          }}
                        />
                      );
                    })}
                  </CollapseItem>
                );
              }
            })}
          </CollapseListManager>
        </ListItemsWithSearch>
        <Box style={{ display: "flex", flexDirection: "row", margin: "10px" }}>
          <Button
            disabled={loading || !dataChanged}
            variant="outlined"
            size="small"
            style={{ flexGrow: 1, marginRight: "3px" }}
            onClick={() => {
              this.handleReset();
            }}
          >
            {t("Reset")}
          </Button>
          <Button
            disabled={loading || !dataChanged}
            variant="outlined"
            size="small"
            style={{ flexGrow: 1 }}
            onClick={() => {
              this.handleSave();
            }}
          >
            {t("Save")}
          </Button>
        </Box>
      </React.Fragment>
    );
  }
}

ExposedPorts.propTypes = {
  api: PropTypes.object,
  parent: PropTypes.elementType,
  exposedPorts: PropTypes.object,
  uid: PropTypes.string,
  ExposedPorts: PropTypes.object
};

ExposedPorts.defaultProps = {};

export default withStyles(styles, { withTheme: true })(
  withTranslation()(ExposedPorts)
);
