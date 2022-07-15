import Manager from "./ExposedPortsManager";
import ExposedPorts from "./ExposedPorts";

test("Toggle existing exposed port", () => {
  const ports = new Manager("exposedPorts", ExposedPorts);

  ports.toggleExposedPort("testTemplate", "testNode", "testPort");

  const expected = ports.getExposedPortsByTemplate("testTemplate");

  expect(expected).toBeInstanceOf(Object);
});

test("Remove empties", () => {
  const exposedPorts = new Manager("exposedPorts", ExposedPorts);

  const empty = new ExposedPorts({ name: "nodeInst2" });
  const notEmpty = new ExposedPorts({ name: "nodeInst1" });
  notEmpty.togglePort("somePort");

  exposedPorts.setItem({ name: "template1", content: { nodeInst1: notEmpty } });
  exposedPorts.setItem({ name: "template2", content: { nodeInst2: empty } });
  exposedPorts.setItem({ name: "template3", content: {} });

  exposedPorts.removeEmpties();

  expect(exposedPorts.getExposedPortsByTemplate("template1")).toBeInstanceOf(
    Object
  );
  expect(exposedPorts.getExposedPortsByTemplate("template2")).toBe(undefined);
  expect(exposedPorts.getExposedPortsByTemplate("template3")).toBe(undefined);
});

test("Serialize TO db", () => {
  const exposedPorts = new Manager("exposedPorts", ExposedPorts);

  exposedPorts.toggleExposedPort("template1", "nodeInstance1", "port1");
  exposedPorts.toggleExposedPort("template1", "nodeInstance1", "port2");
  exposedPorts.toggleExposedPort("template1", "nodeInstance2", "port1");
  exposedPorts.toggleExposedPort("template2", "nodeInstance3", "port1");

  const expected = {
    template1: {
      nodeInstance1: ["port1", "port2"],
      nodeInstance2: ["port1"]
    },
    template2: {
      nodeInstance3: ["port1"]
    }
  };

  expect(exposedPorts.serializeToDB()).toMatchObject(expected);
});

test("Serialize OF db", () => {
  const content = {
    nodeTemplate1: {
      nodeInst1: ["p1/in"],
      nodeInst2: ["p1/in", "p2/out"]
    },
    nodeTemplate2: {
      nodeInst3: ["p1/in"]
    }
  };

  const expected = {
    nodeTemplate1: {
      nodeInst1: {
        name: "nodeInst1",
        ports: ["p1/in"]
      },
      nodeInst2: {
        name: "nodeInst2",
        ports: ["p1/in", "p2/out"]
      }
    },
    nodeTemplate2: {
      nodeInst3: {
        name: "nodeInst3",
        ports: ["p1/in"]
      }
    }
  };

  const data = Manager.serializeOfDB(content, ExposedPorts);

  expect(data).toMatchObject(expected);
});

test("Set data and serialize", () => {
  const content = {
    nodeTemplate1: {
      nodeInst1: ["p1/in"],
      nodeInst2: ["p1/in", "p2/out"]
    },
    nodeTemplate2: {
      nodeInst3: ["p1/in"]
    }
  };

  const data = Manager.serializeOfDB(content, ExposedPorts);

  const expected = {
    nodeTemplate1: {
      nodeInst1: {
        name: "nodeInst1",
        ports: ["p1/in"]
      },
      nodeInst2: {
        name: "nodeInst2",
        ports: ["p1/in", "p2/out"]
      }
    },
    nodeTemplate2: {
      nodeInst3: {
        name: "nodeInst3",
        ports: ["p1/in"]
      }
    }
  };

  const obj = new Manager("exposedPort", ExposedPorts);
  obj.setData(data);

  expect(obj.serialize()).toMatchObject(expected);
});
