# Document Manager

# Functional requirements

- Document CRUD actions
- Document validation
- Undo redo (per update actions)
- Document copy

# Non-functional requirements

- Memoization (Cache)

# Public methods

- create: (x: {scope: String}) => Promise<Model>
- read: (modelKey: {name: String, scope: String}) => Promise<Model>
- update: (modelKey: {name: String, scope: String}) => Promise<Boolean>
- delete: (modelKey: {name: String, scope: String}) => Promise<Boolean>
- validate: (modelKey: {name: String, scope: String}) => Promise<Boolean>
- subscribe: (x: {modelKey: {name: String, scope: String}, callback} ) => {}


# Usage

# Config example

```javascript
const Config = props => {
  const { call, path, id } = props;
  const configRef = React.useRef();
  const [configType, setConfigType] = React.useState("yaml");
  const [configText, setConfigText] = React.useState("");
  const [details, setDetails] = React.useState({ user: "", lastUpdate: "" });

  const save = () => {
    const actualConfig = configRef.current;
    actualConfig.save();
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

    call("DocManager", "read", { scope: "Configuration" })
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
const Config = props => {
  const {data: ConfigData, onChange: (key: String, value: Any) => {} } = props;

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

  React.useEffect(() => {
    on("tabs", `${id}-active`, () => {
      renderRightMenu();
    });

  }, []);

  return (
    <>
      <Selector
        selected={data.type}
        onChange={item => onChange("type", item.value)}
      >
        <Item value="xml">XML</Item>
        <Item value="yaml">YAML</Item>
      </Selector>
      <CodeEditor
        value={data.text}
        onChange={newText => onChange("text", newText)}
      />
    </>
  );
}
```
