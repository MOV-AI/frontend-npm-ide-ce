import Manager from "../../Manager";
import Port from "./Port";

test("Smoke test", () => {
  const obj = new Port();

  expect(obj).toBeInstanceOf(Port);
  expect(obj.getPortOut()).toBeInstanceOf(Manager);
  expect(obj.getPortIn()).toBeInstanceOf(Manager);
});

test("Serialize TO DB", () => {
  const port = new Port();

  const data = {
    name: "tag_tf",
    description: "some info",
    template: "ROS1/TFPublisher",
    message: "TF",
    msgPackage: "movai_msgs",
    portOut: {
      out: {
        name: "out",
        message: "movai_msgs/TF",
        parameters: {
          Child: "camera_link",
          Parent: "tag"
        }
      }
    }
  };
  port.setData(data);

  const expected = {
    Template: "ROS1/TFPublisher",
    Info: "some info",
    Package: "movai_msgs",
    Message: "TF",
    Out: {
      out: {
        Message: "movai_msgs/TF",
        Parameter: {
          Child: "camera_link",
          Parent: "tag"
        }
      }
    }
  };

  expect(port.serializeToDB()).toMatchObject(expected);
});

test("Serialize OF db", () => {
  const name = "tag_tf";
  const content = {
    [name]: {
      Template: "ROS1/TFPublisher",
      Info: "some info",
      Package: "movai_msgs",
      Message: "TF",
      Out: {
        out: {
          Message: "movai_msgs/TF",
          Parameter: {
            Child: "camera_link",
            Parent: "tag"
          }
        }
      }
    }
  };

  const expected = {
    name: name,
    description: content[name].Info,
    template: content[name].Template,
    message: content[name].Message,
    portOut: {
      out: {
        name: "out",
        message: content[name].Out.out.Message,
        parameters: content[name].Out.out.Parameter
      }
    }
  };

  const data = Port.serializeOfDB(content);

  expect(data).toMatchObject(expected);
});
