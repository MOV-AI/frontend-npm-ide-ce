const exposedPortsSubscriber = component => {
  const pattern = {
    Scope: "Flow",
    Name: "*",
    ExposedPorts: "*"
  };
  component.subscribersList.push(pattern);
  component.database.subscribe(
    pattern,
    data => {
      // update data
      const flowsToUpdate = Object.keys(data.key.Flow);
      let newExposedPorts = {};
      switch (data.event) {
        case "hdel":
        case "del":
          const previousExposedPorts = JSON.parse(
            JSON.stringify(component.state.ExposedPorts)
          );
          const previousFlows = Object.keys(previousExposedPorts);
          previousFlows
            .filter(flow => !flowsToUpdate.includes(flow))
            .forEach(flow => {
              const flowToKeep = previousExposedPorts[flow];
              newExposedPorts = { [flow]: flowToKeep, ...newExposedPorts };
            });
          component.setState({ ExposedPorts: newExposedPorts });
          break;
        case "hset":
          flowsToUpdate.forEach(flow => {
            const toUpdate = data.key.Flow[flow];
            newExposedPorts = { [flow]: toUpdate, ...newExposedPorts };
          });
          component.setState(prevState => ({
            ExposedPorts: { ...prevState.ExposedPorts, ...newExposedPorts }
          }));
          break;
        default:
          break;
      }
    },
    data => {
      // load data
      if (!!data.value.Flow) {
        component.setState({ ExposedPorts: data.value.Flow });
      }
    }
  );
};

export { exposedPortsSubscriber };
