# Document Manager

# Functional requirements

- Document CRUD actions
- Document validation
- Undo redo (per update actions)
- Document copy

# Non-functional requirements

- Memoization (Cache)

# Public methods

- read: (name: String) => Promise<Model>
- update: (model: Model) => Promise<Boolean>
- create: (model: Model) => Promise<Model>
- delete: (name: String) => Promise<Boolean>
- validate: (model: Model) => Promise<Boolean> // return model.validate()
- subscribe: (x : {model: Model, callback} ) => {} // model.subscribe();

# Config example

```javascript
const Config = props => {
  const { call, path, id } = props;
  const configRef = React.useRef();
  const [configType, setConfigType] = React.useState("yaml");
  const [configText, setConfigText] = React.useState("");
  const [details, setDetails] = React.useState({ user: "", lastUpdate: "" });

  const create = newConfigName => {
    const actualConfig = configRef.current;
    // actualConfig.setId(newConfigName).create(); option v1

    /**
     * Create has no side effects
     *
     * if id is undefined => creates new Config in DB
     * else => it creates a copy of actualConfig in DB
     * */
    actualConfig
      .create(newConfigName)
      .then(newConfig => (configRef.current = newConfig));
  };

  const save = () => {
    const actualConfig = configRef.current;
    if (!actualConfig.id) {
      // call("newEditorModal", "create", "Create new config").then(create); v1
      call("newEditorModal", "create", "Create new config", create); // v2
    } else {
      actualConfig.save();
    }
  };

  const updateConfigType = configType => {
    configRef.current.setType(configType);
  };

  const updateConfigText = configText => {
    configRef.current.setText(configText);
  };

  React.useEffect(() => {
    on("tabs", `${id}-active`, () => {
      renderRightMenu();
    });

    call("DocManager", "read", path)
      .then(config => {
        configRef.current = config;
        setConfigText(config.getText());
        config.subscribe(newConfig => {
          setConfigText(newConfig.getText());
          setConfigType(newConfig.getType());
          setDetails(newConfig.getDetails());
        });
      })
      .catch(() => {
        const newConfig = new Config();
        configRef.current = newConfig;
      });

    KeyBinding.bind("ctrl+s", save);
  }, []);

  const renderRightMenu = React.useCallback(() => {
    const menuName = `${path}-detail-menu`;
    const actualConfig = configRef.current;
    // add bookmark
    call("rightDrawer", "setBookmark", {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: <Menu id={path} details={actualConfig.getDetails()}></Menu>
      }
    });
  }, [call, configRef, path]);

  return (
    <>
      <Selector
        selected={configType}
        onChange={item => updateConfigType(item.value)}
      >
        <Item value="xml">XML</Item>
        <Item value="yaml">YAML</Item>
      </Selector>
      <CodeEditor
        value={configText}
        onChange={newText => updateConfigText(newText)}
      />
    </>
  );
};
```

```javascript
new Config({ text: "", type: "yaml", id: "batata" }).create();
```
