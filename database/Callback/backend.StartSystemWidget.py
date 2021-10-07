"""
   Copyright (C) Mov.ai  - All Rights Reserved
   Unauthorized copying of this file, via any medium is strictly prohibited
   Proprietary and confidential

   Developers:
   - Vicente Queiroz (vicente.queiroz@mov.ai) - 2020

"""

action_name = msg['args'][0]
flow_name = msg['args'][1]['Value']
robot_name = msg['args'][2]['Value']

if flow_name != None:

    if robot_name == "":
        robot = Robot
    else:
        robot = FleetRobot(robot_name)

    robot.send_cmd(command=action_name, flow=flow_name)
