import Flow from "./Flow";
import flows from "./__mock__/data/flows";

test("Smoke test", () => {
  const obj = new Flow();

  expect(obj).toBeInstanceOf(Flow);
});

test("Serialize OF db", () => {
  const content = flows.test1;

  const expected = {
    name: "test11",
    description: "Some nice description",
    details: { date: "14/12/2021 at 22:34:09", user: "movai" },
    nodeInstances: {
      align: {
        template: "align_cart",
        name: "align",
        persistent: true,
        launch: true,
        remappable: true,
        groups: ["0"],
        commands: {
          cmd1: { value: "exec.sh" }
        },
        envVars: {
          path: { value: "/opt/movai" }
        },
        position: {
          y: 0.01,
          x: 0.023333333333333334
        },
        parameters: {
          camera: { value: "back1", type: "any" },
          move_distance_to_car: { value: "0.30", type: "any" }
        }
      }
    },
    subFlows: {
      subflow: {
        name: "subflow",
        template: "tugbot_actuators",
        position: {
          x: 0.04133333333333333,
          y: 0.015466666666666667
        },
        parameters: {
          varA: { value: "5", type: "any" }
        }
      }
    },
    links: {
      "71e3bc41-ddc0-42c0-b9f3-68b41cb1ebd3": {
        from: "start/start/start",
        to: "align/trans/in"
      },
      "910c8964-2375-4697-806c-fcffc88bb5b2": {
        from: "align/transFor/out",
        to: "subflow__actuator_v2/trans_in/in"
      }
    },
    groups: { 0: { id: "0", name: "layer1", enabled: true } },
    parameters: {
      var1: { value: "movai", description: "", type: "any" }
    }
  };

  const data = Flow.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});

test("Serialize TO db", () => {
  const content = flows.test1;

  const obj = new Flow();
  obj.setData(Flow.serializeOfDB(content));

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("Get exposed ports", () => {
  const content = flows.test3;

  const obj = new Flow();
  obj.setData(Flow.serializeOfDB(content));

  const data = obj.serializeToDB();

  expect(data.ExposedPorts).toMatchObject(content.ExposedPorts);
});
