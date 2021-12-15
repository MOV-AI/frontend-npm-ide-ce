import SubFlowManager from "./SubFlowManager";
import SubFlow from "./SubFlow";

test("smoke test", () => {
  const obj = new SubFlowManager();

  expect(obj).toBeInstanceOf(SubFlowManager);
});

test("serialize OF db", () => {
  const content = {
    align: {
      ContainerFlow: "align_cart",
      ContainerLabel: "align",
      Visualization: [0.01, 0.02],
      Parameter: {
        camera: { Value: "back1", Type: "any" },
        move_distance_to_car: { Value: "0.30", Type: "number" }
      }
    }
  };

  const expected = {
    align: {
      template: content.align.ContainerFlow,
      name: content.align.ContainerLabel,
      position: { x: 0.01, y: 0.02 },
      parameters: {
        camera: { name: "camera", value: "back1", type: "any" },
        move_distance_to_car: {
          name: "move_distance_to_car",
          value: "0.30",
          type: "number"
        }
      }
    }
  };

  const data = SubFlowManager.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});

test("serialize TO db", () => {
  const content = {
    align: {
      ContainerFlow: "align_cart",
      ContainerLabel: "align",
      Visualization: [0.01, 0.02],
      Parameter: {
        camera: { Value: "back1", Type: "any" }
      }
    }
  };

  const data = SubFlowManager.serializeOfDB(content);

  const obj = new SubFlowManager();

  obj.setData(data);
  expect(obj.getSubFlow("align")).toBeInstanceOf(SubFlow);
  expect(obj.getSubFlow("align").getTemplate()).toBe(
    content.align.ContainerFlow
  );

  expect(obj.serializeToDB()).toMatchObject(content);
});

test("get a subflow instance", () => {
  const obj = new SubFlowManager();

  const content = {
    ContainerLabel: "test",
    ContainerFlow: "test",
    Visualization: [9, 9]
  };

  obj.setSubFlow({ name: content.ContainerLabel, content });

  const subflow = obj.getSubFlow(content.ContainerLabel);

  expect(subflow).toBeInstanceOf(SubFlow);
});

test("add a subflow instance", () => {
  const nodes = new SubFlowManager();
  const subflowName = "test";

  const content = {
    name: subflowName,
    template: "test",
    position: { x: 5, y: 5 }
  };

  nodes.setSubFlow({ name: subflowName, content });

  expect(nodes.getSubFlow(subflowName)).toBeInstanceOf(SubFlow);
  expect(nodes.getSubFlow(subflowName).getName()).toBe(subflowName);
  expect(nodes.getSubFlow(subflowName).getTemplate()).toBe(content.template);
  expect(nodes.getSubFlow(subflowName).getPosition()).toMatchObject(
    content.position
  );
});

test("delete a subflow instance", () => {
  const nodes = new SubFlowManager();
  const subflowName = "test";

  const content = {
    ContainerLabel: subflowName,
    ContainerFlow: "test",
    Visualization: [5, 5]
  };

  nodes.setSubFlow({ name: subflowName, content });
  nodes.deleteSubFlow(subflowName);

  expect(nodes.checkExists(subflowName)).toBe(false);
});

test("update a subflow instance", () => {
  const nodes = new SubFlowManager();
  const subflowName = "test";

  const content = {
    ContainerLabel: subflowName,
    ContainerFlow: "test",
    Visualization: [5, 5]
  };

  const newPosition = { x: 99, y: 99 };

  nodes.setSubFlow({ name: subflowName, content });

  nodes.updateSubFlow({
    name: subflowName,
    content: { position: newPosition }
  });

  expect(nodes.getSubFlow(subflowName).getPosition()).toMatchObject(
    newPosition
  );
});
