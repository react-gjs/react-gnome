import GLib from "gi://GLib";

namespace os_default {
  const __command = (program: string, ...args: string[]) => {
    const [ok, stdout, stderr] = GLib.spawn_sync(
      null,
      [program, ...args],
      null,
      GLib.SpawnFlags.SEARCH_PATH,
      null
    );

    const decoder = new TextDecoder();

    if (!ok) {
      throw new Error(decoder.decode(stderr as any as Uint8Array));
    }

    return decoder.decode(stdout as any as Uint8Array);
  };

  const __memoized = <F extends () => any>(fn: F): F => {
    let cached: ReturnType<F> | undefined;

    return (() => {
      if (cached === undefined) {
        cached = fn();
      }
      return cached;
    }) as any;
  };

  export const EOL = "\n";

  export const constants = {
    signals: {
      SIGHUP: 1,
      SIGINT: 2,
      SIGQUIT: 3,
      SIGILL: 4,
      SIGTRAP: 5,
      SIGABRT: 6,
      SIGFPE: 8,
      SIGKILL: 9,
      SIGSEGV: 11,
      SIGPIPE: 13,
      SIGALRM: 14,
      SIGTERM: 15,
    },
  };

  export function availableParallelism() {
    return GLib.get_num_processors();
  }

  const BIT32_ARM_ARCH = new Set(["aarch32", "armv6l", "armv7l", "arm"]);
  const BIT64_ARM_ARCH = new Set(["aarch64", "aarch64_be", "armv8l", "armv8b"]);

  export const arch = __memoized(function arch() {
    const type = __command("uname", "-m");

    if (type === "x86_64") {
      return "x64";
    } else if (type === "i686" || type === "i386") {
      return "x86";
    } else if (BIT32_ARM_ARCH.has(type)) {
      return "arm";
    } else if (BIT64_ARM_ARCH.has(type)) {
      return "arm64";
    } else if (type === "mips" || type === "mips64") {
      return "mips";
    } else if (type === "ppc") {
      return "ppc";
    } else if (type === "ppc64") {
      return "ppc64";
    }

    return type;
  });

  export function cpus() {
    // TODO: get actual cpu info
    return Array.from({ length: availableParallelism() }, () => ({
      model: "",
      speed: -1,
      times: {
        user: -1,
        nice: -1,
        sys: -1,
        idle: -1,
        irq: -1,
      },
    }));
  }

  export const devNull = __memoized(function devNull() {
    return "/dev/null";
  });

  export function freemem() {
    const mem = __command("free", "-b");
    const match = mem.match(/Mem:\s+\d+\s+\d+\s+(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    return -1;
  }

  export function homedir() {
    return GLib.get_home_dir();
  }

  export function hostname() {
    return GLib.get_host_name();
  }

  export const machine = __memoized(function machine() {
    return __command("uname", "-m");
  });

  export const platform = __memoized(function platform() {
    return "linux"; // TODO: implement
  });

  export const release = __memoized(function release() {
    return __command("uname", "-r");
  });

  export function tmpdir() {
    return GLib.get_tmp_dir();
  }

  export function totalmem() {
    const mem = __command("free", "-b");
    const match = mem.match(/Mem:\s+(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    return -1;
  }

  export const type = __memoized(function type() {
    return __command("uname");
  });

  export function uptime(): number {
    const time = __command("uptime", "-s");
    const date = new Date(time);
    return Math.round((Date.now() - date.getTime()) / 1000);
  }

  export function userInfo() {
    const username = GLib.get_user_name();
    return {
      uid: __command("id", username, "-u"),
      gid: __command("id", username, "-g"),
      username: GLib.get_user_name(),
      homedir: GLib.get_home_dir(),
      shell: GLib.getenv("SHELL"),
    };
  }

  export function version() {
    return __command("uname", "-v");
  }
}

export default os_default;

export const EOL = os_default.EOL;
export const constants = os_default.constants;
export const availableParallelism = os_default.availableParallelism;
export const arch = os_default.arch;
export const cpus = os_default.cpus;
export const devNull = os_default.devNull;
export const freemem = os_default.freemem;
export const homedir = os_default.homedir;
export const hostname = os_default.hostname;
export const machine = os_default.machine;
export const platform = os_default.platform;
export const release = os_default.release;
export const tmpdir = os_default.tmpdir;
export const totalmem = os_default.totalmem;
export const type = os_default.type;
export const uptime = os_default.uptime;
export const userInfo = os_default.userInfo;
export const version = os_default.version;
