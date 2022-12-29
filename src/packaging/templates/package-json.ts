export const getPackageJson = (params: {
  appID: string;
  packageName: string;
  gitURL?: string;
}) => {
  return JSON.stringify(
    {
      "app-id": params.appID,
      runtime: "org.gnome.Platform",
      "runtime-version": "40",
      branch: "stable",
      sdk: "org.gnome.Sdk",
      command: "/app/bin/" + params.appID,
      "finish-args": [
        "--share=ipc",
        "--socket=fallback-x11",
        "--socket=wayland",
        "--share=network",
      ],
      cleanup: [
        "/include",
        "/lib/pkgconfig",
        "/share/pkgconfig",
        "/share/aclocal",
        "/man",
        "/share/man",
        "/share/gtk-doc",
        "/share/vala",
        "*.la",
        "*.a",
      ],
      modules: [
        {
          name: params.packageName,
          sources: [
            {
              type: "git",
              url: params.gitURL ?? "",
            },
          ],
        },
      ],
      "build-options": {
        env: {},
      },
    },
    null,
    2
  );
};
