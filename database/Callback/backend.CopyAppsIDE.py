"""
   Copyright (C) Mov.ai  - All Rights Reserved
   Unauthorized copying of this file, via any medium is strictly prohibited
   Proprietary and confidential

   Developers:
   - Manuel Silva  (manuel.silva@mov.ai) - 2021
"""

def copy (scope, from_id, to_name, workspace="global"):
    response = {"success": False}
    
    try:
        
        # check if the a document with name 'to_name' already exists
        if scopes().list_versions(scope=scope, ref=to_name):
        
            error_msg = f"{scope} {to_name} already exists"
            raise KeyError(error_msg)
        
        # get the document to copy
        to_copy = getattr(scopes(), scope)[from_id]

        data = to_copy.serialize()
        data["Label"] = to_name

        # create the new document
        scopes(workspace=workspace).write(data, version="_unversioned_", ref=to_name, scope=scope)
        
        response = {"success": True}
    
    except Exception:
        raise

    return response
    
# ----------------------------------------------------------------------
key2action_map = {
	"copy"   : copy
}

try:
    key = msg["func"]
    args = msg["args"]
    
    response = {"success": True}

    if isinstance(args, list):
        response["result"] = key2action_map[key](*args)
    else:
        response["result"] = key2action_map[key](args)

except Exception as e:
    import traceback
    traceback.print_exc()
    exc_result = f"{type(e).__name__} {str(e)}"
    
    response = {"success": False, "error": exc_result}
