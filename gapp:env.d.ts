declare module "gapp:env" {
  const envs: {
    [key: string]: string | number | boolean | null;
  } & {
    friendlyAppName: string;
    appName: string;
    appVersion: string;
    appId: string;
    mode: "development" | "production";
  };

  export default envs;
}
