import { DATA_TYPES } from "../../../../../utils/Constants";
import { Manager } from "../../../../../models";
import Position from "../Position/Position";
import SubFlow from "./SubFlow";

test("Smoke test", () => {
  const obj = new SubFlow();

  expect(obj).toBeInstanceOf(SubFlow);
  expect(obj.getPosition()).toBeInstanceOf(Position);
  expect(obj.getParameters()).toBeInstanceOf(Manager);
});

test("Serialize OF db", () => {
  const data = {
    subflow: {
      ContainerLabel: "subflow",
      ContainerFlow: "tugbot_actuators",
      Visualization: [0.01, 0.02],
      Parameter: { varA: { Value: "5", Type: DATA_TYPES.ANY } }
    }
  };

  const expected = {
    name: data.subflow.ContainerLabel,
    template: data.subflow.ContainerFlow,
    position: { x: 0.01, y: 0.02 },
    parameters: {
      varA: { name: "varA", value: "5", type: DATA_TYPES.ANY }
    }
  };

  expect(SubFlow.serializeOfDB(data)).toMatchObject(expected);
});

test("Serialize TO db", () => {
  const data = {
    template: "align_cart",
    name: "align",
    position: { x: 0.01, y: 0.03 },
    parameters: {
      camera: { name: "camera", value: "back1", type: DATA_TYPES.ANY },
      move_distance_to_car: {
        name: "move_distance_to_car",
        value: "0.30",
        type: DATA_TYPES.NUMBER
      }
    }
  };

  const expected = {
    ContainerFlow: "align_cart",
    ContainerLabel: "align",
    Visualization: {
      x: { Value: 0.01 },
      y: { Value: 0.03 }
    },
    Parameter: {
      camera: { Value: "back1", Type: DATA_TYPES.ANY },
      move_distance_to_car: { Value: "0.30", Type: DATA_TYPES.NUMBER }
    }
  };

  const obj = new SubFlow();

  obj.setData(data);

  expect(obj.serializeToDB(data)).toMatchObject(expected);
});

test("Create subflow", () => {
  const content = {
    template: "align_cart",
    name: "align",
    position: [0.01, 0.03],
    parameters: {
      camera: { name: "camera", value: "back1", type: DATA_TYPES.ANY },
      move_distance_to_car: {
        name: "move_distance_to_car",
        value: "0.30",
        type: DATA_TYPES.NUMBER
      }
    }
  };

  const obj = new SubFlow();
  obj.setData(content);

  expect(obj.getName()).toBe(content.name);
  expect(obj.getTemplate()).toBe(content.template);
  expect(obj.getPosition()).toBeInstanceOf(Position);
});
