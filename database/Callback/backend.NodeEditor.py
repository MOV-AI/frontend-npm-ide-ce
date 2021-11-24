"""
   Copyright (C) Mov.ai  - All Rights Reserved
   Unauthorized copying of this file, via any medium is strictly prohibited
   Proprietary and confidential
   Developers:
   - Pedro Cristóvão (pedro.cristovao@mov.ai) - 2020
   - Vicente Queiroz (vicente.queiroz@mov.ai) - 2020
"""
from movai.data.scope import ScopesTree

def get_filtered_callbacks(workspace, message_type=None):
    index = 0
    scopeIndex = -1
    answer = []
    message_type_predicate = (lambda msg_type: True) if not message_type else (lambda msg_type: msg_type == message_type)
    my_scope = ScopesTree()(workspace=workspace)
    
    for cb_scope in my_scope.list_scopes(scope="Callback"):
        firstTime = True
        for cb_version in my_scope.list_versions(scope="Callback", ref=cb_scope['ref']):
            callback = my_scope.Callback[cb_scope['ref'], cb_version['tag']]
            if message_type_predicate(callback.Message):
                if workspace == "global":
                    answer.append(get_callback_struct(cb_scope, callback, index, False))
                    index = index + 1
                else:
                    if firstTime:
                        scopeIndex = scopeIndex + 1
                        answer.append(get_callback_struct(cb_scope, callback, scopeIndex, True))
                        answer[scopeIndex]["children"].append(get_version_struct(cb_version))
                        firstTime = False
                    else:
                        answer[scopeIndex]["children"].append(get_version_struct(cb_version))

    return answer

def get_callback_struct(callback_scope, callback, index, hasChildren):
    if hasChildren:
        return {
            'id': index,
            'name': callback_scope['ref'],
            'url': callback_scope['url'],
            'children': []
        }
    else:
        return {
            'id': index,
            'name': callback_scope['ref'],
            'url': callback_scope['url'],
        }       

def get_version_struct(callback):
    return {
        'id': callback['tag'],
        'name': callback['tag'],
        'url': callback['url'],
    }

# Main
key2action_map = {
    "getFilteredCallbacks": get_filtered_callbacks
}

func, args = msg['func'], msg["args"]
print("function called...", func)
print("with args...", args)
try:
    response = {"success": True}
    if isinstance(args, list):
        response["result"] = key2action_map[func](*args)
    else:
        response["result"] = key2action_map[func](args)
except Exception as e:
    logger.error("Exception caught at backend.NodeEditor" + str(e))
    response = {"success": False, "error": "Exception caught at backend.NodeEditor, please check logs"}