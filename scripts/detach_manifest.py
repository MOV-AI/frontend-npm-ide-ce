import json

json_file_path="package.json"
with open(json_file_path) as json_file:
    data = json.load(json_file)

    manifest = data['movai']



new_path = 'build/package.json'
with open(new_path,'w+') as writer:
    writer.write(json.dumps(manifest))
    writer.close
