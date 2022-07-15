import { DATA_TYPES } from "../../../../utils/Constants";
import Manager from "../../../Manager";
import SubFlow from "./SubFlow";

test("Smoke test", () => {
  const obj = new Manager("subFlows", SubFlow, {});

  expect(obj).toBeInstanceOf(Manager);
});

test("Serialize OF db", () => {
  const content = {
    align: {
      ContainerFlow: "align_cart",
      ContainerLabel: "align",
      Visualization: [0.01, 0.02],
      Parameter: {
        camera: { Value: "back1", Type: DATA_TYPES.ANY },
        move_distance_to_car: { Value: "0.30", Type: DATA_TYPES.NUMBER }
      }
    }
  };

  const expected = {
    align: {
      template: content.align.ContainerFlow,
      name: content.align.ContainerLabel,
      position: { x: 0.01, y: 0.02 },
      parameters: {
        camera: { name: "camera", value: "back1", type: DATA_TYPES.ANY },
        move_distance_to_car: {
          name: "move_distance_to_car",
          value: "0.30",
          type: DATA_TYPES.NUMBER
        }
      }
    }
  };

  const data = Manager.serializeOfDB(content, SubFlow);

  expect(data).toMatchObject(expected);
});

test("Serialize TO db", () => {
  const content = {
    align: {
      ContainerFlow: "align_cart",
      ContainerLabel: "align",
      Visualization: {
        x: { Value: 0.01 },
        y: { Value: 0.02 }
      },
      Parameter: {
        camera: { Value: "back1", Type: DATA_TYPES.ANY }
      }
    }
  };

  const data = Manager.serializeOfDB(content, SubFlow);

  const obj = new Manager("subFlows", SubFlow, {});

  obj.setData(data);
  expect(obj.getItem("align")).toBeInstanceOf(SubFlow);
  expect(obj.getItem("align").getTemplate()).toBe(content.align.ContainerFlow);

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("Get a subflow instance", () => {
  const obj = new Manager("subFlows", SubFlow, {});

  const content = {
    ContainerLabel: "test",
    ContainerFlow: "test",
    Visualization: [9, 9]
  };

  obj.setItem({ name: content.ContainerLabel, content });

  const subflow = obj.getItem(content.ContainerLabel);

  expect(subflow).toBeInstanceOf(SubFlow);
});

test("Add a subflow instance", () => {
  const nodes = new Manager("subFlows", SubFlow, {});
  const subflowName = "test";

  const content = {
    name: subflowName,
    template: "test",
    position: { x: 5, y: 5 }
  };

  nodes.setItem({ name: subflowName, content });

  expect(nodes.getItem(subflowName)).toBeInstanceOf(SubFlow);
  expect(nodes.getItem(subflowName).getName()).toBe(subflowName);
  expect(nodes.getItem(subflowName).getTemplate()).toBe(content.template);
  expect(nodes.getItem(subflowName).getPosition()).toMatchObject(
    content.position
  );
});

test("Delete a subflow instance", () => {
  const nodes = new Manager("subFlows", SubFlow, {});
  const subflowName = "test";

  const content = {
    ContainerLabel: subflowName,
    ContainerFlow: "test",
    Visualization: [5, 5]
  };

  nodes.setItem({ name: subflowName, content });
  nodes.deleteItem(subflowName);

  expect(nodes.checkExists(subflowName)).toBe(false);
});

test("Update a subflow instance", () => {
  const nodes = new Manager("subFlows", SubFlow, {});
  const subflowName = "test";

  const content = {
    ContainerLabel: subflowName,
    ContainerFlow: "test",
    Visualization: [5, 5]
  };

  const newPosition = { x: 99, y: 99 };

  nodes.setItem({ name: subflowName, content });

  nodes.updateItem({
    name: subflowName,
    content: { position: newPosition }
  });

  expect(nodes.getItem(subflowName).getPosition()).toMatchObject(newPosition);
});
