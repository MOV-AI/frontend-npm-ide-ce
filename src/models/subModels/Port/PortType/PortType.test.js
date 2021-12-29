import PortType from "./PortType";

test("smoke test", () => {
  const obj = new PortType();

  expect(obj).toBeInstanceOf(PortType);
});

test("serialize to DB", () => {
  const port = new PortType();

  const data = {
    name: "out",
    message: "movai_msgs/TF",
    parameters: {
      Child: "camera_link",
      Parent: "tag"
    }
  };
  port.setData(data);

  const expected = {
    Message: "movai_msgs/TF",
    Parameter: {
      Child: "camera_link",
      Parent: "tag"
    }
  };

  expect(port.serializeToDB()).toMatchObject(expected);
});

test("serialize OF db", () => {
  const content = {
    out: {
      Message: "movai_msgs/TF",
      Parameter: {
        Child: "camera_link",
        Parent: "tag"
      }
    }
  };

  const expected = {
    name: "out",
    message: content.out.Message,
    parameters: content.out.Parameter
  };

  const data = PortType.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});
