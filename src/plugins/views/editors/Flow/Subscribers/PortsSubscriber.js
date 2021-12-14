const portsSubscriber = component => {
  console.log("portsSubscriber called", component);
  const pattern = {
    Scope: "Ports",
    Name: "*"
  };
  component.subscribersList.push(pattern);
  component.database.subscribe(
    pattern,
    data => {
      // get changes
    },
    data => {
      // load data
      component.setState({ Ports: data.value.Ports });
    }
  );
};

export { portsSubscriber };
