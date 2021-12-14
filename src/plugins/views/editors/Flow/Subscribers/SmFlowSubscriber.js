import { checkNested } from "../../_shared/Utils/Utils";
import { mergeDeep } from "../../_shared/Utils/Utils";

const flowSubscriber = component => {
  //NODE INST
  const scopeFlow = {
    Scope: "StateMachine",
    Name: component.props.flow
  };
  component.subscribersList.push(scopeFlow);
  component.database.subscribe(
    scopeFlow,
    data => {
      let new_flow;
      const flow = data.key.StateMachine[component.props.flow];
      switch (data.event) {
        case "hdel":
        case "hset":
          new_flow = { ...component.state.myflow };
          Object.keys(flow).map(key => {
            new_flow[component.props.flow][key] = { ...flow[key] };
          });
          break;
        case "del":
          if ("State" in flow) {
            const deleted_node = Object.keys(flow.State)[0];
            new_flow = { ...component.state.myflow };
            delete new_flow[component.props.flow]["State"][deleted_node];
            component.isReturnValidated(component.removeInst(deleted_node));
          }
          if ("Link" in flow) {
            const deleted_link = Object.keys(flow.Link)[0];
            new_flow = { ...component.state.myflow };
            delete new_flow[component.props.flow]["Link"][deleted_link];
            component.isReturnValidated(component.removeLink(deleted_link));
          }
          break;
        default:
          // @TODO: remove skipRender after changing nodes position to one key only
          const skipCoordinate = checkNested(
            data.key.StateMachine[component.props.flow],
            "State",
            "*",
            "Visualization"
          );
          if (skipCoordinate) {
            component.skipRender = !component.skipRender;
          }
          new_flow = mergeDeep(component.state.myflow, data.key.StateMachine);
          break;
      }
      component.isReturnValidated(component.getFlow(new_flow));
      component.testGraphEdges();
      component.addRightMenuAlerts();
    },
    data => {
      component.isReturnValidated(component.getFlow(data.value.StateMachine));
      component.addRightMenuAlerts();
      component.setState({ loading: false });
    }
  );
};

export { flowSubscriber };
