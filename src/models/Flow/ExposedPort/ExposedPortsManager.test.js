import ExposedPorts from "./ExposedPortsManager";
import NodeExposedPorts from "./NodeExposedPorts";

test("toggle existing exposed port", () => {
  const ports = new ExposedPorts();

  debugger;
  ports.toggleExposedPort("testTemplate", "testNode", "testPort");

  const expected = ports.getExposedPortsByTemplate("testTemplate");

  expect(expected).toBeInstanceOf(Object);
});

test("remove empties", () => {
  const exposedPorts = new ExposedPorts();

  const empty = new NodeExposedPorts({ name: "nodeInst2" });
  const notEmpty = new NodeExposedPorts({ name: "nodeInst1" });
  notEmpty.togglePort("somePort");

  exposedPorts.ports.set("template1", { nodeInst1: notEmpty });
  exposedPorts.ports.set("template2", { nodeInst2: empty });
  exposedPorts.ports.set("template3", {});

  exposedPorts.removeEmpties();

  expect(exposedPorts.getExposedPortsByTemplate("template1")).toBeInstanceOf(
    Object
  );
  expect(exposedPorts.getExposedPortsByTemplate("template2")).toBe(undefined);
  expect(exposedPorts.getExposedPortsByTemplate("template3")).toBe(undefined);
});

test("serialize to DB", () => {
  const exposedPorts = new ExposedPorts();

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
