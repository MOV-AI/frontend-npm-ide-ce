def generate_path(scene, initial_pose, final_pose, robot_config):
    step_size = 0.1
    max_radius = 1.0
    scene_name = scene

    in_pos = initial_pose['position']
    in_ori = initial_pose['orientation']
    in_yaw = 2 * numpy.arctan2(in_ori['z'], in_ori['w'])
    q0 = (in_pos['x'], in_pos['y'], in_yaw)
    
    out_pos = final_pose['position']
    out_ori = final_pose['orientation']
    out_yaw = 2 * numpy.arctan2(out_ori['z'], out_ori['w'])
    q1 = (out_pos['x'], out_pos['y'], out_yaw)
    
    
    path = shortest_path(q0, q1, max_radius)
    configurations, _ = path.sample_many(step_size)
    
    poses = []
    for i in range(0, len(configurations)):
        theta = configurations[i][1]
        quat = [0.0, 0.0, numpy.sin(theta / 2), numpy.cos(theta / 2)]
        pose = {
            "position": {
                "x":configurations[i][0],
                "y":configurations[i][1],
                "z": 0.0
            },
            "orientation": {
                "x": quat[0],
                "y": quat[1],
                "z": quat[2],
                "w": quat[3]
            }
        }
        poses.append({"pose": pose})
    return {"poses": poses}

key2action_map = {"generate_path": generate_path }

key, args = msg['func'], msg["args"]
print("generate_path...", key, args)
try:
    response = {"success": True}
    if isinstance(args, list):
        response["result"] = key2action_map[key](*args)
    else:
        response["result"] = key2action_map[key](args)
except Exception as e:
    print("Caught exception", e)
    response = {"success": False, "error": str(e)}