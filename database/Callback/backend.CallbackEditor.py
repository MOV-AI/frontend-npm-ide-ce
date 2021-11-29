# required keys:
#    func - name of the method to call
# optional keys:
#    args - dictionary to pass to method (positional arguments not allowed)
#
# curl example with localhost server 
#    curl -d "{\"func\":\"get_msg_struct\", \"args\":{\"message\": \"geometry_msgs/Twist\"}}" -X POST http://localhost:5003/api/v1/function/SERVER3_CODEEDITOR2/

def get_libraries(*args, **kwargs):
    return Callback.get_modules()

def init(*args, **kwargs):
    Callback.export_modules()
    return True

def get_all_libraries(*args, **kwargs):
    print("Get all libraries called")
    return Callback.fetch_modules_api()

def get_messages(*args, **kwargs):
    return Message.fetch_portdata_messages()
    
def get_msg_struct(*, message, **kwargs):
    return Message.get_structure(message)

def describe_module(*, module, **kwargs):
    required = ["name", "toSelect"]
    if not all(x in module for x in required):
        return False
    to_return = {
        "module"   : Callback.get_methods(module["name"]),
        "toSelect" : module["toSelect"],
        "name"     : module["name"]
    }
    return to_return
    
    # check if useful
    for x in module:
        if not x in required:
            to_return[x] = module[x]
    for element_name in dir(mymodule):
        element = getattr(mymodule, element_name)
        el = {
            'value': element_name,
            'label': element_name,
            'name' : element_name,
        }
        if inspect.isclass(element):
             try:
                 to_return['classes'].append(el)
             except:
                 print("ERROR CLASSES")
        elif inspect.ismodule(element):
            continue
        elif hasattr(element, '__call__'):
            if inspect.isbuiltin(element):
                try:
                    to_return['builtin_functions'].append(el)
                except:
                    print("ERROR BUILT-IN FUNCTION")
            else:
                try:
                    to_return['functions'].append(el)
                except:
                    print("ERROR FUNCTION")
                    pass
        else:
            try:
                to_return['values'].append(el)
            except:
                print("ERROR VALUES")
    return to_return
    
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
    "init": init,
    "get_libraries"  : get_libraries,
    "get_all_libraries"  : get_all_libraries,
    "get_messages"   : get_messages,
    "get_msg_struct" : get_msg_struct,
    "library"        : describe_module,
}

print("MSG",msg)

try:
    key = msg["func"]
    args = msg.get("args", {})
    response = {"func": key, "result": responses[key](**args), "success": True}
except Exception as e:
    exc_result = handle_exception(e)
    response = {"success": False, "error": exc_result}
