import { DATA_TYPES } from "../../../../utils/Constants";

const flows = {
  test1: {
    Label: "test11",
    Description: "Some nice description",
    LastUpdate: { date: "14/12/2021 at 22:34:09", user: "movai" },
    NodeInst: {
      align: {
        Template: "align_cart",
        NodeLabel: "align",
        Persistent: true,
        Launch: true,
        Remappable: true,
        NodeLayers: ["0"],
        CmdLine: { cmd1: { Value: "exec.sh" } },
        EnvVar: { path: { Value: "/opt/movai" } },
        Visualization: {
          y: { Value: 0.01 },
          x: { Value: 0.023333333333333334 }
        },
        Parameter: {
          camera: { Value: "back1", Type: DATA_TYPES.ANY },
          move_distance_to_car: { Value: "0.30", Type: DATA_TYPES.ANY }
        }
      }
    },
    Container: {
      subflow: {
        ContainerLabel: "subflow",
        ContainerFlow: "tugbot_actuators",
        Visualization: {
          x: { Value: 0.04133333333333333 },
          y: { Value: 0.015466666666666667 }
        },
        Parameter: { varA: { Value: "5", Type: DATA_TYPES.ANY } }
      }
    },
    Links: {
      "71e3bc41-ddc0-42c0-b9f3-68b41cb1ebd3": {
        From: "start/start/start",
        To: "align/trans/in"
      },
      "910c8964-2375-4697-806c-fcffc88bb5b2": {
        From: "align/transFor/out",
        To: "subflow__actuator_v2/trans_in/in"
      }
    },
    Layers: { 0: { name: "layer1", on: true } },
    Parameter: {
      var1: { Value: "movai", Description: "", Type: DATA_TYPES.ANY }
    }
  },
  test2: {
    Label: "test",
    Info: "Some info",
    Description: "This is some description",
    User: "movai",
    LastUpdate: "20/04/2021 at 10:41:11",
    NodeInst: {
      align: {
        Template: "align_cart",
        NodeLabel: "align",
        NodeLayers: [],
        Visualization: {
          y: { Value: 0.02011501921062771 },
          x: { Value: 0.022897170968381453 }
        }
      },
      viewer: {
        Template: "actuator_client_test",
        NodeLabel: "viewer",
        NodeLayers: [],
        Visualization: {
          x: { Value: 0.033985346476236994 },
          y: { Value: 0.021107220458984385 }
        }
      }
    }
  },
  test3: {
    Label: "test3",
    Description: "This is some description",
    User: "movai",
    LastUpdate: { date: "11/01/2021 at 17:37:48", user: "movai" },
    NodeInst: {
      cfeee: {
        Template: "cart_lost",
        NodeLabel: "cfeee",
        CmdLine: {},
        EnvVar: {},
        Visualization: { y: { Value: 344 }, x: { Value: 907 } },
        Parameter: {}
      },
      zzz: {
        Template: "aa",
        NodeLabel: "zzz",
        CmdLine: {},
        EnvVar: {},
        Visualization: {
          y: { Value: 0.018466666666666666 },
          x: { Value: 0.009600000000000001 }
        },
        Parameter: {}
      },
      ff: {
        Template: "apriltag_ros",
        NodeLabel: "ff",
        CmdLine: {},
        EnvVar: {},
        Visualization: {
          x: { Value: 0.019933333333333334 },
          y: { Value: 0.024733333333333333 }
        },
        Parameter: {}
      },
      test: {
        Template: "a1",
        NodeLabel: "test",
        CmdLine: {},
        EnvVar: {},
        Visualization: {
          y: { Value: 0.018466666666666666 },
          x: { Value: 0.020066666666666667 }
        },
        Parameter: {
          param1: { Value: "$(var Robot.testing1)" },
          test: { Value: "$(flow myvar)" },
          wait_time: { Value: "$(var fleet.qwerty)" },
          mytest: { Value: "1" }
        }
      },
      hhh: {
        Template: "cart_lost",
        NodeLabel: "hhh",
        CmdLine: {},
        EnvVar: {},
        Visualization: {
          y: { Value: 0.027082401529947918 },
          x: { Value: 0.035989770507812505 }
        },
        Parameter: {}
      }
    },
    Container: {
      cacaca: {
        ContainerLabel: "cacaca",
        ContainerFlow: "a3",
        Visualization: [0.028133333333333333, 0.0082],
        Parameter: { varA: { Value: "2333" } }
      }
    },
    ExposedPorts: { test3: { test: ["varsub2/in", "p1/in"] } },
    Links: {
      "ce8d8ce4-b9c7-4bc9-aed8-21916faf2e40": {
        From: "start/start/start",
        To: "cacaca__testing/p1/in"
      }
    },
    Layers: {
      0: { name: "mylayer", on: true },
      1: { name: "myLayer2", on: true },
      2: { name: "dfghjk", on: true }
    },
    Parameter: {
      myvar: { Value: "99879", Description: "myvar" },
      var_flow_a1: { Value: "3223", Description: "" }
    }
  }
};

export default flows;
