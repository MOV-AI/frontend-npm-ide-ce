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
          camera: { Value: "back1", Type: "any" },
          move_distance_to_car: { Value: "0.30", Type: "any" }
        }
      }
    },
    Container: {
      subflow: {
        ContainerLabel: "subflow",
        ContainerFlow: "tugbot_actuators",
        Visualization: [0.04133333333333333, 0.015466666666666667],
        Parameter: { varA: { Value: "5", Type: "any" } }
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
    Parameter: { var1: { Value: "movai", Description: "", Type: "any" } }
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
  }
};

export default flows;
