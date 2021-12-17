import PyLibManager from "./PyLibManager";
import PyLib from "./PyLib";

test("smoke test", () => {
  const obj = new PyLibManager();

  expect(obj).toBeInstanceOf(PyLibManager);
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

  const data = PyLibManager.serializeOfDB(content);

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

  const data = PyLibManager.serializeOfDB(content);

  const obj = new PyLibManager();
  expect(obj).toBeInstanceOf(PyLibManager);

  obj.setData(data);
  expect(obj.getPyLib("Duration")).toBeInstanceOf(PyLib);
  expect(obj.getPyLib("Duration").getModule()).toBe("rospy");

  expect(obj.serializeToDB()).toMatchObject(content);
});
