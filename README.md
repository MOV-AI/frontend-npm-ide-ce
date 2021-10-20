# Plugin Demo

# Architecture

The plugin demo is an App composed of a set of host plugins and a set of view plugins

## Host plugins

A host plugin is any class that extends [HostReactPlugin](./ReactPlugin/HostReactPlugin.js). This means that a HostReactPlugin is able to receive multiple ViewPlugins. A way to transform any React class into a view plugin receiver is to use `withHostReactPlugin: ReactComponent -> ReactComponent`.

A typical usage are described in [plugins/hosts](./plugins/hosts/)

## View plugin

A view plugin is any class that extends [ViewReactPlugin](./ReactPlugin/ViewReactPlugin.js). A view plugin is able to be rendered in host plugins. A way to transform any React Component into a view plugin is to use `withPlugin: ReactComponent -> ReactComponent`.

A typical usage are described in [plugins/views](./plugins/views/)
