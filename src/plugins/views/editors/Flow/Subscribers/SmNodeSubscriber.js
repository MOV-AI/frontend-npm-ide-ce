import { flowSubscriber } from "./SmFlowSubscriber";

const nodeSubscriber = component => {
  //NODE INST
  const scopeNodes = {
    Scope: "Node",
    Name: "*"
  };
  component.subscribersList.push(scopeNodes);

  component.database.subscribe(
    scopeNodes,
    data => {
      //State Machine nodes do not change
    },
    data => {
      console.log("?*? State subscriber", data);
      let menuList = [];
      const nodes = Object.keys(data.value.Node)
        .map((key, index, all) => {
          if (!key.includes("@SM")) {
            return null;
          }
          menuList.push({
            name: data.value.Node[key].Label.replace("@SM_", ""),
            id: key
          });
          return { [key]: data.value.Node[key] };
        })
        .filter(node => node !== null);

      component.isReturnValidated(component.getNodeList(nodes));
      flowSubscriber(component);
    }
  );
};

export { nodeSubscriber };
