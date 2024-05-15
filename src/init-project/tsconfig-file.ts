export function getTsConfig() {
  return JSON.stringify(
    {
      compilerOptions: {
        target: "ES6",
        module: "ES2022",
        moduleResolution: "node",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        jsx: "react",
      },
    },
    null,
    2,
  );
}
