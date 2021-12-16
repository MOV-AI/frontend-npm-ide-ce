import Node from "./Node";

test("smoke test", () => {
  const obj = new Node();

  expect(obj).toBeInstanceOf(Node);
});

test("serialize OF db", () => {
  const data = {
    Label: "align_with_cart",
    LastUpdate: {
      date: "02/07/2021 at 17:26:35",
      user: "movai"
    },
    Path: "/op/node.sh",
    Info: "State node to perform full alignment procedure given that the tugbot is already in the position with the back facing the cart. The steps in the node are as follows:\n1) Open and center the gripper\n2) Align with the cart -> can transition from timeout\n3) Grab the cart\n4) Move forward\n5) Regrab the cart -> can transition from failed",
    Type: "MovAI/State",
    Persistent: false,
    PackageDepends: "",
    Remappable: false,
    Launch: false,
    Parameter: {
      move_distance: {
        Value: "0.2",
        Description:
          "[Float] Distance in meters to move forward with the cart before regrabbing"
      },
      detection_type: {
        Value: "gentag",
        Description:
          "[Sring] Type of detection to be used. Can be either tag or cart_detector"
      }
    },
    CmdLine: {
      cmd1: {
        Value: "exec.sh",
        Description: ""
      }
    },
    EnvVar: {
      varA: {
        Value: "/opt/movai",
        Description: ""
      }
    }
  };

  const expected = {
    name: data.Label,
    details: data.LastUpdate,
    path: data.Path,
    info: data.Info,
    persistent: data.Persistent,
    launch: data.Launch,
    remappable: data.Remappable,
    parameters: {
      move_distance: {
        name: "move_distance",
        value: "0.2",
        description: data.Parameter.move_distance.Description,
        type: "any"
      },
      detection_type: {
        name: "detection_type",
        value: "gentag",
        description: data.Parameter.detection_type.Description,
        type: "any"
      }
    },
    envVars: { varA: { name: "varA", value: "/opt/movai" } },
    commands: { cmd1: { name: "cmd1", value: "exec.sh" } }
  };

  expect(Node.serializeOfDB(data)).toMatchObject(expected);
});

test("serialize TO db", () => {
  const obj = new Node();

  const data = {
    name: "align_with_cart",
    details: {
      date: "02/07/2021 at 17:26:35",
      user: "movai"
    },
    path: "/op/node.sh",
    info: "State node to perform full alignment procedure given that the tugbot is already in the position with the back facing the cart. The steps in the node are as follows:\n1) Open and center the gripper\n2) Align with the cart -> can transition from timeout\n3) Grab the cart\n4) Move forward\n5) Regrab the cart -> can transition from failed",
    type: "MovAI/State",
    persistent: false,
    packageDep: "package1",
    launch: false,
    remappable: false,
    parameters: {
      move_distance: {
        name: "move_distance",
        value: "0.2",
        description:
          "[Float] Distance in meters to move forward with the cart before regrabbing",
        type: "any"
      },
      detection_type: {
        name: "detection_type",
        value: "gentag",
        description:
          "[Sring] Type of detection to be used. Can be either tag or cart_detector",
        type: "any"
      }
    },
    envVars: { varA: { name: "varA", value: "/opt/movai" } },
    commands: { cmd1: { name: "cmd1", value: "exec.sh" } }
  };

  obj.setData(data);

  const expected = {
    Label: data.name,
    LastUpdate: data.details,
    Path: data.path,
    Info: data.info,
    Type: data.type,
    Persistent: data.persistent,
    PackageDepends: data.packageDep,
    Remappable: data.remappable,
    Launch: data.launch,
    Parameter: {
      move_distance: {
        Value: "0.2",
        Description: data.parameters.move_distance.description
      },
      detection_type: {
        Value: "gentag",
        Description: data.parameters.detection_type.description
      }
    },
    CmdLine: {
      cmd1: {
        Value: "exec.sh"
      }
    },
    EnvVar: {
      varA: {
        Value: "/opt/movai"
      }
    }
  };

  expect(obj.serializeToDB(data)).toMatchObject(expected);
});
