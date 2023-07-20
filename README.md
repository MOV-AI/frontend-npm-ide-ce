# MOV.AI Flow™

![Movai](https://files.readme.io/d69ebeb-Flow-Logo_trans.png)

MOV.AI Flow™ is an integrated development environment offering multiple editors for the robotics developer.

**main branch:**

[![Deploy - On branch main/release Push](https://github.com/MOV-AI/frontend-npm-ide-ce/actions/workflows/DeployOnMergeMain.yml/badge.svg?branch=dev)](https://github.com/MOV-AI/frontend-npm-ide-ce/actions/workflows/DeployOnMergeMain.yml)

# Development

Open [movai-flow](https://github.com/MOV-AI/movai-flow) repo and run `docker-compose up -d`. Then open this project in VS Code and then choose to reopen in container.
Once the container is ready, open a new terminal inside VS Code and run:

```
npm start
```

Note: ~/.npmrc must be previously configured with access to github.

## Proxy

During development requests are proxied using http-proxy-middleware.
Edit src/setupProxy.js to add more endpoints. If your movai service is running in port 8080, you might need to change this file to set the target as localhost:8080 and .env file to point to port 8080 as well.

# Plugin Architecture

This IDE is an App composed of a set of host plugins and a set of view plugins using Remix plugin architecture. All editors in the IDE are view plugins providing custom actions to all editors that enables features such as key binding, loaders, alerts, menu handlers and more.

## Host plugins

A host plugin is any class that extends [HostReactPlugin](./ReactPlugin/HostReactPlugin.js). This means that a HostReactPlugin is able to receive multiple ViewPlugins. A way to transform any React class into a view plugin receiver is to use `withHostReactPlugin: ReactComponent -> ReactComponent`.

## View plugin

A view plugin is any class that extends [ViewReactPlugin](./ReactPlugin/ViewReactPlugin.js). A view plugin is able to be rendered in host plugins. A way to transform any React Component into a view plugin is to use `withPlugin: ReactComponent -> ReactComponent`.
