# Encriovment Variables

Environment vairables are exposed to the application via the "gapp:env" import. It contains some default values like application name,
version, build mode etc. and any custom variables defined in the config file.

```jsx
import env from 'gapp:env';

console.log(env.appId); // 'com.example.app'
console.log(env.appName); // 'Example App'
```

Setting the environment variables in the config:

```tsx
import type { BuildConfig } from "@reactgjs/react-gnome";

export default () => {
  const config: BuildConfig = {
    applicationName: "Example App",
    applicationVersion: "1.0.0",
    entrypoint: "./src/start.tsx",
    outDir: "./dist",
    envVars: {
      defaults: {
        MY_VAR: "123",
      },
      envFilePath: "./.env",
    },
  };

  return config;
};
```

There is a few settings that can be changed in the config file regarding the environment variables:

- `defaults` - simply a dictionary of env vars that will be available in the application
- `envFilePath` - path to a file that contains the environment variables, by default a `.env` will be loaded if it exists
- `systemVars` - whether to include system environment variables in the application at the build time, by default it's `false`
- `allow` - list of names or a Regex pattern for the environment variables that will be allowed in the application,
  any variable that does not match this will be excluded
- `disallow` - list of names or a Regex pattern for the environment variables that will be excluded from the application,
  any variable that matches this will be excluded
