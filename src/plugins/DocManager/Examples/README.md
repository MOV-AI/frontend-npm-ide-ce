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

# Configuration example

```javascript
const Configuration = props => {
  const {data: ConfigData, setData: (data) => {} } = props;

  const renderRightMenu = React.useCallback(() => {
    const menuName = `${path}-detail-menu`;
    const actualConfig = configRef.current;
    // add bookmark

    call(
      PLUGINS.RIGHT_DRAWER.NAME,
      PLUGINS.RIGHT_DRAWER.CALL.SET_BOOKMARK, {
      [menuName]: {
        icon: <InfoIcon></InfoIcon>,
        name: menuName,
        view: <Menu id={path} details={actualConfig.getDetails()}></Menu>
      }
    });
  }, [call, configRef, path]);

  const updateConfigExtension = configExtension => {
    if (instance.current) instance.current.setExtension(value);
  };

  const updateConfigCode = configCode => {
    if (value === instance.current.getCode()) return;
    if (instance.current) instance.current.setCode(value);
  };

  return (
    <>
      <Selector
        selected={data.type}
        onChange={item => updateConfigExtension(item.value)}
      >
        <Item value="xml">XML</Item>
        <Item value="yaml">YAML</Item>
      </Selector>
      <CodeEditor
        value={data.text}
        onChange={newText => updateConfigCode(newText)}
      />
    </>
  );
}

export default withEditorPlugin(Configuration);
```
