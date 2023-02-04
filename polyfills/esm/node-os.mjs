// src/polyfills/node-os.ts
import GLib from "gi://GLib";
var os_default;
((os_default2) => {
  const __command = (program, ...args) => {
    const [ok, stdout, stderr] = GLib.spawn_sync(
      null,
      [program, ...args],
      null,
      GLib.SpawnFlags.SEARCH_PATH,
      null
    );
    const decoder = new TextDecoder();
    if (!ok) {
      throw new Error(decoder.decode(stderr).trim());
    }
    return decoder.decode(stdout).trim();
  };
  const __memoized = (fn) => {
    let cached;
    return () => {
      if (cached === void 0) {
        cached = fn();
      }
      return cached;
    };
  };
  os_default2.EOL = "\n";
  os_default2.constants = {
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
      SIGTERM: 15
    }
  };
  function availableParallelism2() {
    return GLib.get_num_processors();
  }
  os_default2.availableParallelism = availableParallelism2;
  const BIT32_ARM_ARCH = /* @__PURE__ */ new Set(["aarch32", "armv6l", "armv7l", "arm"]);
  const BIT64_ARM_ARCH = /* @__PURE__ */ new Set(["aarch64", "aarch64_be", "armv8l", "armv8b"]);
  os_default2.arch = __memoized(function arch3() {
    const type3 = __command("uname", "-m");
    if (type3 === "x86_64") {
      return "x64";
    } else if (type3 === "i686" || type3 === "i386") {
      return "x86";
    } else if (BIT32_ARM_ARCH.has(type3)) {
      return "arm";
    } else if (BIT64_ARM_ARCH.has(type3)) {
      return "arm64";
    } else if (type3 === "mips" || type3 === "mips64") {
      return "mips";
    } else if (type3 === "ppc") {
      return "ppc";
    } else if (type3 === "ppc64") {
      return "ppc64";
    }
    return type3;
  });
  function cpus2() {
    return Array.from({ length: availableParallelism2() }, () => ({
      model: "",
      speed: -1,
      times: {
        user: -1,
        nice: -1,
        sys: -1,
        idle: -1,
        irq: -1
      }
    }));
  }
  os_default2.cpus = cpus2;
  os_default2.devNull = __memoized(function devNull3() {
    return "/dev/null";
  });
  function freemem2() {
    const mem = __command("free", "-b");
    const match = mem.match(/Mem:\s+\d+\s+\d+\s+(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    return -1;
  }
  os_default2.freemem = freemem2;
  function homedir2() {
    return GLib.get_home_dir();
  }
  os_default2.homedir = homedir2;
  function hostname2() {
    return GLib.get_host_name();
  }
  os_default2.hostname = hostname2;
  os_default2.machine = __memoized(function machine3() {
    return __command("uname", "-m");
  });
  os_default2.platform = __memoized(function platform3() {
    return "linux";
  });
  os_default2.release = __memoized(function release3() {
    return __command("uname", "-r");
  });
  function tmpdir2() {
    return GLib.get_tmp_dir();
  }
  os_default2.tmpdir = tmpdir2;
  function totalmem2() {
    const mem = __command("free", "-b");
    const match = mem.match(/Mem:\s+(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    return -1;
  }
  os_default2.totalmem = totalmem2;
  os_default2.type = __memoized(function type3() {
    return __command("uname");
  });
  function uptime2() {
    const time = __command("uptime", "-s");
    const date = new Date(time);
    return Math.round((Date.now() - date.getTime()) / 1e3);
  }
  os_default2.uptime = uptime2;
  function userInfo2() {
    const username = GLib.get_user_name();
    return {
      uid: Number(__command("id", username, "-u")),
      gid: Number(__command("id", username, "-g")),
      username: GLib.get_user_name(),
      homedir: GLib.get_home_dir(),
      shell: GLib.getenv("SHELL")
    };
  }
  os_default2.userInfo = userInfo2;
  function version2() {
    return __command("uname", "-v");
  }
  os_default2.version = version2;
})(os_default || (os_default = {}));
var node_os_default = os_default;
var EOL = os_default.EOL;
var constants = os_default.constants;
var availableParallelism = os_default.availableParallelism;
var arch = os_default.arch;
var cpus = os_default.cpus;
var devNull = os_default.devNull;
var freemem = os_default.freemem;
var homedir = os_default.homedir;
var hostname = os_default.hostname;
var machine = os_default.machine;
var platform = os_default.platform;
var release = os_default.release;
var tmpdir = os_default.tmpdir;
var totalmem = os_default.totalmem;
var type = os_default.type;
var uptime = os_default.uptime;
var userInfo = os_default.userInfo;
var version = os_default.version;
export {
  EOL,
  arch,
  availableParallelism,
  constants,
  cpus,
  node_os_default as default,
  devNull,
  freemem,
  homedir,
  hostname,
  machine,
  platform,
  release,
  tmpdir,
  totalmem,
  type,
  uptime,
  userInfo,
  version
};
