import Manager from "./Manager";
import PyLib from "../Callback/PyLib/PyLib";

test("Smoke test", () => {
  const obj = new Manager();

  expect(obj).toBeInstanceOf(Manager);
});

test("Serialize OF db", () => {
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

test("Serialize TO db", () => {
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
