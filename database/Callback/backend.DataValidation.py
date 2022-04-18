"""
   Copyright (C) Mov.ai  - All Rights Reserved
   Unauthorized copying of this file, via any medium is strictly prohibited
   Proprietary and confidential

"""

import re
try:
    from dal.scopes import ScopesTree
except ImportError:
    from movai.data import ScopesTree


def validate_configuration(config_string):
    """
    Validate a configuration with configuration string.

    Keyword arguments:
    config_string -- string of form '$(config <name>(.<key>*))' 

    """
    try:
        regex = r"^\$\(config \w+(\.\w+)*\)$"
        matches = re.finditer(regex, config_string, re.MULTILINE)
        matches_size = len([x for x in matches])
        if matches_size == 0:
            return False
        config_key_path = config_string.replace("$(config ","").replace(")", "").split(".")
        config_name = config_key_path[0]
        config_key_path.pop(0)
        config = ScopesTree()().Configuration[config_name]
        val = config.get_value()
        for key in config_key_path:
            val = val[key]
        return True
    except Exception as e:
        print("Caught exception", e)
        return False


key2action_map = {
    "validateConfiguration": validate_configuration,
}

try:
    response = {"success": True}
    response["result"] = key2action_map[msg["func"]](msg["args"])

except Exception as e:
    response = {"success": False, "error": str(e)}