"""
   Copyright (C) Mov.ai  - All Rights Reserved
   Unauthorized copying of this file, via any medium is strictly prohibited
   Proprietary and confidential

   Developers:
   - Manuel Silva  (manuel.silva@mov.ai) - 2020
"""

from API2.Flow import Flow as DFlow  #deprecated Flow class
from API2.StateMachine import StateMachine as DStateMachine  #deprecated StateMachine class
from movai.data.scope import ScopesTree


'''
     Support to continue using the previous api
'''
def getCls(className):
    depClasses = {"Flow": DFlow, "StateMachine": DStateMachine}
    return depClasses[className]

def saveFlowLayers(flowId, layers, **ignore):
    """ Save the flow layers (Flow only)"""

    response = {"success": False}

    try:
        inst = getCls("Flow")(flowId)
        inst.Layers.update(layers)
        response = {"success": True}

    except Exception as e:
        raise

    return response

def deleteLayer(flowId, layer, **ignore):
    """ Delete specific layer and remove from NodeLayers (Flow only)"""

    response = {"success": False}

    try:
        flowInst = getCls("Flow")(flowId)
        if layer in flowInst.Layers:

            # delete the layer
            del flowInst.Layers[layer]

            # check if there are any nodes in the deleted layer
            for nodeName, nodeValue in flowInst.NodeInst.items():
                if nodeValue.NodeLayers:
                    if layer in nodeValue.NodeLayers:
                        newLayers = nodeValue.NodeLayers
                        newLayers.remove(layer)
                        nodeValue.NodeLayers = newLayers

        response = {"success": True}

    except Exception:
        raise

    return response
	
def deleteNodeInst(scope, flowId, nodeId, nodeType = "MovAI/State", **ignore):
    """ delete nodeInst or State and related links"""

    response = {"success": False}

    nodeInstNames = {"Flow": "NodeInst", "StateMachine": "State"}
    if nodeType == "MovAI/Flow":
        nodeInstNames["Flow"] = "Container"
    
    try:
        inst = getCls(scope)(flowId)
        inst.delete(nodeInstNames[scope], nodeId)
        response = {"success": True}

    except Exception as e:
        raise

    return response
	
def deleteLink(scope, flowId, linkId, **ignore):
    """ Delete the link """

    response = {"success": False}

    try:
        inst = getCls(scope)(flowId)
        if inst.delete_link(linkId):
            response["success"] = True
            response["id"] = linkId
            response["validate"] = inst.is_valid()
        else:
            raise Exception("Could not delete link")
            
    except KeyError:
        pass

    except Exception as e:
        raise

    return response
	
def addLink(scope, flowId, link, **ignore):
    """ Add a new link """

    response = {"links": {}, "validate": {}, "success": False}

    try:
        inst = getCls(scope)(flowId)
        res = inst.add_link(**link) # (_id, link)

        if len(res) == 2:
            response["success"] = True
            response["links"] = [{"name": res[0], "value": res[1]}]
            response["validate"] = inst.is_valid()
        else:
            raise Exception("Could not create link")
            
    except KeyError:
        pass

    except Exception:
        raise

    return response


def setNodePos(scope, flowId, nodeId, data, nodeType="", **ignore):
    ''' Set node new position '''

    nodeInstNames = {"Flow": "NodeInst", "StateMachine": "State"}
    response = {"success": False}

    try:
        obj = getCls(scope)(flowId)
        pos = (data.get("x", None), data.get("y", None))
        if pos[0] and pos[1]:
            # if the node is a Container
            if nodeType == "MovAI/Flow":
                nodeObj = getattr(obj, "Container")[nodeId]
                nodeObj.Visualization = [pos[0].get("Value", 0), pos[1].get("Value", 0)]
            else:
                nodeObj = getattr(obj, nodeInstNames[scope])[nodeId]
                nodeObj.Visualization["x"].Value = pos[0].get("Value", 0)
                nodeObj.Visualization["y"].Value = pos[1].get("Value", 0)
            response = {"success": True}
        else:
            response = {"success": False, "error": "Invalid position"}
    except Exception:
        raise
    return response
    
def setLinkDependency(flowId, linkId, dependency, **ignore):
    ''' Set the link dependecy level (Flow only) '''

    try:
        inst = getCls("Flow")(flowId)
        link = inst.Links[linkId]
        link["Dependency"] = dependency
        inst.Links[linkId] = link
        return {"success": True}
    except Exception:
        raise
    
# new api alternative
def _setLinkDependency(flowId, linkId, dependency, **ignore):
    ''' Set the link dependecy level (Flow only) '''

    try:
        Flow(flowId).Links[linkId].Dependency = dependency
        return {"success": True}
    except Exception:
        raise
    
def copyNodeInst(scope, orgFlow, copyFlow, copyName, orgName, orgType, copyPosX, copyPosY, copyParams, **ignore):
    ''' 
        Copy a NodeInst, Container or State from orgFlow to copyflow
    '''
    
    label = {"NodeInst": "NodeLabel", "Container": "ContainerLabel", "State": "StateLabel"}
    response = {"success": False}
    
    try:

        # flow to update
        toFlow = getattr(scopes(), scope)[copyFlow]
        
        # flow to get data from
        fromFlow = getattr(scopes(), scope)[orgFlow]

        if orgType == "NodeInst" or orgType == "State":
            options = {"Visualization": {"x": {"Value": copyPosX}, "y": {"Value": copyPosY}}}
        else:
            options = {"Visualization": [copyPosX, copyPosY], "Parameter": copyParams }
            
        # can be NodeInst, Container or State
        nodeToCopy = getattr(fromFlow, orgType)[orgName].serialize()
        
        # update position
        nodeToCopy.update(options)
        
        # update label
        nodeToCopy[label[orgType]] = copyName
        
        # save changes
        scopes().write({orgType: { copyName: { **nodeToCopy }}}, scope=scope, ref=toFlow.ref)
        
        # manually updates cached object
        toFlow[orgType][copyName] = nodeToCopy
        
        response["success"] = True
        response["error"] = None

    except Exception:
        raise

    return response


# ----------------------------------------------------------------------
key2action_map = {
	"deleteNodeInst"   : deleteNodeInst,
	"saveFlowLayers"   : saveFlowLayers,
	"deleteLayer"      : deleteLayer,
	"deleteLink"       : deleteLink,
	"addLink"          : addLink,
	"setNodePos"       : setNodePos,
	"setLinkDependency": setLinkDependency,
	"copyNodeInst"     : copyNodeInst
}

try:
    # key to responses
	key = msg["func"]
	
	# override scopes imported from movai.data
	scopes = ScopesTree()
	
	# arguments to pass
	args = msg.get("args", {})
	
	result = key2action_map[key](**args)
	response = {"func": key, "success": True}
	
	# update response with output from responses method
	response.update(result)

except Exception as e:
    import traceback
    traceback.print_exc()
    exc_result = f"{type(e).__name__} {str(e)}"
    response = {"success": False, "error": exc_result}
	