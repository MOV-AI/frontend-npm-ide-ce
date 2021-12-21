import Manager from "./Manager";
import PyLib from "../Callback/subModels/PyLib";

test("smoke test", () => {
  const obj = new Manager();

  expect(obj).toBeInstanceOf(Manager);
});

test("serialize OF db", () => {
  const content = {
    Duration: {
      Module: "rospy",
      Class: "Duration"
    },
    math: {
      Module: "math",
      Class: false
    }
  };

  const expected = {
    Duration: {
      name: "Duration",
      module: "rospy",
      libClass: "Duration"
    },
    math: {
      name: "math",
      module: "math",
      libClass: false
    }
  };

  const data = Manager.serializeOfDB(content, PyLib);

  expect(data).toMatchObject(expected);
});

test("serialize TO db", () => {
  const content = {
    Duration: {
      Module: "rospy",
      Class: "Duration"
    },
    math: {
      Module: "math",
      Class: false
    }
  };

  const data = Manager.serializeOfDB(content, PyLib);

  const obj = new Manager("pyLibs", PyLib);
  expect(obj).toBeInstanceOf(Manager);

  obj.setData(data);
  expect(obj.getItem("Duration")).toBeInstanceOf(PyLib);
  expect(obj.getItem("Duration").getModule()).toBe("rospy");

  expect(obj.serializeToDB()).toMatchObject(content);
});
