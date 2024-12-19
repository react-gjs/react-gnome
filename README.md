# react-gtk

## Getting Started

1. Make sure you have Node.js installed on your system, it's necessary for the development.

2. Install the required dependencies

```bash
yarn add @reactgjs/react-gtk
# or
npm install @reactgjs/react-gtk
```

3. Install the optional dependencies

- `gjs-esm-types` - adds type definitions for the GJS environment
- `ts-node` - allows you to start the project when written in TypeScript
- `@swc/core` - enabled swc compiler and speeds up development commands when using TypeScript

```bash
yarn add -D gjs-esm-types ts-node @swc/core
# or
npm install -D gjs-esm-types ts-node @swc/core
```

4. Initiate the project

Run the init command:

```bash
yarn react-gtk init
# or
npx react-gtk init
```
then open `react-gtk.config.mjs` file, change the app name and optionally adjust the project settings.

5. Start coding

The entry file will be located in `src/start.jsx`.

## Running in dev mode

```bash
yarn start
# or
npm run start
```

This command will start the project in development mode and watch for changes.


## Building the project

```bash
yarn build
# or
npm run build
```

This command will create a bundle file as well as other files meson needs to build the project. And then package it into a tarball file.

```bash
yarn bundle
# or
npm run bundle
```

This command will create a standalone bundle file.

## Documentation

Check out more of the React GTK features [here](./docs)
