# MOVAI-IDE-CE

![Movai](https://www.mov.ai/wp-content/uploads/2021/06/MOV.AI-logo-3.png)

MOVAI-IDE-CE is an integrated development environment offering multiple editors for the robotics developer.

**main branch:**

[![Deploy - On branch main/release Push](https://github.com/MOV-AI/frontend-npm-ide-ce/actions/workflows/DeployOnMergeMain.yml/badge.svg?branch=dev)](https://github.com/MOV-AI/frontend-npm-ide-ce/actions/workflows/DeployOnMergeMain.yml)

## Development

Open the project in VS Code and then choose to reopen in container.
Once the container is ready, open a new terminal inside VS Code and run.

```
npm ci
npm start
```

Note: ~/.npmrc must be previously configured with access to github.

## Proxy

During development requests are proxied using http-proxy-middleware.
Edit src/setupProxy.js to add more endpoints.

## Installation

Add the package "movai-adminboard" to the robot's configuration file.
Then apply the changes and update the frontend.

```
movai-cli apply robot.json
movai-cli frontend <robot name>
```

# Plugin

# Architecture

The plugin demo is an App composed of a set of host plugins and a set of view plugins

## Host plugins

A host plugin is any class that extends [HostReactPlugin](./ReactPlugin/HostReactPlugin.js). This means that a HostReactPlugin is able to receive multiple ViewPlugins. A way to transform any React class into a view plugin receiver is to use `withHostReactPlugin: ReactComponent -> ReactComponent`.

A typical usage are described in [plugins/hosts](./plugins/hosts/)

## View plugin

A view plugin is any class that extends [ViewReactPlugin](./ReactPlugin/ViewReactPlugin.js). A view plugin is able to be rendered in host plugins. A way to transform any React Component into a view plugin is to use `withPlugin: ReactComponent -> ReactComponent`.

A typical usage are described in [plugins/views](./plugins/views/)
1
