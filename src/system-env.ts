declare module "system:env" {
  const envs: {
    [key: string]: string | number | boolean | null;
  } & {
    appName: string;
    appVersion: string;
    appId: string;
    mode: "development" | "production";
  };

  export default envs;
}
