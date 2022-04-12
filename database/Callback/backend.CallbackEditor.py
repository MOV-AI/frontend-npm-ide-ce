# required keys:
#    func - name of the method to call
# optional keys:
#    args - dictionary to pass to method (positional arguments not allowed)
#
# curl example with localhost server 
#    curl -d "{\"func\":\"get_msg_struct\", \"args\":{\"message\": \"geometry_msgs/Twist\"}}" -X POST http://localhost:5003/api/v1/function/SERVER3_CODEEDITOR2/

def get_all_libraries(*args, **kwargs):
    print("Get all libraries called")
    return Callback.fetch_modules_api()

def get_messages(*args, **kwargs):
    return Message.fetch_portdata_messages()
    
def handle_exception(exception):
    exc_classname = e.__class__.__name__
    handle_map = {
        "IndentationError" : ["filename", "lineno", "msg", "offset", "text"], 
        "SyntaxError" : ["filename", "lineno", "msg", "offset", "text"]
    }
    handler = lambda e, names : {name: getattr(e, name) for name in names}
    
    if exc_classname in handle_map:
        return {"type": exc_classname, "data": handler(e, handle_map[exc_classname])}
    raise exception


responses = {
    "get_all_libraries"  : get_all_libraries,
    "get_messages"   : get_messages,
}

try:
    key = msg["func"]
    args = msg.get("args", {})
    response = {"func": key, "result": responses[key](**args), "success": True}
except Exception as e:
    exc_result = handle_exception(e)
    response = {"success": False, "error": exc_result}
