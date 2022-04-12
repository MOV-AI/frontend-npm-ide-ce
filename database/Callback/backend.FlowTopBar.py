"""
   Copyright (C) Mov.ai  - All Rights Reserved
   Unauthorized copying of this file, via any medium is strictly prohibited
   Proprietary and confidential

   Developers:
   - Vicente Queiroz (vicente.queiroz@mov.ai) - 2020

"""


def get_default_robot(msg):
    return {"robotName": Robot.name, "robotIP": Robot.IP}


def send_to_robot(msg):
    action_name = msg[0]
    flow_name = msg[1]
    robot_name = msg[2]

    if robot_name == "Default":
        robot = Robot
    else:
        robot = FleetRobot(robot_name)
    robot.send_cmd(command=action_name, flow=flow_name)
    return True


def command_node(msg):
    if msg["robotName"] == "Default":
        robot = Robot
    else:
        robot = FleetRobot(msg["robotName"])
    robot.send_cmd(command=msg["command"], node=msg["nodeName"])


key2action_map = {
    "getDefaultRobot": get_default_robot,
    "sendToRobot": send_to_robot,
    "commandNode": command_node,
}

try:
    response = {"success": True}
    response["result"] = key2action_map[msg["func"]](msg["args"])

except Exception as e:
    response = {"success": False, "error": str(e)}