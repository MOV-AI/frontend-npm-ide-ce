import { addTimestamp } from "../Utils/TimeStamp";
import { checkNested } from "../../_shared/Utils/Utils";
import { mergeDeep } from "../../_shared/Utils/Utils";

const flowSubscriber = component => {
  //NODE INST
  const scopeFlow = {
    Scope: "Flow",
    Name: component.props.flow
  };
  component.subscribersList.push(scopeFlow);

  component.database.subscribe(
    scopeFlow,
    data => {
      console.log("?*? subscriber", data);
      // Get Flow  changes callback
      let new_flow;
      const flow = data.key.Flow[component.props.flow];
      switch (data.event) {
        case "hdel":
        case "hset":
          new_flow = { ...component.state.myflow };
          Object.keys(flow).map(key => {
            new_flow[component.props.flow][key] = { ...flow[key] };
          });
          break;
        case "del":
          if ("NodeInst" in flow || "Container" in flow) {
            console.log("del nodeInst", flow);
            const instance_name = "NodeInst" in flow ? "NodeInst" : "Container";
            const node_name = Object.keys(flow[instance_name])[0];
            // when a nodeInst is deleted we get a notification for every nodeInst key (NodeLabel, Template, ...)
            // if any of the following keys is deleted we assume the node was deleted
            // otherwise merge changes
            const keys_validate_delete = {
              NodeInst: ["NodeLabel", "Template", "Visualization"],
              Container: ["ContainerLabel", "ContainerFlow", "Visualization"]
            };
            const node_deleted = keys_validate_delete[instance_name]
              .map(key => key in flow[instance_name][node_name])
              .some(res => res === true);
            if (!!node_deleted) {
              new_flow = { ...component.state.myflow };
              delete new_flow[component.props.flow][instance_name][node_name];
              component.isReturnValidated(component.removeInst(node_name));
              // only break if the node was deleted otherwise continue to merge changes
              break;
            }
          }
        default:
          // @TODO: remove skipRender after changing nodes position to one key only
          const skipCoordinate = checkNested(
            data.key.Flow[component.props.flow],
            "NodeInst",
            "*",
            "Visualization"
          );
          if (skipCoordinate) {
            component.skipRender = !component.skipRender;
          }
          new_flow = mergeDeep(component.state.myflow, data.key.Flow);
      }
      component.updateLayers(new_flow);
      component.isReturnValidated(component.getFlow(new_flow));
      component.testGraphEdges();
      component.addRightMenuAlerts();
    },
    data => {
      // Flow Subscriber data
      const _flow = data.value.Flow;
      const { label } = component.state.flow;
      let nodes = [];
      if ("NodeInst" in _flow) {
        nodes = Object.keys(_flow[label].NodeInst);
      }
      const ts_flow = addTimestamp(_flow, label, nodes);
      component.updateLayers(ts_flow);
      component.isReturnValidated(component.getFlow(ts_flow));
      component.addRightMenuAlerts();
      component.setState({ loading: false });
    }
  );
};

export { flowSubscriber };
