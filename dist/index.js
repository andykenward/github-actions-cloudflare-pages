import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/windows.js
var require_windows = __commonJS({
  "node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/windows.js"(exports, module) {
    module.exports = isexe;
    isexe.sync = sync;
    var fs = __require("fs");
    function checkPathExt(path3, options) {
      var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
      if (!pathext) {
        return true;
      }
      pathext = pathext.split(";");
      if (pathext.indexOf("") !== -1) {
        return true;
      }
      for (var i = 0; i < pathext.length; i++) {
        var p = pathext[i].toLowerCase();
        if (p && path3.substr(-p.length).toLowerCase() === p) {
          return true;
        }
      }
      return false;
    }
    __name(checkPathExt, "checkPathExt");
    function checkStat(stat, path3, options) {
      if (!stat.isSymbolicLink() && !stat.isFile()) {
        return false;
      }
      return checkPathExt(path3, options);
    }
    __name(checkStat, "checkStat");
    function isexe(path3, options, cb) {
      fs.stat(path3, function(er, stat) {
        cb(er, er ? false : checkStat(stat, path3, options));
      });
    }
    __name(isexe, "isexe");
    function sync(path3, options) {
      return checkStat(fs.statSync(path3), path3, options);
    }
    __name(sync, "sync");
  }
});

// node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/mode.js
var require_mode = __commonJS({
  "node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/mode.js"(exports, module) {
    module.exports = isexe;
    isexe.sync = sync;
    var fs = __require("fs");
    function isexe(path3, options, cb) {
      fs.stat(path3, function(er, stat) {
        cb(er, er ? false : checkStat(stat, options));
      });
    }
    __name(isexe, "isexe");
    function sync(path3, options) {
      return checkStat(fs.statSync(path3), options);
    }
    __name(sync, "sync");
    function checkStat(stat, options) {
      return stat.isFile() && checkMode(stat, options);
    }
    __name(checkStat, "checkStat");
    function checkMode(stat, options) {
      var mod = stat.mode;
      var uid = stat.uid;
      var gid = stat.gid;
      var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
      var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
      var u = parseInt("100", 8);
      var g = parseInt("010", 8);
      var o = parseInt("001", 8);
      var ug = u | g;
      var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
      return ret;
    }
    __name(checkMode, "checkMode");
  }
});

// node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/index.js
var require_isexe = __commonJS({
  "node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/index.js"(exports, module) {
    var fs = __require("fs");
    var core;
    if (process.platform === "win32" || global.TESTING_WINDOWS) {
      core = require_windows();
    } else {
      core = require_mode();
    }
    module.exports = isexe;
    isexe.sync = sync;
    function isexe(path3, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (!cb) {
        if (typeof Promise !== "function") {
          throw new TypeError("callback not provided");
        }
        return new Promise(function(resolve, reject) {
          isexe(path3, options || {}, function(er, is) {
            if (er) {
              reject(er);
            } else {
              resolve(is);
            }
          });
        });
      }
      core(path3, options || {}, function(er, is) {
        if (er) {
          if (er.code === "EACCES" || options && options.ignoreErrors) {
            er = null;
            is = false;
          }
        }
        cb(er, is);
      });
    }
    __name(isexe, "isexe");
    function sync(path3, options) {
      try {
        return core.sync(path3, options || {});
      } catch (er) {
        if (options && options.ignoreErrors || er.code === "EACCES") {
          return false;
        } else {
          throw er;
        }
      }
    }
    __name(sync, "sync");
  }
});

// node_modules/.pnpm/which@2.0.2/node_modules/which/which.js
var require_which = __commonJS({
  "node_modules/.pnpm/which@2.0.2/node_modules/which/which.js"(exports, module) {
    var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
    var path3 = __require("path");
    var COLON = isWindows ? ";" : ":";
    var isexe = require_isexe();
    var getNotFoundError = /* @__PURE__ */ __name((cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: "ENOENT" }), "getNotFoundError");
    var getPathInfo = /* @__PURE__ */ __name((cmd, opt) => {
      const colon = opt.colon || COLON;
      const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
        // windows always checks the cwd first
        ...isWindows ? [process.cwd()] : [],
        ...(opt.path || process.env.PATH || /* istanbul ignore next: very unusual */
        "").split(colon)
      ];
      const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
      const pathExt = isWindows ? pathExtExe.split(colon) : [""];
      if (isWindows) {
        if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
          pathExt.unshift("");
      }
      return {
        pathEnv,
        pathExt,
        pathExtExe
      };
    }, "getPathInfo");
    var which = /* @__PURE__ */ __name((cmd, opt, cb) => {
      if (typeof opt === "function") {
        cb = opt;
        opt = {};
      }
      if (!opt)
        opt = {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      const step = /* @__PURE__ */ __name((i) => new Promise((resolve, reject) => {
        if (i === pathEnv.length)
          return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path3.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        resolve(subStep(p, i, 0));
      }), "step");
      const subStep = /* @__PURE__ */ __name((p, i, ii) => new Promise((resolve, reject) => {
        if (ii === pathExt.length)
          return resolve(step(i + 1));
        const ext = pathExt[ii];
        isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
          if (!er && is) {
            if (opt.all)
              found.push(p + ext);
            else
              return resolve(p + ext);
          }
          return resolve(subStep(p, i, ii + 1));
        });
      }), "subStep");
      return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
    }, "which");
    var whichSync = /* @__PURE__ */ __name((cmd, opt) => {
      opt = opt || {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      for (let i = 0; i < pathEnv.length; i++) {
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path3.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        for (let j = 0; j < pathExt.length; j++) {
          const cur = p + pathExt[j];
          try {
            const is = isexe.sync(cur, { pathExt: pathExtExe });
            if (is) {
              if (opt.all)
                found.push(cur);
              else
                return cur;
            }
          } catch (ex) {
          }
        }
      }
      if (opt.all && found.length)
        return found;
      if (opt.nothrow)
        return null;
      throw getNotFoundError(cmd);
    }, "whichSync");
    module.exports = which;
    which.sync = whichSync;
  }
});

// node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js
var require_path_key = __commonJS({
  "node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js"(exports, module) {
    "use strict";
    var pathKey2 = /* @__PURE__ */ __name((options = {}) => {
      const environment = options.env || process.env;
      const platform = options.platform || process.platform;
      if (platform !== "win32") {
        return "PATH";
      }
      return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
    }, "pathKey");
    module.exports = pathKey2;
    module.exports.default = pathKey2;
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/resolveCommand.js
var require_resolveCommand = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/resolveCommand.js"(exports, module) {
    "use strict";
    var path3 = __require("path");
    var which = require_which();
    var getPathKey = require_path_key();
    function resolveCommandAttempt(parsed, withoutPathExt) {
      const env = parsed.options.env || process.env;
      const cwd = process.cwd();
      const hasCustomCwd = parsed.options.cwd != null;
      const shouldSwitchCwd = hasCustomCwd && process.chdir !== void 0 && !process.chdir.disabled;
      if (shouldSwitchCwd) {
        try {
          process.chdir(parsed.options.cwd);
        } catch (err) {
        }
      }
      let resolved;
      try {
        resolved = which.sync(parsed.command, {
          path: env[getPathKey({ env })],
          pathExt: withoutPathExt ? path3.delimiter : void 0
        });
      } catch (e) {
      } finally {
        if (shouldSwitchCwd) {
          process.chdir(cwd);
        }
      }
      if (resolved) {
        resolved = path3.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
      }
      return resolved;
    }
    __name(resolveCommandAttempt, "resolveCommandAttempt");
    function resolveCommand(parsed) {
      return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
    }
    __name(resolveCommand, "resolveCommand");
    module.exports = resolveCommand;
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/escape.js
var require_escape = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/escape.js"(exports, module) {
    "use strict";
    var metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
    function escapeCommand(arg) {
      arg = arg.replace(metaCharsRegExp, "^$1");
      return arg;
    }
    __name(escapeCommand, "escapeCommand");
    function escapeArgument(arg, doubleEscapeMetaChars) {
      arg = `${arg}`;
      arg = arg.replace(/(\\*)"/g, '$1$1\\"');
      arg = arg.replace(/(\\*)$/, "$1$1");
      arg = `"${arg}"`;
      arg = arg.replace(metaCharsRegExp, "^$1");
      if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, "^$1");
      }
      return arg;
    }
    __name(escapeArgument, "escapeArgument");
    module.exports.command = escapeCommand;
    module.exports.argument = escapeArgument;
  }
});

// node_modules/.pnpm/shebang-regex@3.0.0/node_modules/shebang-regex/index.js
var require_shebang_regex = __commonJS({
  "node_modules/.pnpm/shebang-regex@3.0.0/node_modules/shebang-regex/index.js"(exports, module) {
    "use strict";
    module.exports = /^#!(.*)/;
  }
});

// node_modules/.pnpm/shebang-command@2.0.0/node_modules/shebang-command/index.js
var require_shebang_command = __commonJS({
  "node_modules/.pnpm/shebang-command@2.0.0/node_modules/shebang-command/index.js"(exports, module) {
    "use strict";
    var shebangRegex = require_shebang_regex();
    module.exports = (string = "") => {
      const match = string.match(shebangRegex);
      if (!match) {
        return null;
      }
      const [path3, argument] = match[0].replace(/#! ?/, "").split(" ");
      const binary = path3.split("/").pop();
      if (binary === "env") {
        return argument;
      }
      return argument ? `${binary} ${argument}` : binary;
    };
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/util/readShebang.js"(exports, module) {
    "use strict";
    var fs = __require("fs");
    var shebangCommand = require_shebang_command();
    function readShebang(command) {
      const size = 150;
      const buffer = Buffer.alloc(size);
      let fd;
      try {
        fd = fs.openSync(command, "r");
        fs.readSync(fd, buffer, 0, size, 0);
        fs.closeSync(fd);
      } catch (e) {
      }
      return shebangCommand(buffer.toString());
    }
    __name(readShebang, "readShebang");
    module.exports = readShebang;
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/parse.js
var require_parse = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/parse.js"(exports, module) {
    "use strict";
    var path3 = __require("path");
    var resolveCommand = require_resolveCommand();
    var escape = require_escape();
    var readShebang = require_readShebang();
    var isWin = process.platform === "win32";
    var isExecutableRegExp = /\.(?:com|exe)$/i;
    var isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
    function detectShebang(parsed) {
      parsed.file = resolveCommand(parsed);
      const shebang = parsed.file && readShebang(parsed.file);
      if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;
        return resolveCommand(parsed);
      }
      return parsed.file;
    }
    __name(detectShebang, "detectShebang");
    function parseNonShell(parsed) {
      if (!isWin) {
        return parsed;
      }
      const commandFile = detectShebang(parsed);
      const needsShell = !isExecutableRegExp.test(commandFile);
      if (parsed.options.forceShell || needsShell) {
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
        parsed.command = path3.normalize(parsed.command);
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
        const shellCommand = [parsed.command].concat(parsed.args).join(" ");
        parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
        parsed.command = process.env.comspec || "cmd.exe";
        parsed.options.windowsVerbatimArguments = true;
      }
      return parsed;
    }
    __name(parseNonShell, "parseNonShell");
    function parse2(command, args, options) {
      if (args && !Array.isArray(args)) {
        options = args;
        args = null;
      }
      args = args ? args.slice(0) : [];
      options = Object.assign({}, options);
      const parsed = {
        command,
        args,
        options,
        file: void 0,
        original: {
          command,
          args
        }
      };
      return options.shell ? parsed : parseNonShell(parsed);
    }
    __name(parse2, "parse");
    module.exports = parse2;
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/enoent.js
var require_enoent = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/lib/enoent.js"(exports, module) {
    "use strict";
    var isWin = process.platform === "win32";
    function notFoundError(original, syscall) {
      return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: "ENOENT",
        errno: "ENOENT",
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args
      });
    }
    __name(notFoundError, "notFoundError");
    function hookChildProcess(cp, parsed) {
      if (!isWin) {
        return;
      }
      const originalEmit = cp.emit;
      cp.emit = function(name, arg1) {
        if (name === "exit") {
          const err = verifyENOENT(arg1, parsed, "spawn");
          if (err) {
            return originalEmit.call(cp, "error", err);
          }
        }
        return originalEmit.apply(cp, arguments);
      };
    }
    __name(hookChildProcess, "hookChildProcess");
    function verifyENOENT(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawn");
      }
      return null;
    }
    __name(verifyENOENT, "verifyENOENT");
    function verifyENOENTSync(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawnSync");
      }
      return null;
    }
    __name(verifyENOENTSync, "verifyENOENTSync");
    module.exports = {
      hookChildProcess,
      verifyENOENT,
      verifyENOENTSync,
      notFoundError
    };
  }
});

// node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/index.js
var require_cross_spawn = __commonJS({
  "node_modules/.pnpm/cross-spawn@7.0.3/node_modules/cross-spawn/index.js"(exports, module) {
    "use strict";
    var cp = __require("child_process");
    var parse2 = require_parse();
    var enoent = require_enoent();
    function spawn(command, args, options) {
      const parsed = parse2(command, args, options);
      const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
      enoent.hookChildProcess(spawned, parsed);
      return spawned;
    }
    __name(spawn, "spawn");
    function spawnSync(command, args, options) {
      const parsed = parse2(command, args, options);
      const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
      result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
      return result;
    }
    __name(spawnSync, "spawnSync");
    module.exports = spawn;
    module.exports.spawn = spawn;
    module.exports.sync = spawnSync;
    module.exports._parse = parse2;
    module.exports._enoent = enoent;
  }
});

// node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/signals.js
var require_signals = __commonJS({
  "node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/signals.js"(exports, module) {
    module.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  }
});

// node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/index.js
var require_signal_exit = __commonJS({
  "node_modules/.pnpm/signal-exit@3.0.7/node_modules/signal-exit/index.js"(exports, module) {
    var process6 = global.process;
    var processOk = /* @__PURE__ */ __name(function(process7) {
      return process7 && typeof process7 === "object" && typeof process7.removeListener === "function" && typeof process7.emit === "function" && typeof process7.reallyExit === "function" && typeof process7.listeners === "function" && typeof process7.kill === "function" && typeof process7.pid === "number" && typeof process7.on === "function";
    }, "processOk");
    if (!processOk(process6)) {
      module.exports = function() {
        return function() {
        };
      };
    } else {
      assert2 = __require("assert");
      signals = require_signals();
      isWin = /^win/i.test(process6.platform);
      EE = __require("events");
      if (typeof EE !== "function") {
        EE = EE.EventEmitter;
      }
      if (process6.__signal_exit_emitter__) {
        emitter = process6.__signal_exit_emitter__;
      } else {
        emitter = process6.__signal_exit_emitter__ = new EE();
        emitter.count = 0;
        emitter.emitted = {};
      }
      if (!emitter.infinite) {
        emitter.setMaxListeners(Infinity);
        emitter.infinite = true;
      }
      module.exports = function(cb, opts) {
        if (!processOk(global.process)) {
          return function() {
          };
        }
        assert2.equal(typeof cb, "function", "a callback must be provided for exit handler");
        if (loaded === false) {
          load();
        }
        var ev = "exit";
        if (opts && opts.alwaysLast) {
          ev = "afterexit";
        }
        var remove = /* @__PURE__ */ __name(function() {
          emitter.removeListener(ev, cb);
          if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
            unload();
          }
        }, "remove");
        emitter.on(ev, cb);
        return remove;
      };
      unload = /* @__PURE__ */ __name(function unload2() {
        if (!loaded || !processOk(global.process)) {
          return;
        }
        loaded = false;
        signals.forEach(function(sig) {
          try {
            process6.removeListener(sig, sigListeners[sig]);
          } catch (er) {
          }
        });
        process6.emit = originalProcessEmit;
        process6.reallyExit = originalProcessReallyExit;
        emitter.count -= 1;
      }, "unload");
      module.exports.unload = unload;
      emit = /* @__PURE__ */ __name(function emit2(event, code, signal) {
        if (emitter.emitted[event]) {
          return;
        }
        emitter.emitted[event] = true;
        emitter.emit(event, code, signal);
      }, "emit");
      sigListeners = {};
      signals.forEach(function(sig) {
        sigListeners[sig] = /* @__PURE__ */ __name(function listener() {
          if (!processOk(global.process)) {
            return;
          }
          var listeners = process6.listeners(sig);
          if (listeners.length === emitter.count) {
            unload();
            emit("exit", null, sig);
            emit("afterexit", null, sig);
            if (isWin && sig === "SIGHUP") {
              sig = "SIGINT";
            }
            process6.kill(process6.pid, sig);
          }
        }, "listener");
      });
      module.exports.signals = function() {
        return signals;
      };
      loaded = false;
      load = /* @__PURE__ */ __name(function load2() {
        if (loaded || !processOk(global.process)) {
          return;
        }
        loaded = true;
        emitter.count += 1;
        signals = signals.filter(function(sig) {
          try {
            process6.on(sig, sigListeners[sig]);
            return true;
          } catch (er) {
            return false;
          }
        });
        process6.emit = processEmit;
        process6.reallyExit = processReallyExit;
      }, "load");
      module.exports.load = load;
      originalProcessReallyExit = process6.reallyExit;
      processReallyExit = /* @__PURE__ */ __name(function processReallyExit2(code) {
        if (!processOk(global.process)) {
          return;
        }
        process6.exitCode = code || /* istanbul ignore next */
        0;
        emit("exit", process6.exitCode, null);
        emit("afterexit", process6.exitCode, null);
        originalProcessReallyExit.call(process6, process6.exitCode);
      }, "processReallyExit");
      originalProcessEmit = process6.emit;
      processEmit = /* @__PURE__ */ __name(function processEmit2(ev, arg) {
        if (ev === "exit" && processOk(global.process)) {
          if (arg !== void 0) {
            process6.exitCode = arg;
          }
          var ret = originalProcessEmit.apply(this, arguments);
          emit("exit", process6.exitCode, null);
          emit("afterexit", process6.exitCode, null);
          return ret;
        } else {
          return originalProcessEmit.apply(this, arguments);
        }
      }, "processEmit");
    }
    var assert2;
    var signals;
    var isWin;
    var EE;
    var emitter;
    var unload;
    var emit;
    var sigListeners;
    var loaded;
    var load;
    var originalProcessReallyExit;
    var processReallyExit;
    var originalProcessEmit;
    var processEmit;
  }
});

// node_modules/.pnpm/get-stream@6.0.1/node_modules/get-stream/buffer-stream.js
var require_buffer_stream = __commonJS({
  "node_modules/.pnpm/get-stream@6.0.1/node_modules/get-stream/buffer-stream.js"(exports, module) {
    "use strict";
    var { PassThrough: PassThroughStream } = __require("stream");
    module.exports = (options) => {
      options = { ...options };
      const { array } = options;
      let { encoding } = options;
      const isBuffer = encoding === "buffer";
      let objectMode = false;
      if (array) {
        objectMode = !(encoding || isBuffer);
      } else {
        encoding = encoding || "utf8";
      }
      if (isBuffer) {
        encoding = null;
      }
      const stream = new PassThroughStream({ objectMode });
      if (encoding) {
        stream.setEncoding(encoding);
      }
      let length = 0;
      const chunks = [];
      stream.on("data", (chunk) => {
        chunks.push(chunk);
        if (objectMode) {
          length = chunks.length;
        } else {
          length += chunk.length;
        }
      });
      stream.getBufferedValue = () => {
        if (array) {
          return chunks;
        }
        return isBuffer ? Buffer.concat(chunks, length) : chunks.join("");
      };
      stream.getBufferedLength = () => length;
      return stream;
    };
  }
});

// node_modules/.pnpm/get-stream@6.0.1/node_modules/get-stream/index.js
var require_get_stream = __commonJS({
  "node_modules/.pnpm/get-stream@6.0.1/node_modules/get-stream/index.js"(exports, module) {
    "use strict";
    var { constants: BufferConstants } = __require("buffer");
    var stream = __require("stream");
    var { promisify } = __require("util");
    var bufferStream = require_buffer_stream();
    var streamPipelinePromisified = promisify(stream.pipeline);
    var MaxBufferError = class extends Error {
      static {
        __name(this, "MaxBufferError");
      }
      constructor() {
        super("maxBuffer exceeded");
        this.name = "MaxBufferError";
      }
    };
    async function getStream2(inputStream, options) {
      if (!inputStream) {
        throw new Error("Expected a stream");
      }
      options = {
        maxBuffer: Infinity,
        ...options
      };
      const { maxBuffer } = options;
      const stream2 = bufferStream(options);
      await new Promise((resolve, reject) => {
        const rejectPromise = /* @__PURE__ */ __name((error2) => {
          if (error2 && stream2.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
            error2.bufferedData = stream2.getBufferedValue();
          }
          reject(error2);
        }, "rejectPromise");
        (async () => {
          try {
            await streamPipelinePromisified(inputStream, stream2);
            resolve();
          } catch (error2) {
            rejectPromise(error2);
          }
        })();
        stream2.on("data", () => {
          if (stream2.getBufferedLength() > maxBuffer) {
            rejectPromise(new MaxBufferError());
          }
        });
      });
      return stream2.getBufferedValue();
    }
    __name(getStream2, "getStream");
    module.exports = getStream2;
    module.exports.buffer = (stream2, options) => getStream2(stream2, { ...options, encoding: "buffer" });
    module.exports.array = (stream2, options) => getStream2(stream2, { ...options, array: true });
    module.exports.MaxBufferError = MaxBufferError;
  }
});

// node_modules/.pnpm/merge-stream@2.0.0/node_modules/merge-stream/index.js
var require_merge_stream = __commonJS({
  "node_modules/.pnpm/merge-stream@2.0.0/node_modules/merge-stream/index.js"(exports, module) {
    "use strict";
    var { PassThrough } = __require("stream");
    module.exports = function() {
      var sources = [];
      var output = new PassThrough({ objectMode: true });
      output.setMaxListeners(0);
      output.add = add;
      output.isEmpty = isEmpty;
      output.on("unpipe", remove);
      Array.prototype.slice.call(arguments).forEach(add);
      return output;
      function add(source) {
        if (Array.isArray(source)) {
          source.forEach(add);
          return this;
        }
        sources.push(source);
        source.once("end", remove.bind(null, source));
        source.once("error", output.emit.bind(output, "error"));
        source.pipe(output, { end: false });
        return this;
      }
      __name(add, "add");
      function isEmpty() {
        return sources.length == 0;
      }
      __name(isEmpty, "isEmpty");
      function remove(source) {
        sources = sources.filter(function(it) {
          return it !== source;
        });
        if (!sources.length && output.readable) {
          output.end();
        }
      }
      __name(remove, "remove");
    };
  }
});

// node_modules/.pnpm/@octokit+plugin-paginate-rest@8.0.0_@octokit+core@5.0.0/node_modules/@octokit/plugin-paginate-rest/dist-node/index.js
var require_dist_node = __commonJS({
  "node_modules/.pnpm/@octokit+plugin-paginate-rest@8.0.0_@octokit+core@5.0.0/node_modules/@octokit/plugin-paginate-rest/dist-node/index.js"(exports, module) {
    "use strict";
    var __defProp9 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = /* @__PURE__ */ __name((target, all) => {
      for (var name in all)
        __defProp9(target, name, { get: all[name], enumerable: true });
    }, "__export");
    var __copyProps2 = /* @__PURE__ */ __name((to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp9(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    }, "__copyProps");
    var __toCommonJS = /* @__PURE__ */ __name((mod) => __copyProps2(__defProp9({}, "__esModule", { value: true }), mod), "__toCommonJS");
    var dist_src_exports = {};
    __export(dist_src_exports, {
      composePaginateRest: () => composePaginateRest,
      isPaginatingEndpoint: () => isPaginatingEndpoint,
      paginateRest: () => paginateRest2,
      paginatingEndpoints: () => paginatingEndpoints
    });
    module.exports = __toCommonJS(dist_src_exports);
    var VERSION5 = "8.0.0";
    function normalizePaginatedListResponse(response) {
      if (!response.data) {
        return {
          ...response,
          data: []
        };
      }
      const responseNeedsNormalization = "total_count" in response.data && !("url" in response.data);
      if (!responseNeedsNormalization)
        return response;
      const incompleteResults = response.data.incomplete_results;
      const repositorySelection = response.data.repository_selection;
      const totalCount = response.data.total_count;
      delete response.data.incomplete_results;
      delete response.data.repository_selection;
      delete response.data.total_count;
      const namespaceKey = Object.keys(response.data)[0];
      const data = response.data[namespaceKey];
      response.data = data;
      if (typeof incompleteResults !== "undefined") {
        response.data.incomplete_results = incompleteResults;
      }
      if (typeof repositorySelection !== "undefined") {
        response.data.repository_selection = repositorySelection;
      }
      response.data.total_count = totalCount;
      return response;
    }
    __name(normalizePaginatedListResponse, "normalizePaginatedListResponse");
    function iterator(octokit, route, parameters) {
      const options = typeof route === "function" ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters);
      const requestMethod = typeof route === "function" ? route : octokit.request;
      const method = options.method;
      const headers = options.headers;
      let url2 = options.url;
      return {
        [Symbol.asyncIterator]: () => ({
          async next() {
            if (!url2)
              return { done: true };
            try {
              const response = await requestMethod({ method, url: url2, headers });
              const normalizedResponse = normalizePaginatedListResponse(response);
              url2 = ((normalizedResponse.headers.link || "").match(
                /<([^>]+)>;\s*rel="next"/
              ) || [])[1];
              return { value: normalizedResponse };
            } catch (error2) {
              if (error2.status !== 409)
                throw error2;
              url2 = "";
              return {
                value: {
                  status: 200,
                  headers: {},
                  data: []
                }
              };
            }
          }
        })
      };
    }
    __name(iterator, "iterator");
    function paginate2(octokit, route, parameters, mapFn) {
      if (typeof parameters === "function") {
        mapFn = parameters;
        parameters = void 0;
      }
      return gather(
        octokit,
        [],
        iterator(octokit, route, parameters)[Symbol.asyncIterator](),
        mapFn
      );
    }
    __name(paginate2, "paginate");
    function gather(octokit, results, iterator2, mapFn) {
      return iterator2.next().then((result) => {
        if (result.done) {
          return results;
        }
        let earlyExit = false;
        function done() {
          earlyExit = true;
        }
        __name(done, "done");
        results = results.concat(
          mapFn ? mapFn(result.value, done) : result.value.data
        );
        if (earlyExit) {
          return results;
        }
        return gather(octokit, results, iterator2, mapFn);
      });
    }
    __name(gather, "gather");
    var composePaginateRest = Object.assign(paginate2, {
      iterator
    });
    var paginatingEndpoints = [
      "GET /app/hook/deliveries",
      "GET /app/installation-requests",
      "GET /app/installations",
      "GET /enterprises/{enterprise}/dependabot/alerts",
      "GET /enterprises/{enterprise}/secret-scanning/alerts",
      "GET /events",
      "GET /gists",
      "GET /gists/public",
      "GET /gists/starred",
      "GET /gists/{gist_id}/comments",
      "GET /gists/{gist_id}/commits",
      "GET /gists/{gist_id}/forks",
      "GET /installation/repositories",
      "GET /issues",
      "GET /licenses",
      "GET /marketplace_listing/plans",
      "GET /marketplace_listing/plans/{plan_id}/accounts",
      "GET /marketplace_listing/stubbed/plans",
      "GET /marketplace_listing/stubbed/plans/{plan_id}/accounts",
      "GET /networks/{owner}/{repo}/events",
      "GET /notifications",
      "GET /organizations",
      "GET /organizations/{org}/personal-access-token-requests",
      "GET /organizations/{org}/personal-access-token-requests/{pat_request_id}/repositories",
      "GET /organizations/{org}/personal-access-tokens",
      "GET /organizations/{org}/personal-access-tokens/{pat_id}/repositories",
      "GET /orgs/{org}/actions/cache/usage-by-repository",
      "GET /orgs/{org}/actions/permissions/repositories",
      "GET /orgs/{org}/actions/required_workflows",
      "GET /orgs/{org}/actions/runners",
      "GET /orgs/{org}/actions/secrets",
      "GET /orgs/{org}/actions/secrets/{secret_name}/repositories",
      "GET /orgs/{org}/actions/variables",
      "GET /orgs/{org}/actions/variables/{name}/repositories",
      "GET /orgs/{org}/blocks",
      "GET /orgs/{org}/code-scanning/alerts",
      "GET /orgs/{org}/codespaces",
      "GET /orgs/{org}/codespaces/secrets",
      "GET /orgs/{org}/codespaces/secrets/{secret_name}/repositories",
      "GET /orgs/{org}/dependabot/alerts",
      "GET /orgs/{org}/dependabot/secrets",
      "GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories",
      "GET /orgs/{org}/events",
      "GET /orgs/{org}/failed_invitations",
      "GET /orgs/{org}/hooks",
      "GET /orgs/{org}/hooks/{hook_id}/deliveries",
      "GET /orgs/{org}/installations",
      "GET /orgs/{org}/invitations",
      "GET /orgs/{org}/invitations/{invitation_id}/teams",
      "GET /orgs/{org}/issues",
      "GET /orgs/{org}/members",
      "GET /orgs/{org}/members/{username}/codespaces",
      "GET /orgs/{org}/migrations",
      "GET /orgs/{org}/migrations/{migration_id}/repositories",
      "GET /orgs/{org}/outside_collaborators",
      "GET /orgs/{org}/packages",
      "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
      "GET /orgs/{org}/projects",
      "GET /orgs/{org}/public_members",
      "GET /orgs/{org}/repos",
      "GET /orgs/{org}/rulesets",
      "GET /orgs/{org}/secret-scanning/alerts",
      "GET /orgs/{org}/teams",
      "GET /orgs/{org}/teams/{team_slug}/discussions",
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments",
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions",
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions",
      "GET /orgs/{org}/teams/{team_slug}/invitations",
      "GET /orgs/{org}/teams/{team_slug}/members",
      "GET /orgs/{org}/teams/{team_slug}/projects",
      "GET /orgs/{org}/teams/{team_slug}/repos",
      "GET /orgs/{org}/teams/{team_slug}/teams",
      "GET /projects/columns/{column_id}/cards",
      "GET /projects/{project_id}/collaborators",
      "GET /projects/{project_id}/columns",
      "GET /repos/{org}/{repo}/actions/required_workflows",
      "GET /repos/{owner}/{repo}/actions/artifacts",
      "GET /repos/{owner}/{repo}/actions/caches",
      "GET /repos/{owner}/{repo}/actions/organization-secrets",
      "GET /repos/{owner}/{repo}/actions/organization-variables",
      "GET /repos/{owner}/{repo}/actions/required_workflows/{required_workflow_id_for_repo}/runs",
      "GET /repos/{owner}/{repo}/actions/runners",
      "GET /repos/{owner}/{repo}/actions/runs",
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts",
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs",
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs",
      "GET /repos/{owner}/{repo}/actions/secrets",
      "GET /repos/{owner}/{repo}/actions/variables",
      "GET /repos/{owner}/{repo}/actions/workflows",
      "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
      "GET /repos/{owner}/{repo}/assignees",
      "GET /repos/{owner}/{repo}/branches",
      "GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations",
      "GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs",
      "GET /repos/{owner}/{repo}/code-scanning/alerts",
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
      "GET /repos/{owner}/{repo}/code-scanning/analyses",
      "GET /repos/{owner}/{repo}/codespaces",
      "GET /repos/{owner}/{repo}/codespaces/devcontainers",
      "GET /repos/{owner}/{repo}/codespaces/secrets",
      "GET /repos/{owner}/{repo}/collaborators",
      "GET /repos/{owner}/{repo}/comments",
      "GET /repos/{owner}/{repo}/comments/{comment_id}/reactions",
      "GET /repos/{owner}/{repo}/commits",
      "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments",
      "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls",
      "GET /repos/{owner}/{repo}/commits/{ref}/check-runs",
      "GET /repos/{owner}/{repo}/commits/{ref}/check-suites",
      "GET /repos/{owner}/{repo}/commits/{ref}/status",
      "GET /repos/{owner}/{repo}/commits/{ref}/statuses",
      "GET /repos/{owner}/{repo}/contributors",
      "GET /repos/{owner}/{repo}/dependabot/alerts",
      "GET /repos/{owner}/{repo}/dependabot/secrets",
      "GET /repos/{owner}/{repo}/deployments",
      "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses",
      "GET /repos/{owner}/{repo}/environments",
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies",
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/apps",
      "GET /repos/{owner}/{repo}/events",
      "GET /repos/{owner}/{repo}/forks",
      "GET /repos/{owner}/{repo}/hooks",
      "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries",
      "GET /repos/{owner}/{repo}/invitations",
      "GET /repos/{owner}/{repo}/issues",
      "GET /repos/{owner}/{repo}/issues/comments",
      "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions",
      "GET /repos/{owner}/{repo}/issues/events",
      "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
      "GET /repos/{owner}/{repo}/issues/{issue_number}/events",
      "GET /repos/{owner}/{repo}/issues/{issue_number}/labels",
      "GET /repos/{owner}/{repo}/issues/{issue_number}/reactions",
      "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline",
      "GET /repos/{owner}/{repo}/keys",
      "GET /repos/{owner}/{repo}/labels",
      "GET /repos/{owner}/{repo}/milestones",
      "GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels",
      "GET /repos/{owner}/{repo}/notifications",
      "GET /repos/{owner}/{repo}/pages/builds",
      "GET /repos/{owner}/{repo}/projects",
      "GET /repos/{owner}/{repo}/pulls",
      "GET /repos/{owner}/{repo}/pulls/comments",
      "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions",
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments",
      "GET /repos/{owner}/{repo}/releases",
      "GET /repos/{owner}/{repo}/releases/{release_id}/assets",
      "GET /repos/{owner}/{repo}/releases/{release_id}/reactions",
      "GET /repos/{owner}/{repo}/rules/branches/{branch}",
      "GET /repos/{owner}/{repo}/rulesets",
      "GET /repos/{owner}/{repo}/secret-scanning/alerts",
      "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations",
      "GET /repos/{owner}/{repo}/security-advisories",
      "GET /repos/{owner}/{repo}/stargazers",
      "GET /repos/{owner}/{repo}/subscribers",
      "GET /repos/{owner}/{repo}/tags",
      "GET /repos/{owner}/{repo}/teams",
      "GET /repos/{owner}/{repo}/topics",
      "GET /repositories",
      "GET /repositories/{repository_id}/environments/{environment_name}/secrets",
      "GET /repositories/{repository_id}/environments/{environment_name}/variables",
      "GET /search/code",
      "GET /search/commits",
      "GET /search/issues",
      "GET /search/labels",
      "GET /search/repositories",
      "GET /search/topics",
      "GET /search/users",
      "GET /teams/{team_id}/discussions",
      "GET /teams/{team_id}/discussions/{discussion_number}/comments",
      "GET /teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}/reactions",
      "GET /teams/{team_id}/discussions/{discussion_number}/reactions",
      "GET /teams/{team_id}/invitations",
      "GET /teams/{team_id}/members",
      "GET /teams/{team_id}/projects",
      "GET /teams/{team_id}/repos",
      "GET /teams/{team_id}/teams",
      "GET /user/blocks",
      "GET /user/codespaces",
      "GET /user/codespaces/secrets",
      "GET /user/emails",
      "GET /user/followers",
      "GET /user/following",
      "GET /user/gpg_keys",
      "GET /user/installations",
      "GET /user/installations/{installation_id}/repositories",
      "GET /user/issues",
      "GET /user/keys",
      "GET /user/marketplace_purchases",
      "GET /user/marketplace_purchases/stubbed",
      "GET /user/memberships/orgs",
      "GET /user/migrations",
      "GET /user/migrations/{migration_id}/repositories",
      "GET /user/orgs",
      "GET /user/packages",
      "GET /user/packages/{package_type}/{package_name}/versions",
      "GET /user/public_emails",
      "GET /user/repos",
      "GET /user/repository_invitations",
      "GET /user/social_accounts",
      "GET /user/ssh_signing_keys",
      "GET /user/starred",
      "GET /user/subscriptions",
      "GET /user/teams",
      "GET /users",
      "GET /users/{username}/events",
      "GET /users/{username}/events/orgs/{org}",
      "GET /users/{username}/events/public",
      "GET /users/{username}/followers",
      "GET /users/{username}/following",
      "GET /users/{username}/gists",
      "GET /users/{username}/gpg_keys",
      "GET /users/{username}/keys",
      "GET /users/{username}/orgs",
      "GET /users/{username}/packages",
      "GET /users/{username}/projects",
      "GET /users/{username}/received_events",
      "GET /users/{username}/received_events/public",
      "GET /users/{username}/repos",
      "GET /users/{username}/social_accounts",
      "GET /users/{username}/ssh_signing_keys",
      "GET /users/{username}/starred",
      "GET /users/{username}/subscriptions"
    ];
    function isPaginatingEndpoint(arg) {
      if (typeof arg === "string") {
        return paginatingEndpoints.includes(arg);
      } else {
        return false;
      }
    }
    __name(isPaginatingEndpoint, "isPaginatingEndpoint");
    function paginateRest2(octokit) {
      return {
        paginate: Object.assign(paginate2.bind(null, octokit), {
          iterator: iterator.bind(null, octokit)
        })
      };
    }
    __name(paginateRest2, "paginateRest");
    paginateRest2.VERSION = VERSION5;
  }
});

// node_modules/.pnpm/@unlike+github-actions-core@0.1.2/node_modules/@unlike/github-actions-core/dist/variables.js
import { EOL as EOL3 } from "node:os";

// node_modules/.pnpm/@unlike+github-actions-core@0.1.2/node_modules/@unlike/github-actions-core/dist/lib/command.js
import { EOL } from "node:os";

// node_modules/.pnpm/@unlike+github-actions-core@0.1.2/node_modules/@unlike/github-actions-core/dist/lib/utils.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var toCommandValue = /* @__PURE__ */ __name2((input) => {
  if (input === null || input === void 0) {
    return "";
  } else if (typeof input === "string" || input instanceof String) {
    return input;
  }
  return JSON.stringify(input);
}, "toCommandValue");
var toCommandProperties = /* @__PURE__ */ __name2((annotationProperties) => {
  if (!annotationProperties || Object.keys(annotationProperties).length === 0) {
    return {};
  }
  return {
    title: annotationProperties.title,
    file: annotationProperties.file,
    line: annotationProperties.startLine,
    endLine: annotationProperties.endLine,
    col: annotationProperties.startColumn,
    endColumn: annotationProperties.endColumn
  };
}, "toCommandProperties");

// node_modules/.pnpm/@unlike+github-actions-core@0.1.2/node_modules/@unlike/github-actions-core/dist/lib/command.js
var __defProp3 = Object.defineProperty;
var __name3 = /* @__PURE__ */ __name((target, value) => __defProp3(target, "name", { value, configurable: true }), "__name");
var issueCommand = /* @__PURE__ */ __name3((command, properties, message) => {
  const cmd = new Command(command, properties, message);
  process.stdout.write(cmd.toString() + EOL);
}, "issueCommand");
var CMD_STRING = "::";
var Command = class {
  static {
    __name(this, "Command");
  }
  static {
    __name3(this, "Command");
  }
  #command;
  #message;
  #properties;
  constructor(command, properties, message) {
    if (!command) {
      command = "missing.command";
    }
    this.#command = command;
    this.#properties = properties;
    this.#message = message;
  }
  toString() {
    let cmdStr = CMD_STRING + this.#command;
    if (this.#properties && Object.keys(this.#properties).length > 0) {
      cmdStr += " ";
      let first = true;
      for (const key in this.#properties) {
        if (this.#properties.hasOwnProperty(key)) {
          const val = this.#properties[key];
          if (val) {
            if (first) {
              first = false;
            } else {
              cmdStr += ",";
            }
            cmdStr += `${key}=${escapeProperty(val)}`;
          }
        }
      }
    }
    cmdStr += `${CMD_STRING}${escapeData(this.#message)}`;
    return cmdStr;
  }
};
function escapeData(s) {
  return toCommandValue(s).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
}
__name(escapeData, "escapeData");
__name3(escapeData, "escapeData");
function escapeProperty(s) {
  return toCommandValue(s).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A").replaceAll(":", "%3A").replaceAll(",", "%2C");
}
__name(escapeProperty, "escapeProperty");
__name3(escapeProperty, "escapeProperty");

// node_modules/.pnpm/@unlike+github-actions-core@0.1.2/node_modules/@unlike/github-actions-core/dist/lib/file-command.js
import { randomUUID as uuidv4 } from "node:crypto";
import { appendFileSync, existsSync } from "node:fs";
import { EOL as EOL2 } from "node:os";
var __defProp4 = Object.defineProperty;
var __name4 = /* @__PURE__ */ __name((target, value) => __defProp4(target, "name", { value, configurable: true }), "__name");
var issueFileCommand = /* @__PURE__ */ __name4((command, message) => {
  const filePath = process.env[`GITHUB_${command}`];
  if (!filePath) {
    throw new Error(
      `Unable to find environment variable for file command ${command}`
    );
  }
  if (!existsSync(filePath)) {
    throw new Error(`Missing file at path: ${filePath}`);
  }
  appendFileSync(filePath, `${toCommandValue(message)}${EOL2}`, {
    encoding: "utf8"
  });
}, "issueFileCommand");
var prepareKeyValueMessage = /* @__PURE__ */ __name4((key, value) => {
  const delimiter = `ghadelimiter_${uuidv4()}`;
  const convertedValue = toCommandValue(value);
  if (key.includes(delimiter)) {
    throw new Error(
      `Unexpected input: name should not contain the delimiter "${delimiter}"`
    );
  }
  if (convertedValue.includes(delimiter)) {
    throw new Error(
      `Unexpected input: value should not contain the delimiter "${delimiter}"`
    );
  }
  return `${key}<<${delimiter}${EOL2}${convertedValue}${EOL2}${delimiter}`;
}, "prepareKeyValueMessage");

// node_modules/.pnpm/@unlike+github-actions-core@0.1.2/node_modules/@unlike/github-actions-core/dist/variables.js
var __defProp5 = Object.defineProperty;
var __name5 = /* @__PURE__ */ __name((target, value) => __defProp5(target, "name", { value, configurable: true }), "__name");
var getInput = /* @__PURE__ */ __name5((name, options) => {
  const val = process.env[`INPUT_${name.replaceAll(" ", "_").toUpperCase()}`] || "";
  if (options && options.required && !val) {
    throw new Error(`Input required and not supplied: ${name}`);
  }
  if (options && options.trimWhitespace === false) {
    return val;
  }
  return val.trim();
}, "getInput");
var setOutput = /* @__PURE__ */ __name5((name, value) => {
  const filePath = process.env["GITHUB_OUTPUT"] || "";
  if (filePath) {
    return issueFileCommand("OUTPUT", prepareKeyValueMessage(name, value));
  }
  process.stdout.write(EOL3);
  issueCommand("set-output", { name }, toCommandValue(value));
}, "setOutput");

// node_modules/.pnpm/@unlike+github-actions-core@0.1.2/node_modules/@unlike/github-actions-core/dist/types.js
var ExitCode = /* @__PURE__ */ ((ExitCode2) => {
  ExitCode2[ExitCode2["Success"] = 0] = "Success";
  ExitCode2[ExitCode2["Failure"] = 1] = "Failure";
  return ExitCode2;
})(ExitCode || {});

// node_modules/.pnpm/@unlike+github-actions-core@0.1.2/node_modules/@unlike/github-actions-core/dist/errors.js
var __defProp6 = Object.defineProperty;
var __name6 = /* @__PURE__ */ __name((target, value) => __defProp6(target, "name", { value, configurable: true }), "__name");
var error = /* @__PURE__ */ __name6((message, properties = {}) => {
  issueCommand(
    "error",
    toCommandProperties(properties),
    message instanceof Error ? message.toString() : message
  );
}, "error");
var setFailed = /* @__PURE__ */ __name6((message) => {
  process.exitCode = ExitCode.Failure;
  error(message);
}, "setFailed");

// node_modules/.pnpm/@unlike+github-actions-core@0.1.2/node_modules/@unlike/github-actions-core/dist/logging.js
import { EOL as EOL4 } from "node:os";
var __defProp7 = Object.defineProperty;
var __name7 = /* @__PURE__ */ __name((target, value) => __defProp7(target, "name", { value, configurable: true }), "__name");
var isDebug = /* @__PURE__ */ __name7(() => {
  return process.env["RUNNER_DEBUG"] === "1";
}, "isDebug");
var debug = /* @__PURE__ */ __name7((message) => {
  issueCommand("debug", {}, message);
}, "debug");
var warning = /* @__PURE__ */ __name7((message, properties = {}) => {
  issueCommand(
    "warning",
    toCommandProperties(properties),
    message instanceof Error ? message.toString() : message
  );
}, "warning");
var info = /* @__PURE__ */ __name7((message) => {
  process.stdout.write(message + EOL4);
}, "info");

// node_modules/.pnpm/@unlike+github-actions-core@0.1.2/node_modules/@unlike/github-actions-core/dist/lib/summary.js
import { constants, promises } from "node:fs";
import { EOL as EOL5 } from "node:os";
var __defProp8 = Object.defineProperty;
var __name8 = /* @__PURE__ */ __name((target, value) => __defProp8(target, "name", { value, configurable: true }), "__name");
var { access, appendFile, writeFile } = promises;
var SUMMARY_ENV_VAR = "GITHUB_STEP_SUMMARY";
var Summary = class {
  static {
    __name(this, "Summary");
  }
  static {
    __name8(this, "Summary");
  }
  #buffer;
  #filePath;
  constructor() {
    this.#buffer = "";
  }
  /**
   * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
   * Also checks r/w permissions.
   *
   * @returns step summary file path
   */
  async #fileSummaryPath() {
    if (this.#filePath) {
      return this.#filePath;
    }
    const pathFromEnv = process.env[SUMMARY_ENV_VAR];
    if (!pathFromEnv) {
      throw new Error(
        `Unable to find environment variable for $${SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`
      );
    }
    try {
      await access(pathFromEnv, constants.R_OK | constants.W_OK);
    } catch {
      throw new Error(
        `Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`
      );
    }
    this.#filePath = pathFromEnv;
    return this.#filePath;
  }
  /**
   * Wraps content in an HTML tag, adding any HTML attributes
   *
   * @param {string} tag HTML tag to wrap
   * @param {string | null} content content within the tag
   * @param {[attribute: string]: string} attrs key-value list of HTML attributes to add
   *
   * @returns {string} content wrapped in HTML element
   */
  #wrap(tag, content, attrs = {}) {
    const htmlAttrs = Object.entries(attrs).map(([key, value]) => ` ${key}="${value}"`).join("");
    if (!content) {
      return `<${tag}${htmlAttrs}>`;
    }
    return `<${tag}${htmlAttrs}>${content}</${tag}>`;
  }
  /**
   * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
   *
   * @param {SummaryWriteOptions} [options] (optional) options for write operation
   *
   * @returns {Promise<Summary>} summary instance
   */
  async write(options) {
    const overwrite = !!options?.overwrite;
    const filePath = await this.#fileSummaryPath();
    const writeFunc = overwrite ? writeFile : appendFile;
    await writeFunc(filePath, this.#buffer, { encoding: "utf8" });
    return this.emptyBuffer();
  }
  /**
   * Clears the summary buffer and wipes the summary file
   *
   * @returns {Summary} summary instance
   */
  async clear() {
    return this.emptyBuffer().write({ overwrite: true });
  }
  /**
   * Returns the current summary buffer as a string
   *
   * @returns {string} string of summary buffer
   */
  stringify() {
    return this.#buffer;
  }
  /**
   * If the summary buffer is empty
   *
   * @returns {boolen} true if the buffer is empty
   */
  isEmptyBuffer() {
    return this.#buffer.length === 0;
  }
  /**
   * Resets the summary buffer without writing to summary file
   *
   * @returns {Summary} summary instance
   */
  emptyBuffer() {
    this.#buffer = "";
    return this;
  }
  /**
   * Adds raw text to the summary buffer
   *
   * @param {string} text content to add
   * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
   *
   * @returns {Summary} summary instance
   */
  addRaw(text, addEOL = false) {
    this.#buffer += text;
    return addEOL ? this.addEOL() : this;
  }
  /**
   * Adds the operating system-specific end-of-line marker to the buffer
   *
   * @returns {Summary} summary instance
   */
  addEOL() {
    return this.addRaw(EOL5);
  }
  /**
   * Adds an HTML codeblock to the summary buffer
   *
   * @param {string} code content to render within fenced code block
   * @param {string} lang (optional) language to syntax highlight code
   *
   * @returns {Summary} summary instance
   */
  addCodeBlock(code, lang) {
    const attrs = {
      ...lang && { lang }
    };
    const element = this.#wrap("pre", this.#wrap("code", code), attrs);
    return this.addRaw(element).addEOL();
  }
  /**
   * Adds an HTML list to the summary buffer
   *
   * @param {string[]} items list of items to render
   * @param {boolean} [ordered=false] (optional) if the rendered list should be ordered or not (default: false)
   *
   * @returns {Summary} summary instance
   */
  addList(items, ordered = false) {
    const tag = ordered ? "ol" : "ul";
    const listItems = items.map((item) => this.#wrap("li", item)).join("");
    const element = this.#wrap(tag, listItems);
    return this.addRaw(element).addEOL();
  }
  /**
   * Adds an HTML table to the summary buffer
   *
   * @param {SummaryTableCell[]} rows table rows
   *
   * @returns {Summary} summary instance
   */
  addTable(rows) {
    const tableBody = rows.map((row) => {
      const cells = row.map((cell) => {
        if (typeof cell === "string") {
          return this.#wrap("td", cell);
        }
        const { header, data, colspan, rowspan } = cell;
        const tag = header ? "th" : "td";
        const attrs = {
          ...colspan && { colspan },
          ...rowspan && { rowspan }
        };
        return this.#wrap(tag, data, attrs);
      }).join("");
      return this.#wrap("tr", cells);
    }).join("");
    const element = this.#wrap("table", tableBody);
    return this.addRaw(element).addEOL();
  }
  /**
   * Adds a collapsable HTML details element to the summary buffer
   *
   * @param {string} label text for the closed state
   * @param {string} content collapsable content
   *
   * @returns {Summary} summary instance
   */
  addDetails(label, content) {
    const element = this.#wrap(
      "details",
      this.#wrap("summary", label) + content
    );
    return this.addRaw(element).addEOL();
  }
  /**
   * Adds an HTML image tag to the summary buffer
   *
   * @param {string} src path to the image you to embed
   * @param {string} alt text description of the image
   * @param {SummaryImageOptions} options (optional) addition image attributes
   *
   * @returns {Summary} summary instance
   */
  addImage(src, alt, options) {
    const { width, height } = options || {};
    const attrs = {
      ...width && { width },
      ...height && { height }
    };
    const element = this.#wrap("img", null, { src, alt, ...attrs });
    return this.addRaw(element).addEOL();
  }
  /**
   * Adds an HTML section heading element
   *
   * @param {string} text heading text
   * @param {number | string} [level=1] (optional) the heading level, default: 1
   *
   * @returns {Summary} summary instance
   */
  addHeading(text, level) {
    const tag = `h${level}`;
    const allowedTag = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag) ? tag : "h1";
    const element = this.#wrap(allowedTag, text);
    return this.addRaw(element).addEOL();
  }
  /**
   * Adds an HTML thematic break (<hr>) to the summary buffer
   *
   * @returns {Summary} summary instance
   */
  addSeparator() {
    const element = this.#wrap("hr", null);
    return this.addRaw(element).addEOL();
  }
  /**
   * Adds an HTML line break (<br>) to the summary buffer
   *
   * @returns {Summary} summary instance
   */
  addBreak() {
    const element = this.#wrap("br", null);
    return this.addRaw(element).addEOL();
  }
  /**
   * Adds an HTML blockquote to the summary buffer
   *
   * @param {string} text quote text
   * @param {string} cite (optional) citation url
   *
   * @returns {Summary} summary instance
   */
  addQuote(text, cite) {
    const attrs = {
      ...cite && { cite }
    };
    const element = this.#wrap("blockquote", text, attrs);
    return this.addRaw(element).addEOL();
  }
  /**
   * Adds an HTML anchor tag to the summary buffer
   *
   * @param {string} text link text/content
   * @param {string} href hyperlink
   *
   * @returns {Summary} summary instance
   */
  addLink(text, href) {
    const element = this.#wrap("a", text, { href });
    return this.addRaw(element).addEOL();
  }
};
var _summary = new Summary();
var summary = _summary;

// src/cloudflare/deployment/create.ts
import { strict } from "node:assert";

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/index.js
var import_cross_spawn = __toESM(require_cross_spawn(), 1);
import { Buffer as Buffer3 } from "node:buffer";
import path2 from "node:path";
import childProcess from "node:child_process";
import process5 from "node:process";

// node_modules/.pnpm/strip-final-newline@3.0.0/node_modules/strip-final-newline/index.js
function stripFinalNewline(input) {
  const LF = typeof input === "string" ? "\n" : "\n".charCodeAt();
  const CR = typeof input === "string" ? "\r" : "\r".charCodeAt();
  if (input[input.length - 1] === LF) {
    input = input.slice(0, -1);
  }
  if (input[input.length - 1] === CR) {
    input = input.slice(0, -1);
  }
  return input;
}
__name(stripFinalNewline, "stripFinalNewline");

// node_modules/.pnpm/npm-run-path@5.1.0/node_modules/npm-run-path/index.js
import process2 from "node:process";
import path from "node:path";
import url from "node:url";

// node_modules/.pnpm/path-key@4.0.0/node_modules/path-key/index.js
function pathKey(options = {}) {
  const {
    env = process.env,
    platform = process.platform
  } = options;
  if (platform !== "win32") {
    return "PATH";
  }
  return Object.keys(env).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
}
__name(pathKey, "pathKey");

// node_modules/.pnpm/npm-run-path@5.1.0/node_modules/npm-run-path/index.js
function npmRunPath(options = {}) {
  const {
    cwd = process2.cwd(),
    path: path_ = process2.env[pathKey()],
    execPath = process2.execPath
  } = options;
  let previous;
  const cwdString = cwd instanceof URL ? url.fileURLToPath(cwd) : cwd;
  let cwdPath = path.resolve(cwdString);
  const result = [];
  while (previous !== cwdPath) {
    result.push(path.join(cwdPath, "node_modules/.bin"));
    previous = cwdPath;
    cwdPath = path.resolve(cwdPath, "..");
  }
  result.push(path.resolve(cwdString, execPath, ".."));
  return [...result, path_].join(path.delimiter);
}
__name(npmRunPath, "npmRunPath");
function npmRunPathEnv({ env = process2.env, ...options } = {}) {
  env = { ...env };
  const path3 = pathKey({ env });
  options.path = env[path3];
  env[path3] = npmRunPath(options);
  return env;
}
__name(npmRunPathEnv, "npmRunPathEnv");

// node_modules/.pnpm/mimic-fn@4.0.0/node_modules/mimic-fn/index.js
var copyProperty = /* @__PURE__ */ __name((to, from, property, ignoreNonConfigurable) => {
  if (property === "length" || property === "prototype") {
    return;
  }
  if (property === "arguments" || property === "caller") {
    return;
  }
  const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
  const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);
  if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
    return;
  }
  Object.defineProperty(to, property, fromDescriptor);
}, "copyProperty");
var canCopyProperty = /* @__PURE__ */ __name(function(toDescriptor, fromDescriptor) {
  return toDescriptor === void 0 || toDescriptor.configurable || toDescriptor.writable === fromDescriptor.writable && toDescriptor.enumerable === fromDescriptor.enumerable && toDescriptor.configurable === fromDescriptor.configurable && (toDescriptor.writable || toDescriptor.value === fromDescriptor.value);
}, "canCopyProperty");
var changePrototype = /* @__PURE__ */ __name((to, from) => {
  const fromPrototype = Object.getPrototypeOf(from);
  if (fromPrototype === Object.getPrototypeOf(to)) {
    return;
  }
  Object.setPrototypeOf(to, fromPrototype);
}, "changePrototype");
var wrappedToString = /* @__PURE__ */ __name((withName, fromBody) => `/* Wrapped ${withName}*/
${fromBody}`, "wrappedToString");
var toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, "toString");
var toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
var changeToString = /* @__PURE__ */ __name((to, from, name) => {
  const withName = name === "" ? "" : `with ${name.trim()}() `;
  const newToString = wrappedToString.bind(null, withName, from.toString());
  Object.defineProperty(newToString, "name", toStringName);
  Object.defineProperty(to, "toString", { ...toStringDescriptor, value: newToString });
}, "changeToString");
function mimicFunction(to, from, { ignoreNonConfigurable = false } = {}) {
  const { name } = to;
  for (const property of Reflect.ownKeys(from)) {
    copyProperty(to, from, property, ignoreNonConfigurable);
  }
  changePrototype(to, from);
  changeToString(to, from, name);
  return to;
}
__name(mimicFunction, "mimicFunction");

// node_modules/.pnpm/onetime@6.0.0/node_modules/onetime/index.js
var calledFunctions = /* @__PURE__ */ new WeakMap();
var onetime = /* @__PURE__ */ __name((function_, options = {}) => {
  if (typeof function_ !== "function") {
    throw new TypeError("Expected a function");
  }
  let returnValue;
  let callCount = 0;
  const functionName = function_.displayName || function_.name || "<anonymous>";
  const onetime2 = /* @__PURE__ */ __name(function(...arguments_) {
    calledFunctions.set(onetime2, ++callCount);
    if (callCount === 1) {
      returnValue = function_.apply(this, arguments_);
      function_ = null;
    } else if (options.throw === true) {
      throw new Error(`Function \`${functionName}\` can only be called once`);
    }
    return returnValue;
  }, "onetime");
  mimicFunction(onetime2, function_);
  calledFunctions.set(onetime2, callCount);
  return onetime2;
}, "onetime");
onetime.callCount = (function_) => {
  if (!calledFunctions.has(function_)) {
    throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
  }
  return calledFunctions.get(function_);
};
var onetime_default = onetime;

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/lib/error.js
import process3 from "node:process";

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/main.js
import { constants as constants3 } from "node:os";

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/realtime.js
var getRealtimeSignals = /* @__PURE__ */ __name(() => {
  const length = SIGRTMAX - SIGRTMIN + 1;
  return Array.from({ length }, getRealtimeSignal);
}, "getRealtimeSignals");
var getRealtimeSignal = /* @__PURE__ */ __name((value, index) => ({
  name: `SIGRT${index + 1}`,
  number: SIGRTMIN + index,
  action: "terminate",
  description: "Application-specific signal (realtime)",
  standard: "posix"
}), "getRealtimeSignal");
var SIGRTMIN = 34;
var SIGRTMAX = 64;

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/signals.js
import { constants as constants2 } from "node:os";

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/core.js
var SIGNALS = [
  {
    name: "SIGHUP",
    number: 1,
    action: "terminate",
    description: "Terminal closed",
    standard: "posix"
  },
  {
    name: "SIGINT",
    number: 2,
    action: "terminate",
    description: "User interruption with CTRL-C",
    standard: "ansi"
  },
  {
    name: "SIGQUIT",
    number: 3,
    action: "core",
    description: "User interruption with CTRL-\\",
    standard: "posix"
  },
  {
    name: "SIGILL",
    number: 4,
    action: "core",
    description: "Invalid machine instruction",
    standard: "ansi"
  },
  {
    name: "SIGTRAP",
    number: 5,
    action: "core",
    description: "Debugger breakpoint",
    standard: "posix"
  },
  {
    name: "SIGABRT",
    number: 6,
    action: "core",
    description: "Aborted",
    standard: "ansi"
  },
  {
    name: "SIGIOT",
    number: 6,
    action: "core",
    description: "Aborted",
    standard: "bsd"
  },
  {
    name: "SIGBUS",
    number: 7,
    action: "core",
    description: "Bus error due to misaligned, non-existing address or paging error",
    standard: "bsd"
  },
  {
    name: "SIGEMT",
    number: 7,
    action: "terminate",
    description: "Command should be emulated but is not implemented",
    standard: "other"
  },
  {
    name: "SIGFPE",
    number: 8,
    action: "core",
    description: "Floating point arithmetic error",
    standard: "ansi"
  },
  {
    name: "SIGKILL",
    number: 9,
    action: "terminate",
    description: "Forced termination",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGUSR1",
    number: 10,
    action: "terminate",
    description: "Application-specific signal",
    standard: "posix"
  },
  {
    name: "SIGSEGV",
    number: 11,
    action: "core",
    description: "Segmentation fault",
    standard: "ansi"
  },
  {
    name: "SIGUSR2",
    number: 12,
    action: "terminate",
    description: "Application-specific signal",
    standard: "posix"
  },
  {
    name: "SIGPIPE",
    number: 13,
    action: "terminate",
    description: "Broken pipe or socket",
    standard: "posix"
  },
  {
    name: "SIGALRM",
    number: 14,
    action: "terminate",
    description: "Timeout or timer",
    standard: "posix"
  },
  {
    name: "SIGTERM",
    number: 15,
    action: "terminate",
    description: "Termination",
    standard: "ansi"
  },
  {
    name: "SIGSTKFLT",
    number: 16,
    action: "terminate",
    description: "Stack is empty or overflowed",
    standard: "other"
  },
  {
    name: "SIGCHLD",
    number: 17,
    action: "ignore",
    description: "Child process terminated, paused or unpaused",
    standard: "posix"
  },
  {
    name: "SIGCLD",
    number: 17,
    action: "ignore",
    description: "Child process terminated, paused or unpaused",
    standard: "other"
  },
  {
    name: "SIGCONT",
    number: 18,
    action: "unpause",
    description: "Unpaused",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGSTOP",
    number: 19,
    action: "pause",
    description: "Paused",
    standard: "posix",
    forced: true
  },
  {
    name: "SIGTSTP",
    number: 20,
    action: "pause",
    description: 'Paused using CTRL-Z or "suspend"',
    standard: "posix"
  },
  {
    name: "SIGTTIN",
    number: 21,
    action: "pause",
    description: "Background process cannot read terminal input",
    standard: "posix"
  },
  {
    name: "SIGBREAK",
    number: 21,
    action: "terminate",
    description: "User interruption with CTRL-BREAK",
    standard: "other"
  },
  {
    name: "SIGTTOU",
    number: 22,
    action: "pause",
    description: "Background process cannot write to terminal output",
    standard: "posix"
  },
  {
    name: "SIGURG",
    number: 23,
    action: "ignore",
    description: "Socket received out-of-band data",
    standard: "bsd"
  },
  {
    name: "SIGXCPU",
    number: 24,
    action: "core",
    description: "Process timed out",
    standard: "bsd"
  },
  {
    name: "SIGXFSZ",
    number: 25,
    action: "core",
    description: "File too big",
    standard: "bsd"
  },
  {
    name: "SIGVTALRM",
    number: 26,
    action: "terminate",
    description: "Timeout or timer",
    standard: "bsd"
  },
  {
    name: "SIGPROF",
    number: 27,
    action: "terminate",
    description: "Timeout or timer",
    standard: "bsd"
  },
  {
    name: "SIGWINCH",
    number: 28,
    action: "ignore",
    description: "Terminal window size changed",
    standard: "bsd"
  },
  {
    name: "SIGIO",
    number: 29,
    action: "terminate",
    description: "I/O is available",
    standard: "other"
  },
  {
    name: "SIGPOLL",
    number: 29,
    action: "terminate",
    description: "Watched event",
    standard: "other"
  },
  {
    name: "SIGINFO",
    number: 29,
    action: "ignore",
    description: "Request for process information",
    standard: "other"
  },
  {
    name: "SIGPWR",
    number: 30,
    action: "terminate",
    description: "Device running out of power",
    standard: "systemv"
  },
  {
    name: "SIGSYS",
    number: 31,
    action: "core",
    description: "Invalid system call",
    standard: "other"
  },
  {
    name: "SIGUNUSED",
    number: 31,
    action: "terminate",
    description: "Invalid system call",
    standard: "other"
  }
];

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/signals.js
var getSignals = /* @__PURE__ */ __name(() => {
  const realtimeSignals = getRealtimeSignals();
  const signals = [...SIGNALS, ...realtimeSignals].map(normalizeSignal);
  return signals;
}, "getSignals");
var normalizeSignal = /* @__PURE__ */ __name(({
  name,
  number: defaultNumber,
  description,
  action,
  forced = false,
  standard
}) => {
  const {
    signals: { [name]: constantSignal }
  } = constants2;
  const supported = constantSignal !== void 0;
  const number = supported ? constantSignal : defaultNumber;
  return { name, number, description, supported, action, forced, standard };
}, "normalizeSignal");

// node_modules/.pnpm/human-signals@4.3.1/node_modules/human-signals/build/src/main.js
var getSignalsByName = /* @__PURE__ */ __name(() => {
  const signals = getSignals();
  return Object.fromEntries(signals.map(getSignalByName));
}, "getSignalsByName");
var getSignalByName = /* @__PURE__ */ __name(({
  name,
  number,
  description,
  supported,
  action,
  forced,
  standard
}) => [name, { name, number, description, supported, action, forced, standard }], "getSignalByName");
var signalsByName = getSignalsByName();
var getSignalsByNumber = /* @__PURE__ */ __name(() => {
  const signals = getSignals();
  const length = SIGRTMAX + 1;
  const signalsA = Array.from({ length }, (value, number) => getSignalByNumber(number, signals));
  return Object.assign({}, ...signalsA);
}, "getSignalsByNumber");
var getSignalByNumber = /* @__PURE__ */ __name((number, signals) => {
  const signal = findSignalByNumber(number, signals);
  if (signal === void 0) {
    return {};
  }
  const { name, description, supported, action, forced, standard } = signal;
  return {
    [number]: {
      name,
      number,
      description,
      supported,
      action,
      forced,
      standard
    }
  };
}, "getSignalByNumber");
var findSignalByNumber = /* @__PURE__ */ __name((number, signals) => {
  const signal = signals.find(({ name }) => constants3.signals[name] === number);
  if (signal !== void 0) {
    return signal;
  }
  return signals.find((signalA) => signalA.number === number);
}, "findSignalByNumber");
var signalsByNumber = getSignalsByNumber();

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/lib/error.js
var getErrorPrefix = /* @__PURE__ */ __name(({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled }) => {
  if (timedOut) {
    return `timed out after ${timeout} milliseconds`;
  }
  if (isCanceled) {
    return "was canceled";
  }
  if (errorCode !== void 0) {
    return `failed with ${errorCode}`;
  }
  if (signal !== void 0) {
    return `was killed with ${signal} (${signalDescription})`;
  }
  if (exitCode !== void 0) {
    return `failed with exit code ${exitCode}`;
  }
  return "failed";
}, "getErrorPrefix");
var makeError = /* @__PURE__ */ __name(({
  stdout,
  stderr,
  all,
  error: error2,
  signal,
  exitCode,
  command,
  escapedCommand,
  timedOut,
  isCanceled,
  killed,
  parsed: { options: { timeout, cwd = process3.cwd() } }
}) => {
  exitCode = exitCode === null ? void 0 : exitCode;
  signal = signal === null ? void 0 : signal;
  const signalDescription = signal === void 0 ? void 0 : signalsByName[signal].description;
  const errorCode = error2 && error2.code;
  const prefix = getErrorPrefix({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled });
  const execaMessage = `Command ${prefix}: ${command}`;
  const isError = Object.prototype.toString.call(error2) === "[object Error]";
  const shortMessage = isError ? `${execaMessage}
${error2.message}` : execaMessage;
  const message = [shortMessage, stderr, stdout].filter(Boolean).join("\n");
  if (isError) {
    error2.originalMessage = error2.message;
    error2.message = message;
  } else {
    error2 = new Error(message);
  }
  error2.shortMessage = shortMessage;
  error2.command = command;
  error2.escapedCommand = escapedCommand;
  error2.exitCode = exitCode;
  error2.signal = signal;
  error2.signalDescription = signalDescription;
  error2.stdout = stdout;
  error2.stderr = stderr;
  error2.cwd = cwd;
  if (all !== void 0) {
    error2.all = all;
  }
  if ("bufferedData" in error2) {
    delete error2.bufferedData;
  }
  error2.failed = true;
  error2.timedOut = Boolean(timedOut);
  error2.isCanceled = isCanceled;
  error2.killed = killed && !timedOut;
  return error2;
}, "makeError");

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/lib/stdio.js
var aliases = ["stdin", "stdout", "stderr"];
var hasAlias = /* @__PURE__ */ __name((options) => aliases.some((alias) => options[alias] !== void 0), "hasAlias");
var normalizeStdio = /* @__PURE__ */ __name((options) => {
  if (!options) {
    return;
  }
  const { stdio } = options;
  if (stdio === void 0) {
    return aliases.map((alias) => options[alias]);
  }
  if (hasAlias(options)) {
    throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${aliases.map((alias) => `\`${alias}\``).join(", ")}`);
  }
  if (typeof stdio === "string") {
    return stdio;
  }
  if (!Array.isArray(stdio)) {
    throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
  }
  const length = Math.max(stdio.length, aliases.length);
  return Array.from({ length }, (value, index) => stdio[index]);
}, "normalizeStdio");

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/lib/kill.js
var import_signal_exit = __toESM(require_signal_exit(), 1);
import os from "node:os";
var DEFAULT_FORCE_KILL_TIMEOUT = 1e3 * 5;
var spawnedKill = /* @__PURE__ */ __name((kill, signal = "SIGTERM", options = {}) => {
  const killResult = kill(signal);
  setKillTimeout(kill, signal, options, killResult);
  return killResult;
}, "spawnedKill");
var setKillTimeout = /* @__PURE__ */ __name((kill, signal, options, killResult) => {
  if (!shouldForceKill(signal, options, killResult)) {
    return;
  }
  const timeout = getForceKillAfterTimeout(options);
  const t = setTimeout(() => {
    kill("SIGKILL");
  }, timeout);
  if (t.unref) {
    t.unref();
  }
}, "setKillTimeout");
var shouldForceKill = /* @__PURE__ */ __name((signal, { forceKillAfterTimeout }, killResult) => isSigterm(signal) && forceKillAfterTimeout !== false && killResult, "shouldForceKill");
var isSigterm = /* @__PURE__ */ __name((signal) => signal === os.constants.signals.SIGTERM || typeof signal === "string" && signal.toUpperCase() === "SIGTERM", "isSigterm");
var getForceKillAfterTimeout = /* @__PURE__ */ __name(({ forceKillAfterTimeout = true }) => {
  if (forceKillAfterTimeout === true) {
    return DEFAULT_FORCE_KILL_TIMEOUT;
  }
  if (!Number.isFinite(forceKillAfterTimeout) || forceKillAfterTimeout < 0) {
    throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${forceKillAfterTimeout}\` (${typeof forceKillAfterTimeout})`);
  }
  return forceKillAfterTimeout;
}, "getForceKillAfterTimeout");
var spawnedCancel = /* @__PURE__ */ __name((spawned, context) => {
  const killResult = spawned.kill();
  if (killResult) {
    context.isCanceled = true;
  }
}, "spawnedCancel");
var timeoutKill = /* @__PURE__ */ __name((spawned, signal, reject) => {
  spawned.kill(signal);
  reject(Object.assign(new Error("Timed out"), { timedOut: true, signal }));
}, "timeoutKill");
var setupTimeout = /* @__PURE__ */ __name((spawned, { timeout, killSignal = "SIGTERM" }, spawnedPromise) => {
  if (timeout === 0 || timeout === void 0) {
    return spawnedPromise;
  }
  let timeoutId;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      timeoutKill(spawned, killSignal, reject);
    }, timeout);
  });
  const safeSpawnedPromise = spawnedPromise.finally(() => {
    clearTimeout(timeoutId);
  });
  return Promise.race([timeoutPromise, safeSpawnedPromise]);
}, "setupTimeout");
var validateTimeout = /* @__PURE__ */ __name(({ timeout }) => {
  if (timeout !== void 0 && (!Number.isFinite(timeout) || timeout < 0)) {
    throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
  }
}, "validateTimeout");
var setExitHandler = /* @__PURE__ */ __name(async (spawned, { cleanup, detached }, timedPromise) => {
  if (!cleanup || detached) {
    return timedPromise;
  }
  const removeExitHandler = (0, import_signal_exit.default)(() => {
    spawned.kill();
  });
  return timedPromise.finally(() => {
    removeExitHandler();
  });
}, "setExitHandler");

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/lib/pipe.js
import { createWriteStream } from "node:fs";
import { ChildProcess } from "node:child_process";

// node_modules/.pnpm/is-stream@3.0.0/node_modules/is-stream/index.js
function isStream(stream) {
  return stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
}
__name(isStream, "isStream");
function isWritableStream(stream) {
  return isStream(stream) && stream.writable !== false && typeof stream._write === "function" && typeof stream._writableState === "object";
}
__name(isWritableStream, "isWritableStream");

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/lib/pipe.js
var isExecaChildProcess = /* @__PURE__ */ __name((target) => target instanceof ChildProcess && typeof target.then === "function", "isExecaChildProcess");
var pipeToTarget = /* @__PURE__ */ __name((spawned, streamName, target) => {
  if (typeof target === "string") {
    spawned[streamName].pipe(createWriteStream(target));
    return spawned;
  }
  if (isWritableStream(target)) {
    spawned[streamName].pipe(target);
    return spawned;
  }
  if (!isExecaChildProcess(target)) {
    throw new TypeError("The second argument must be a string, a stream or an Execa child process.");
  }
  if (!isWritableStream(target.stdin)) {
    throw new TypeError("The target child process's stdin must be available.");
  }
  spawned[streamName].pipe(target.stdin);
  return target;
}, "pipeToTarget");
var addPipeMethods = /* @__PURE__ */ __name((spawned) => {
  if (spawned.stdout !== null) {
    spawned.pipeStdout = pipeToTarget.bind(void 0, spawned, "stdout");
  }
  if (spawned.stderr !== null) {
    spawned.pipeStderr = pipeToTarget.bind(void 0, spawned, "stderr");
  }
  if (spawned.all !== void 0) {
    spawned.pipeAll = pipeToTarget.bind(void 0, spawned, "all");
  }
}, "addPipeMethods");

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/lib/stream.js
import { createReadStream, readFileSync } from "node:fs";
var import_get_stream = __toESM(require_get_stream(), 1);
var import_merge_stream = __toESM(require_merge_stream(), 1);
var validateInputOptions = /* @__PURE__ */ __name((input) => {
  if (input !== void 0) {
    throw new TypeError("The `input` and `inputFile` options cannot be both set.");
  }
}, "validateInputOptions");
var getInputSync = /* @__PURE__ */ __name(({ input, inputFile }) => {
  if (typeof inputFile !== "string") {
    return input;
  }
  validateInputOptions(input);
  return readFileSync(inputFile);
}, "getInputSync");
var handleInputSync = /* @__PURE__ */ __name((options) => {
  const input = getInputSync(options);
  if (isStream(input)) {
    throw new TypeError("The `input` option cannot be a stream in sync mode");
  }
  return input;
}, "handleInputSync");
var getInput2 = /* @__PURE__ */ __name(({ input, inputFile }) => {
  if (typeof inputFile !== "string") {
    return input;
  }
  validateInputOptions(input);
  return createReadStream(inputFile);
}, "getInput");
var handleInput = /* @__PURE__ */ __name((spawned, options) => {
  const input = getInput2(options);
  if (input === void 0) {
    return;
  }
  if (isStream(input)) {
    input.pipe(spawned.stdin);
  } else {
    spawned.stdin.end(input);
  }
}, "handleInput");
var makeAllStream = /* @__PURE__ */ __name((spawned, { all }) => {
  if (!all || !spawned.stdout && !spawned.stderr) {
    return;
  }
  const mixed = (0, import_merge_stream.default)();
  if (spawned.stdout) {
    mixed.add(spawned.stdout);
  }
  if (spawned.stderr) {
    mixed.add(spawned.stderr);
  }
  return mixed;
}, "makeAllStream");
var getBufferedData = /* @__PURE__ */ __name(async (stream, streamPromise) => {
  if (!stream || streamPromise === void 0) {
    return;
  }
  stream.destroy();
  try {
    return await streamPromise;
  } catch (error2) {
    return error2.bufferedData;
  }
}, "getBufferedData");
var getStreamPromise = /* @__PURE__ */ __name((stream, { encoding, buffer, maxBuffer }) => {
  if (!stream || !buffer) {
    return;
  }
  if (encoding) {
    return (0, import_get_stream.default)(stream, { encoding, maxBuffer });
  }
  return import_get_stream.default.buffer(stream, { maxBuffer });
}, "getStreamPromise");
var getSpawnedResult = /* @__PURE__ */ __name(async ({ stdout, stderr, all }, { encoding, buffer, maxBuffer }, processDone) => {
  const stdoutPromise = getStreamPromise(stdout, { encoding, buffer, maxBuffer });
  const stderrPromise = getStreamPromise(stderr, { encoding, buffer, maxBuffer });
  const allPromise = getStreamPromise(all, { encoding, buffer, maxBuffer: maxBuffer * 2 });
  try {
    return await Promise.all([processDone, stdoutPromise, stderrPromise, allPromise]);
  } catch (error2) {
    return Promise.all([
      { error: error2, signal: error2.signal, timedOut: error2.timedOut },
      getBufferedData(stdout, stdoutPromise),
      getBufferedData(stderr, stderrPromise),
      getBufferedData(all, allPromise)
    ]);
  }
}, "getSpawnedResult");

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/lib/promise.js
var nativePromisePrototype = (/* @__PURE__ */ (async () => {
})()).constructor.prototype;
var descriptors = ["then", "catch", "finally"].map((property) => [
  property,
  Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)
]);
var mergePromise = /* @__PURE__ */ __name((spawned, promise) => {
  for (const [property, descriptor] of descriptors) {
    const value = typeof promise === "function" ? (...args) => Reflect.apply(descriptor.value, promise(), args) : descriptor.value.bind(promise);
    Reflect.defineProperty(spawned, property, { ...descriptor, value });
  }
}, "mergePromise");
var getSpawnedPromise = /* @__PURE__ */ __name((spawned) => new Promise((resolve, reject) => {
  spawned.on("exit", (exitCode, signal) => {
    resolve({ exitCode, signal });
  });
  spawned.on("error", (error2) => {
    reject(error2);
  });
  if (spawned.stdin) {
    spawned.stdin.on("error", (error2) => {
      reject(error2);
    });
  }
}), "getSpawnedPromise");

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/lib/command.js
import { Buffer as Buffer2 } from "node:buffer";
import { ChildProcess as ChildProcess2 } from "node:child_process";
var normalizeArgs = /* @__PURE__ */ __name((file, args = []) => {
  if (!Array.isArray(args)) {
    return [file];
  }
  return [file, ...args];
}, "normalizeArgs");
var NO_ESCAPE_REGEXP = /^[\w.-]+$/;
var DOUBLE_QUOTES_REGEXP = /"/g;
var escapeArg = /* @__PURE__ */ __name((arg) => {
  if (typeof arg !== "string" || NO_ESCAPE_REGEXP.test(arg)) {
    return arg;
  }
  return `"${arg.replace(DOUBLE_QUOTES_REGEXP, '\\"')}"`;
}, "escapeArg");
var joinCommand = /* @__PURE__ */ __name((file, args) => normalizeArgs(file, args).join(" "), "joinCommand");
var getEscapedCommand = /* @__PURE__ */ __name((file, args) => normalizeArgs(file, args).map((arg) => escapeArg(arg)).join(" "), "getEscapedCommand");
var SPACES_REGEXP = / +/g;
var parseExpression = /* @__PURE__ */ __name((expression) => {
  const typeOfExpression = typeof expression;
  if (typeOfExpression === "string") {
    return expression;
  }
  if (typeOfExpression === "number") {
    return String(expression);
  }
  if (typeOfExpression === "object" && expression !== null && !(expression instanceof ChildProcess2) && "stdout" in expression) {
    const typeOfStdout = typeof expression.stdout;
    if (typeOfStdout === "string") {
      return expression.stdout;
    }
    if (Buffer2.isBuffer(expression.stdout)) {
      return expression.stdout.toString();
    }
    throw new TypeError(`Unexpected "${typeOfStdout}" stdout in template expression`);
  }
  throw new TypeError(`Unexpected "${typeOfExpression}" in template expression`);
}, "parseExpression");
var concatTokens = /* @__PURE__ */ __name((tokens, nextTokens, isNew) => isNew || tokens.length === 0 || nextTokens.length === 0 ? [...tokens, ...nextTokens] : [
  ...tokens.slice(0, -1),
  `${tokens[tokens.length - 1]}${nextTokens[0]}`,
  ...nextTokens.slice(1)
], "concatTokens");
var parseTemplate = /* @__PURE__ */ __name(({ templates, expressions, tokens, index, template }) => {
  const templateString = template ?? templates.raw[index];
  const templateTokens = templateString.split(SPACES_REGEXP).filter(Boolean);
  const newTokens = concatTokens(
    tokens,
    templateTokens,
    templateString.startsWith(" ")
  );
  if (index === expressions.length) {
    return newTokens;
  }
  const expression = expressions[index];
  const expressionTokens = Array.isArray(expression) ? expression.map((expression2) => parseExpression(expression2)) : [parseExpression(expression)];
  return concatTokens(
    newTokens,
    expressionTokens,
    templateString.endsWith(" ")
  );
}, "parseTemplate");
var parseTemplates = /* @__PURE__ */ __name((templates, expressions) => {
  let tokens = [];
  for (const [index, template] of templates.entries()) {
    tokens = parseTemplate({ templates, expressions, tokens, index, template });
  }
  return tokens;
}, "parseTemplates");

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/lib/verbose.js
import { debuglog } from "node:util";
import process4 from "node:process";
var verboseDefault = debuglog("execa").enabled;
var padField = /* @__PURE__ */ __name((field, padding) => String(field).padStart(padding, "0"), "padField");
var getTimestamp = /* @__PURE__ */ __name(() => {
  const date = /* @__PURE__ */ new Date();
  return `${padField(date.getHours(), 2)}:${padField(date.getMinutes(), 2)}:${padField(date.getSeconds(), 2)}.${padField(date.getMilliseconds(), 3)}`;
}, "getTimestamp");
var logCommand = /* @__PURE__ */ __name((escapedCommand, { verbose }) => {
  if (!verbose) {
    return;
  }
  process4.stderr.write(`[${getTimestamp()}] ${escapedCommand}
`);
}, "logCommand");

// node_modules/.pnpm/execa@7.2.0/node_modules/execa/index.js
var DEFAULT_MAX_BUFFER = 1e3 * 1e3 * 100;
var getEnv = /* @__PURE__ */ __name(({ env: envOption, extendEnv, preferLocal, localDir, execPath }) => {
  const env = extendEnv ? { ...process5.env, ...envOption } : envOption;
  if (preferLocal) {
    return npmRunPathEnv({ env, cwd: localDir, execPath });
  }
  return env;
}, "getEnv");
var handleArguments = /* @__PURE__ */ __name((file, args, options = {}) => {
  const parsed = import_cross_spawn.default._parse(file, args, options);
  file = parsed.command;
  args = parsed.args;
  options = parsed.options;
  options = {
    maxBuffer: DEFAULT_MAX_BUFFER,
    buffer: true,
    stripFinalNewline: true,
    extendEnv: true,
    preferLocal: false,
    localDir: options.cwd || process5.cwd(),
    execPath: process5.execPath,
    encoding: "utf8",
    reject: true,
    cleanup: true,
    all: false,
    windowsHide: true,
    verbose: verboseDefault,
    ...options
  };
  options.env = getEnv(options);
  options.stdio = normalizeStdio(options);
  if (process5.platform === "win32" && path2.basename(file, ".exe") === "cmd") {
    args.unshift("/q");
  }
  return { file, args, options, parsed };
}, "handleArguments");
var handleOutput = /* @__PURE__ */ __name((options, value, error2) => {
  if (typeof value !== "string" && !Buffer3.isBuffer(value)) {
    return error2 === void 0 ? void 0 : "";
  }
  if (options.stripFinalNewline) {
    return stripFinalNewline(value);
  }
  return value;
}, "handleOutput");
function execa(file, args, options) {
  const parsed = handleArguments(file, args, options);
  const command = joinCommand(file, args);
  const escapedCommand = getEscapedCommand(file, args);
  logCommand(escapedCommand, parsed.options);
  validateTimeout(parsed.options);
  let spawned;
  try {
    spawned = childProcess.spawn(parsed.file, parsed.args, parsed.options);
  } catch (error2) {
    const dummySpawned = new childProcess.ChildProcess();
    const errorPromise = Promise.reject(makeError({
      error: error2,
      stdout: "",
      stderr: "",
      all: "",
      command,
      escapedCommand,
      parsed,
      timedOut: false,
      isCanceled: false,
      killed: false
    }));
    mergePromise(dummySpawned, errorPromise);
    return dummySpawned;
  }
  const spawnedPromise = getSpawnedPromise(spawned);
  const timedPromise = setupTimeout(spawned, parsed.options, spawnedPromise);
  const processDone = setExitHandler(spawned, parsed.options, timedPromise);
  const context = { isCanceled: false };
  spawned.kill = spawnedKill.bind(null, spawned.kill.bind(spawned));
  spawned.cancel = spawnedCancel.bind(null, spawned, context);
  const handlePromise = /* @__PURE__ */ __name(async () => {
    const [{ error: error2, exitCode, signal, timedOut }, stdoutResult, stderrResult, allResult] = await getSpawnedResult(spawned, parsed.options, processDone);
    const stdout = handleOutput(parsed.options, stdoutResult);
    const stderr = handleOutput(parsed.options, stderrResult);
    const all = handleOutput(parsed.options, allResult);
    if (error2 || exitCode !== 0 || signal !== null) {
      const returnedError = makeError({
        error: error2,
        exitCode,
        signal,
        stdout,
        stderr,
        all,
        command,
        escapedCommand,
        parsed,
        timedOut,
        isCanceled: context.isCanceled || (parsed.options.signal ? parsed.options.signal.aborted : false),
        killed: spawned.killed
      });
      if (!parsed.options.reject) {
        return returnedError;
      }
      throw returnedError;
    }
    return {
      command,
      escapedCommand,
      exitCode: 0,
      stdout,
      stderr,
      all,
      failed: false,
      timedOut: false,
      isCanceled: false,
      killed: false
    };
  }, "handlePromise");
  const handlePromiseOnce = onetime_default(handlePromise);
  handleInput(spawned, parsed.options);
  spawned.all = makeAllStream(spawned, parsed.options);
  addPipeMethods(spawned);
  mergePromise(spawned, handlePromiseOnce);
  return spawned;
}
__name(execa, "execa");
function execaSync(file, args, options) {
  const parsed = handleArguments(file, args, options);
  const command = joinCommand(file, args);
  const escapedCommand = getEscapedCommand(file, args);
  logCommand(escapedCommand, parsed.options);
  const input = handleInputSync(parsed.options);
  let result;
  try {
    result = childProcess.spawnSync(parsed.file, parsed.args, { ...parsed.options, input });
  } catch (error2) {
    throw makeError({
      error: error2,
      stdout: "",
      stderr: "",
      all: "",
      command,
      escapedCommand,
      parsed,
      timedOut: false,
      isCanceled: false,
      killed: false
    });
  }
  const stdout = handleOutput(parsed.options, result.stdout, result.error);
  const stderr = handleOutput(parsed.options, result.stderr, result.error);
  if (result.error || result.status !== 0 || result.signal !== null) {
    const error2 = makeError({
      stdout,
      stderr,
      error: result.error,
      signal: result.signal,
      exitCode: result.status,
      command,
      escapedCommand,
      parsed,
      timedOut: result.error && result.error.code === "ETIMEDOUT",
      isCanceled: false,
      killed: result.signal !== null
    });
    if (!parsed.options.reject) {
      return error2;
    }
    throw error2;
  }
  return {
    command,
    escapedCommand,
    exitCode: 0,
    stdout,
    stderr,
    failed: false,
    timedOut: false,
    isCanceled: false,
    killed: false
  };
}
__name(execaSync, "execaSync");
var normalizeScriptStdin = /* @__PURE__ */ __name(({ input, inputFile, stdio }) => input === void 0 && inputFile === void 0 && stdio === void 0 ? { stdin: "inherit" } : {}, "normalizeScriptStdin");
var normalizeScriptOptions = /* @__PURE__ */ __name((options = {}) => ({
  preferLocal: true,
  ...normalizeScriptStdin(options),
  ...options
}), "normalizeScriptOptions");
function create$(options) {
  function $2(templatesOrOptions, ...expressions) {
    if (!Array.isArray(templatesOrOptions)) {
      return create$({ ...options, ...templatesOrOptions });
    }
    const [file, ...args] = parseTemplates(templatesOrOptions, expressions);
    return execa(file, args, normalizeScriptOptions(options));
  }
  __name($2, "$");
  $2.sync = (templates, ...expressions) => {
    if (!Array.isArray(templates)) {
      throw new TypeError("Please use $(options).sync`command` instead of $.sync(options)`command`.");
    }
    const [file, ...args] = parseTemplates(templates, expressions);
    return execaSync(file, args, normalizeScriptOptions(options));
  };
  return $2;
}
__name(create$, "create$");
var $ = create$();

// src/inputs.ts
var INPUT_KEY_CLOUDFLARE_ACCOUNT_ID = "cloudflare account id";
var INPUT_KEY_CLOUDFLARE_API_TOKEN = "cloudflare api token";
var INPUT_KEY_CLOUDFLARE_PROJECT_NAME = "cloudflare project name";
var INPUT_KEY_DIRECTORY = "directory";
var INPUT_KEY_GITHUB_ENVIRONMENT = "github environment";
var INPUT_KEY_GITHUB_TOKEN = "github token";
var OPTIONS = {
  required: true
};
var getInputs = /* @__PURE__ */ __name(() => {
  return {
    cloudflareAccountId: getInput(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID, OPTIONS),
    cloudflareApiToken: getInput(INPUT_KEY_CLOUDFLARE_API_TOKEN, OPTIONS),
    cloudflareProjectName: getInput(INPUT_KEY_CLOUDFLARE_PROJECT_NAME, OPTIONS),
    directory: getInput(INPUT_KEY_DIRECTORY, OPTIONS),
    gitHubApiToken: getInput(INPUT_KEY_GITHUB_TOKEN, OPTIONS),
    gitHubEnvironment: getInput(INPUT_KEY_GITHUB_ENVIRONMENT, OPTIONS)
  };
}, "getInputs");
var _inputs;
var useInputs = /* @__PURE__ */ __name(() => {
  return _inputs ?? (_inputs = getInputs());
}, "useInputs");

// src/utils.ts
var raise = /* @__PURE__ */ __name((message) => {
  throw new Error(message);
}, "raise");

// src/github/workflow-event/workflow-event.ts
import { strict as assert } from "node:assert";
import { existsSync as existsSync2, readFileSync as readFileSync2 } from "node:fs";
import { EOL as EOL6 } from "node:os";

// __generated__/types/github/workflow-events.ts
var EVENT_NAMES = [
  "branch_protection_rule",
  "check_run",
  "check_suite",
  "code_scanning_alert",
  "commit_comment",
  "create",
  "delete",
  "dependabot_alert",
  "deploy_key",
  "deployment",
  "deployment_protection_rule",
  "deployment_status",
  "discussion",
  "discussion_comment",
  "fork",
  "github_app_authorization",
  "gollum",
  "installation",
  "installation_repositories",
  "installation_target",
  "issue_comment",
  "issues",
  "label",
  "marketplace_purchase",
  "member",
  "membership",
  "merge_group",
  "meta",
  "milestone",
  "org_block",
  "organization",
  "package",
  "page_build",
  "ping",
  "project",
  "project_card",
  "project_column",
  "projects_v2_item",
  "public",
  "pull_request",
  "pull_request_review",
  "pull_request_review_comment",
  "pull_request_review_thread",
  "push",
  "registry_package",
  "release",
  "repository",
  "repository_dispatch",
  "repository_import",
  "repository_vulnerability_alert",
  "secret_scanning_alert",
  "secret_scanning_alert_location",
  "security_advisory",
  "sponsorship",
  "star",
  "status",
  "team",
  "team_add",
  "watch",
  "workflow_dispatch",
  "workflow_job",
  "workflow_run"
];

// src/github/workflow-event/workflow-event.ts
var getPayload = /* @__PURE__ */ __name(() => {
  if (process.env.GITHUB_EVENT_PATH) {
    if (existsSync2(process.env.GITHUB_EVENT_PATH)) {
      return JSON.parse(
        readFileSync2(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" })
      );
    } else {
      const path3 = process.env.GITHUB_EVENT_PATH;
      process.stdout.write(`GITHUB_EVENT_PATH ${path3} does not exist${EOL6}`);
    }
  }
}, "getPayload");
var getWorkflowEvent = /* @__PURE__ */ __name(() => {
  const eventName = process.env.GITHUB_EVENT_NAME;
  assert(
    EVENT_NAMES.includes(eventName),
    `eventName ${eventName} is not supported`
  );
  const payload = getPayload();
  if (isDebug()) {
    debug(`eventName: ${eventName}`);
    debug(`payload: ${JSON.stringify(payload)}`);
  }
  return {
    eventName,
    payload
  };
}, "getWorkflowEvent");

// src/github/context.ts
var getGitHubContext = /* @__PURE__ */ __name(() => {
  const event = getWorkflowEvent();
  const repo = (() => {
    const [owner, repo2] = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split("/") : raise(
      "context.repo: requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
    );
    const node_id = "repository" in event.payload ? event.payload.repository?.node_id || raise("context.repo: no repo node_id in payload") : raise("context.repo: no repo node_id in payload");
    return { owner, repo: repo2, node_id };
  })();
  const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
  const sha = process.env.GITHUB_SHA;
  const graphqlEndpoint = process.env.GITHUB_GRAPHQL_URL;
  const ref = (() => {
    let ref2 = process.env.GITHUB_HEAD_REF;
    if (!ref2) {
      if ("ref" in event.payload) {
        ref2 = event.payload.ref;
      } else if (event.eventName === "pull_request") {
        ref2 = event.payload.pull_request.head.ref;
      }
      if (!ref2)
        return raise("context: no ref");
    }
    return ref2;
  })();
  const context = {
    event,
    repo,
    branch,
    sha,
    graphqlEndpoint,
    ref
  };
  if (isDebug()) {
    const debugContext = {
      ...context,
      event: "will debug itself as output is large"
    };
    debug(`context: ${JSON.stringify(debugContext)}`);
  }
  return context;
}, "getGitHubContext");
var _context;
var useContext = /* @__PURE__ */ __name(() => {
  return _context ?? (_context = getGitHubContext());
}, "useContext");
var useContextEvent = /* @__PURE__ */ __name(() => useContext().event, "useContextEvent");

// src/github/api/client.ts
var request = /* @__PURE__ */ __name(async (params) => {
  const { query, variables, options } = params;
  const { errorThrows } = options || { errorThrows: true };
  const { gitHubApiToken } = useInputs();
  const { graphqlEndpoint } = useContext();
  return fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      authorization: `bearer ${gitHubApiToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.flash-preview+json"
    },
    body: JSON.stringify({ query: query.toString(), variables })
  }).then((res) => res.json()).then((res) => {
    if (res.errors && errorThrows) {
      throw new Error(JSON.stringify(res.errors));
    }
    return res;
  });
}, "request");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/lowercase-keys.js
function lowercaseKeys(object) {
  if (!object) {
    return {};
  }
  return Object.keys(object).reduce((newObj, key) => {
    newObj[key.toLowerCase()] = object[key];
    return newObj;
  }, {});
}
__name(lowercaseKeys, "lowercaseKeys");

// node_modules/.pnpm/is-plain-obj@4.1.0/node_modules/is-plain-obj/index.js
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}
__name(isPlainObject, "isPlainObject");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/merge-deep.js
function mergeDeep(defaults, options) {
  const result = Object.assign({}, defaults);
  Object.keys(options).forEach((key) => {
    if (isPlainObject(options[key])) {
      if (!(key in defaults))
        Object.assign(result, { [key]: options[key] });
      else
        result[key] = mergeDeep(defaults[key], options[key]);
    } else {
      Object.assign(result, { [key]: options[key] });
    }
  });
  return result;
}
__name(mergeDeep, "mergeDeep");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/remove-undefined-properties.js
function removeUndefinedProperties(obj) {
  for (const key in obj) {
    if (obj[key] === void 0) {
      delete obj[key];
    }
  }
  return obj;
}
__name(removeUndefinedProperties, "removeUndefinedProperties");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/merge.js
function merge(defaults, route, options) {
  if (typeof route === "string") {
    let [method, url2] = route.split(" ");
    options = Object.assign(url2 ? { method, url: url2 } : { url: method }, options);
  } else {
    options = Object.assign({}, route);
  }
  options.headers = lowercaseKeys(options.headers);
  removeUndefinedProperties(options);
  removeUndefinedProperties(options.headers);
  const mergedOptions = mergeDeep(defaults || {}, options);
  if (defaults && defaults.mediaType.previews.length) {
    mergedOptions.mediaType.previews = defaults.mediaType.previews.filter((preview) => !mergedOptions.mediaType.previews.includes(preview)).concat(mergedOptions.mediaType.previews);
  }
  mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map(
    (preview) => preview.replace(/-preview/, "")
  );
  return mergedOptions;
}
__name(merge, "merge");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/add-query-parameters.js
function addQueryParameters(url2, parameters) {
  const separator = /\?/.test(url2) ? "&" : "?";
  const names = Object.keys(parameters);
  if (names.length === 0) {
    return url2;
  }
  const query = names.map((name) => {
    if (name === "q") {
      return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
    }
    return `${name}=${encodeURIComponent(parameters[name])}`;
  }).join("&");
  return url2 + separator + query;
}
__name(addQueryParameters, "addQueryParameters");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/extract-url-variable-names.js
var urlVariableRegex = /\{[^}]+\}/g;
function removeNonChars(variableName) {
  return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
}
__name(removeNonChars, "removeNonChars");
function extractUrlVariableNames(url2) {
  const matches = url2.match(urlVariableRegex);
  if (!matches) {
    return [];
  }
  return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
}
__name(extractUrlVariableNames, "extractUrlVariableNames");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/omit.js
function omit(object, keysToOmit) {
  return Object.keys(object).filter((option) => !keysToOmit.includes(option)).reduce((obj, key) => {
    obj[key] = object[key];
    return obj;
  }, {});
}
__name(omit, "omit");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/url-template.js
function encodeReserved(str) {
  return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
    if (!/%[0-9A-Fa-f]/.test(part)) {
      part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
    }
    return part;
  }).join("");
}
__name(encodeReserved, "encodeReserved");
function encodeUnreserved(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
}
__name(encodeUnreserved, "encodeUnreserved");
function encodeValue(operator, value, key) {
  value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);
  if (key) {
    return encodeUnreserved(key) + "=" + value;
  } else {
    return value;
  }
}
__name(encodeValue, "encodeValue");
function isDefined(value) {
  return value !== void 0 && value !== null;
}
__name(isDefined, "isDefined");
function isKeyOperator(operator) {
  return operator === ";" || operator === "&" || operator === "?";
}
__name(isKeyOperator, "isKeyOperator");
function getValues(context, operator, key, modifier) {
  var value = context[key], result = [];
  if (isDefined(value) && value !== "") {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      value = value.toString();
      if (modifier && modifier !== "*") {
        value = value.substring(0, parseInt(modifier, 10));
      }
      result.push(
        encodeValue(operator, value, isKeyOperator(operator) ? key : "")
      );
    } else {
      if (modifier === "*") {
        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function(value2) {
            result.push(
              encodeValue(operator, value2, isKeyOperator(operator) ? key : "")
            );
          });
        } else {
          Object.keys(value).forEach(function(k) {
            if (isDefined(value[k])) {
              result.push(encodeValue(operator, value[k], k));
            }
          });
        }
      } else {
        const tmp = [];
        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function(value2) {
            tmp.push(encodeValue(operator, value2));
          });
        } else {
          Object.keys(value).forEach(function(k) {
            if (isDefined(value[k])) {
              tmp.push(encodeUnreserved(k));
              tmp.push(encodeValue(operator, value[k].toString()));
            }
          });
        }
        if (isKeyOperator(operator)) {
          result.push(encodeUnreserved(key) + "=" + tmp.join(","));
        } else if (tmp.length !== 0) {
          result.push(tmp.join(","));
        }
      }
    }
  } else {
    if (operator === ";") {
      if (isDefined(value)) {
        result.push(encodeUnreserved(key));
      }
    } else if (value === "" && (operator === "&" || operator === "?")) {
      result.push(encodeUnreserved(key) + "=");
    } else if (value === "") {
      result.push("");
    }
  }
  return result;
}
__name(getValues, "getValues");
function parseUrl(template) {
  return {
    expand: expand.bind(null, template)
  };
}
__name(parseUrl, "parseUrl");
function expand(template, context) {
  var operators = ["+", "#", ".", "/", ";", "?", "&"];
  return template.replace(
    /\{([^\{\}]+)\}|([^\{\}]+)/g,
    function(_, expression, literal) {
      if (expression) {
        let operator = "";
        const values = [];
        if (operators.indexOf(expression.charAt(0)) !== -1) {
          operator = expression.charAt(0);
          expression = expression.substr(1);
        }
        expression.split(/,/g).forEach(function(variable) {
          var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
          values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
        });
        if (operator && operator !== "+") {
          var separator = ",";
          if (operator === "?") {
            separator = "&";
          } else if (operator !== "#") {
            separator = operator;
          }
          return (values.length !== 0 ? operator : "") + values.join(separator);
        } else {
          return values.join(",");
        }
      } else {
        return encodeReserved(literal);
      }
    }
  );
}
__name(expand, "expand");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/parse.js
function parse(options) {
  let method = options.method.toUpperCase();
  let url2 = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
  let headers = Object.assign({}, options.headers);
  let body;
  let parameters = omit(options, [
    "method",
    "baseUrl",
    "url",
    "headers",
    "request",
    "mediaType"
  ]);
  const urlVariableNames = extractUrlVariableNames(url2);
  url2 = parseUrl(url2).expand(parameters);
  if (!/^http/.test(url2)) {
    url2 = options.baseUrl + url2;
  }
  const omittedParameters = Object.keys(options).filter((option) => urlVariableNames.includes(option)).concat("baseUrl");
  const remainingParameters = omit(parameters, omittedParameters);
  const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);
  if (!isBinaryRequest) {
    if (options.mediaType.format) {
      headers.accept = headers.accept.split(/,/).map(
        (preview) => preview.replace(
          /application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,
          `application/vnd$1$2.${options.mediaType.format}`
        )
      ).join(",");
    }
    if (options.mediaType.previews.length) {
      const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
      headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map((preview) => {
        const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
        return `application/vnd.github.${preview}-preview${format}`;
      }).join(",");
    }
  }
  if (["GET", "HEAD"].includes(method)) {
    url2 = addQueryParameters(url2, remainingParameters);
  } else {
    if ("data" in remainingParameters) {
      body = remainingParameters.data;
    } else {
      if (Object.keys(remainingParameters).length) {
        body = remainingParameters;
      }
    }
  }
  if (!headers["content-type"] && typeof body !== "undefined") {
    headers["content-type"] = "application/json; charset=utf-8";
  }
  if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
    body = "";
  }
  return Object.assign(
    { method, url: url2, headers },
    typeof body !== "undefined" ? { body } : null,
    options.request ? { request: options.request } : null
  );
}
__name(parse, "parse");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/endpoint-with-defaults.js
function endpointWithDefaults(defaults, route, options) {
  return parse(merge(defaults, route, options));
}
__name(endpointWithDefaults, "endpointWithDefaults");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/with-defaults.js
function withDefaults(oldDefaults, newDefaults) {
  const DEFAULTS2 = merge(oldDefaults, newDefaults);
  const endpoint2 = endpointWithDefaults.bind(null, DEFAULTS2);
  return Object.assign(endpoint2, {
    DEFAULTS: DEFAULTS2,
    defaults: withDefaults.bind(null, DEFAULTS2),
    merge: merge.bind(null, DEFAULTS2),
    parse
  });
}
__name(withDefaults, "withDefaults");

// node_modules/.pnpm/universal-user-agent@7.0.1/node_modules/universal-user-agent/index.js
function getUserAgent() {
  if (typeof navigator === "object" && "userAgent" in navigator) {
    return navigator.userAgent;
  }
  if (typeof process === "object" && "version" in process) {
    return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
  }
  return "<environment undetectable>";
}
__name(getUserAgent, "getUserAgent");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/version.js
var VERSION = "2.7.1";

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/defaults.js
var userAgent = `octokit-next-endpoint.js/${VERSION} ${getUserAgent()}`;
var DEFAULTS = {
  method: "GET",
  baseUrl: "https://api.github.com",
  headers: {
    accept: "application/vnd.github.v3+json",
    "user-agent": userAgent
  },
  mediaType: {
    format: "",
    previews: []
  }
};

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/index.js
var endpoint = withDefaults(null, DEFAULTS);

// node_modules/.pnpm/@octokit-next+request@2.7.1/node_modules/@octokit-next/request/lib/version.js
var VERSION2 = "2.7.1";

// node_modules/.pnpm/is-plain-object@5.0.0/node_modules/is-plain-object/dist/is-plain-object.mjs
function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}
__name(isObject, "isObject");
function isPlainObject2(o) {
  var ctor, prot;
  if (isObject(o) === false)
    return false;
  ctor = o.constructor;
  if (ctor === void 0)
    return true;
  prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (prot.hasOwnProperty("isPrototypeOf") === false) {
    return false;
  }
  return true;
}
__name(isPlainObject2, "isPlainObject");

// node_modules/.pnpm/@octokit-next+request-error@2.7.1/node_modules/@octokit-next/request-error/index.js
var RequestError = class extends Error {
  static {
    __name(this, "RequestError");
  }
  name;
  /**
   * http status code
   */
  status;
  /**
   * Request options that lead to the error.
   */
  request;
  /**
   * Response object if a response was received
   */
  response;
  constructor(message, statusCode, options) {
    super(message);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = "HttpError";
    this.status = statusCode;
    if ("response" in options) {
      this.response = options.response;
    }
    const requestCopy = { ...options.request };
    if (options.request.headers.authorization) {
      requestCopy.headers = {
        ...options.request.headers,
        authorization: options.request.headers.authorization.replace(
          / .*$/,
          " [REDACTED]"
        )
      };
    }
    requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
    this.request = requestCopy;
  }
};

// node_modules/.pnpm/@octokit-next+request@2.7.1/node_modules/@octokit-next/request/lib/get-buffer-response.js
function getBufferResponse(response) {
  return response.arrayBuffer();
}
__name(getBufferResponse, "getBufferResponse");

// node_modules/.pnpm/@octokit-next+request@2.7.1/node_modules/@octokit-next/request/lib/fetch-wrapper.js
function fetchWrapper(requestOptions) {
  const log = requestOptions.request?.log || console;
  if (isPlainObject2(requestOptions.body) || Array.isArray(requestOptions.body)) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }
  let responseHeaders = {};
  let status;
  let url2;
  const { redirect, fetch: fetch2, ...remainingRequestOptions } = requestOptions.request || {};
  const fetchOptions = {
    method: requestOptions.method,
    body: requestOptions.body,
    headers: requestOptions.headers,
    redirect,
    ...remainingRequestOptions
  };
  const requestOrGlobalFetch = fetch2 || globalThis.fetch;
  return requestOrGlobalFetch(requestOptions.url, fetchOptions).then(async (response) => {
    url2 = response.url;
    status = response.status;
    for (const keyAndValue of response.headers) {
      responseHeaders[keyAndValue[0]] = keyAndValue[1];
    }
    if ("deprecation" in responseHeaders) {
      const matches = responseHeaders.link && responseHeaders.link.match(/<([^>]+)>; rel="deprecation"/);
      const deprecationLink = matches && matches.pop();
      log.warn(
        `[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${responseHeaders.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`
      );
    }
    if (status === 204 || status === 205) {
      return;
    }
    if (requestOptions.method === "HEAD") {
      if (status < 400) {
        return;
      }
      throw new RequestError(response.statusText, status, {
        response: {
          url: url2,
          status,
          headers: responseHeaders,
          data: void 0
        },
        request: requestOptions
      });
    }
    if (status === 304) {
      throw new RequestError("Not modified", status, {
        response: {
          url: url2,
          status,
          headers: responseHeaders,
          data: await getResponseData(response)
        },
        request: requestOptions
      });
    }
    if (status >= 400) {
      const data = await getResponseData(response);
      const error2 = new RequestError(toErrorMessage(data), status, {
        response: {
          url: url2,
          status,
          headers: responseHeaders,
          data
        },
        request: requestOptions
      });
      throw error2;
    }
    return getResponseData(response);
  }).then((data) => {
    return {
      status,
      url: url2,
      headers: responseHeaders,
      data
    };
  }).catch((error2) => {
    if (error2 instanceof RequestError)
      throw error2;
    if (error2.name === "AbortError")
      throw error2;
    throw new RequestError(error2.message, 500, {
      request: requestOptions
    });
  });
}
__name(fetchWrapper, "fetchWrapper");
async function getResponseData(response) {
  const contentType = response.headers.get("content-type");
  if (/application\/json/.test(contentType)) {
    return response.json();
  }
  if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
    return response.text();
  }
  return getBufferResponse(response);
}
__name(getResponseData, "getResponseData");
function toErrorMessage(data) {
  if (typeof data === "string")
    return data;
  if ("message" in data) {
    if (Array.isArray(data.errors)) {
      return `${data.message}: ${data.errors.map(JSON.stringify).join(", ")}`;
    }
    return data.message;
  }
  return `Unknown error: ${JSON.stringify(data)}`;
}
__name(toErrorMessage, "toErrorMessage");

// node_modules/.pnpm/@octokit-next+request@2.7.1/node_modules/@octokit-next/request/lib/with-defaults.js
function withDefaults2(oldEndpoint, newDefaults) {
  const endpoint2 = oldEndpoint.defaults(newDefaults);
  const newApi = /* @__PURE__ */ __name(function(route, parameters) {
    const endpointOptions = endpoint2.merge(route, parameters);
    if (!endpointOptions.request || !endpointOptions.request.hook) {
      return fetchWrapper(endpoint2.parse(endpointOptions));
    }
    const request3 = /* @__PURE__ */ __name((route2, parameters2) => {
      return fetchWrapper(endpoint2.parse(endpoint2.merge(route2, parameters2)));
    }, "request");
    Object.assign(request3, {
      endpoint: endpoint2,
      defaults: withDefaults2.bind(null, endpoint2)
    });
    return endpointOptions.request.hook(request3, endpointOptions);
  }, "newApi");
  return Object.assign(newApi, {
    endpoint: endpoint2,
    defaults: withDefaults2.bind(null, endpoint2)
  });
}
__name(withDefaults2, "withDefaults");

// node_modules/.pnpm/@octokit-next+request@2.7.1/node_modules/@octokit-next/request/index.js
var request2 = withDefaults2(endpoint, {
  headers: {
    "user-agent": `octokit-next-request.js/${VERSION2} ${getUserAgent()}`
  }
});

// node_modules/.pnpm/@octokit-next+auth-token@2.7.1/node_modules/@octokit-next/auth-token/lib/auth.js
var REGEX_IS_INSTALLATION_LEGACY = /^v1\./;
var REGEX_IS_INSTALLATION = /^ghs_/;
var REGEX_IS_USER_TO_SERVER = /^ghu_/;
async function auth(token) {
  const isApp = token.split(/\./).length === 3;
  const isInstallation = REGEX_IS_INSTALLATION_LEGACY.test(token) || REGEX_IS_INSTALLATION.test(token);
  const isUserToServer = REGEX_IS_USER_TO_SERVER.test(token);
  const tokenType = isApp ? "app" : isInstallation ? "installation" : isUserToServer ? "user-to-server" : "oauth";
  return {
    type: "token",
    token,
    tokenType
  };
}
__name(auth, "auth");

// node_modules/.pnpm/@octokit-next+auth-token@2.7.1/node_modules/@octokit-next/auth-token/lib/with-authorization-prefix.js
function withAuthorizationPrefix(token) {
  if (token.split(/\./).length === 3) {
    return `bearer ${token}`;
  }
  return `token ${token}`;
}
__name(withAuthorizationPrefix, "withAuthorizationPrefix");

// node_modules/.pnpm/@octokit-next+auth-token@2.7.1/node_modules/@octokit-next/auth-token/lib/hook.js
async function hook(token, request3, route, parameters) {
  const endpoint2 = request3.endpoint.merge(route, parameters);
  endpoint2.headers.authorization = withAuthorizationPrefix(token);
  return request3(endpoint2);
}
__name(hook, "hook");

// node_modules/.pnpm/@octokit-next+auth-token@2.7.1/node_modules/@octokit-next/auth-token/index.js
function createTokenAuth(options) {
  if (!options?.token) {
    throw new Error(
      "[@octokit/auth-token] options.token not set for createTokenAuth(options)"
    );
  }
  if (typeof options?.token !== "string") {
    throw new Error(
      "[@octokit/auth-token] options.token is not a string for createTokenAuth(options)"
    );
  }
  const token = options.token.replace(/^(token|bearer) +/i, "");
  return Object.assign(auth.bind(null, token), {
    hook: hook.bind(null, token)
  });
}
__name(createTokenAuth, "createTokenAuth");

// node_modules/.pnpm/@octokit-next+graphql@2.7.1/node_modules/@octokit-next/graphql/lib/version.js
var VERSION3 = "2.7.1";

// node_modules/.pnpm/@octokit-next+graphql@2.7.1/node_modules/@octokit-next/graphql/lib/error.js
function _buildMessageForResponseErrors(data) {
  return `Request failed due to following response errors:
` + data.errors.map((e) => ` - ${e.message}`).join("\n");
}
__name(_buildMessageForResponseErrors, "_buildMessageForResponseErrors");
var GraphqlResponseError = class extends Error {
  static {
    __name(this, "GraphqlResponseError");
  }
  constructor(request3, headers, response) {
    super(_buildMessageForResponseErrors(response));
    this.request = request3;
    this.headers = headers;
    this.response = response;
    this.name = "GraphqlResponseError";
    this.errors = response.errors;
    this.data = response.data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};

// node_modules/.pnpm/@octokit-next+graphql@2.7.1/node_modules/@octokit-next/graphql/lib/graphql.js
var NON_VARIABLE_OPTIONS = [
  "method",
  "baseUrl",
  "url",
  "headers",
  "request",
  "query",
  "mediaType"
];
var FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];
var GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
function graphql(request3, query, options) {
  if (options) {
    if (typeof query === "string" && "query" in options) {
      return Promise.reject(
        new Error(`[@octokit/graphql] "query" cannot be used as variable name`)
      );
    }
    for (const key in options) {
      if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key))
        continue;
      return Promise.reject(
        new Error(`[@octokit/graphql] "${key}" cannot be used as variable name`)
      );
    }
  }
  const parsedOptions = typeof query === "string" ? Object.assign({ query }, options) : query;
  const requestOptions = Object.keys(parsedOptions).reduce((result, key) => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      result[key] = parsedOptions[key];
      return result;
    }
    if (!result.variables) {
      result.variables = {};
    }
    result.variables[key] = parsedOptions[key];
    return result;
  }, {});
  const baseUrl = parsedOptions.baseUrl || request3.endpoint.DEFAULTS.baseUrl;
  if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
    requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
  }
  return request3(requestOptions).then((response) => {
    if (response.data.errors) {
      const headers = {};
      for (const key of Object.keys(response.headers)) {
        headers[key] = response.headers[key];
      }
      throw new GraphqlResponseError(requestOptions, headers, response.data);
    }
    return response.data.data;
  });
}
__name(graphql, "graphql");

// node_modules/.pnpm/@octokit-next+graphql@2.7.1/node_modules/@octokit-next/graphql/lib/with-defaults.js
function withDefaults3(oldRequest, newDefaults) {
  const newRequest = oldRequest.defaults(newDefaults);
  const newApi = /* @__PURE__ */ __name((query, options) => {
    return graphql(newRequest, query, options);
  }, "newApi");
  return Object.assign(newApi, {
    defaults: withDefaults3.bind(null, newRequest),
    endpoint: newRequest.endpoint
  });
}
__name(withDefaults3, "withDefaults");

// node_modules/.pnpm/@octokit-next+graphql@2.7.1/node_modules/@octokit-next/graphql/index.js
var graphql2 = withDefaults3(request2, {
  headers: {
    "user-agent": `octokit-next-graphql.js/${VERSION3} ${getUserAgent()}`
  },
  method: "POST",
  url: "/graphql"
});
function withCustomRequest(customRequest) {
  return withDefaults3(customRequest, {
    method: "POST",
    url: "/graphql"
  });
}
__name(withCustomRequest, "withCustomRequest");

// node_modules/.pnpm/before-after-hook@3.0.2/node_modules/before-after-hook/lib/register.js
function register(state, name, method, options) {
  if (typeof method !== "function") {
    throw new Error("method for before hook must be a function");
  }
  if (!options) {
    options = {};
  }
  if (Array.isArray(name)) {
    return name.reverse().reduce((callback, name2) => {
      return register.bind(null, state, name2, callback, options);
    }, method)();
  }
  return Promise.resolve().then(() => {
    if (!state.registry[name]) {
      return method(options);
    }
    return state.registry[name].reduce((method2, registered) => {
      return registered.hook.bind(null, method2, options);
    }, method)();
  });
}
__name(register, "register");

// node_modules/.pnpm/before-after-hook@3.0.2/node_modules/before-after-hook/lib/add.js
function addHook(state, kind, name, hook2) {
  const orig = hook2;
  if (!state.registry[name]) {
    state.registry[name] = [];
  }
  if (kind === "before") {
    hook2 = /* @__PURE__ */ __name((method, options) => {
      return Promise.resolve().then(orig.bind(null, options)).then(method.bind(null, options));
    }, "hook");
  }
  if (kind === "after") {
    hook2 = /* @__PURE__ */ __name((method, options) => {
      let result;
      return Promise.resolve().then(method.bind(null, options)).then((result_) => {
        result = result_;
        return orig(result, options);
      }).then(() => {
        return result;
      });
    }, "hook");
  }
  if (kind === "error") {
    hook2 = /* @__PURE__ */ __name((method, options) => {
      return Promise.resolve().then(method.bind(null, options)).catch((error2) => {
        return orig(error2, options);
      });
    }, "hook");
  }
  state.registry[name].push({
    hook: hook2,
    orig
  });
}
__name(addHook, "addHook");

// node_modules/.pnpm/before-after-hook@3.0.2/node_modules/before-after-hook/lib/remove.js
function removeHook(state, name, method) {
  if (!state.registry[name]) {
    return;
  }
  const index = state.registry[name].map((registered) => {
    return registered.orig;
  }).indexOf(method);
  if (index === -1) {
    return;
  }
  state.registry[name].splice(index, 1);
}
__name(removeHook, "removeHook");

// node_modules/.pnpm/before-after-hook@3.0.2/node_modules/before-after-hook/index.js
var bind = Function.bind;
var bindable = bind.bind(bind);
function bindApi(hook2, state, name) {
  const removeHookRef = bindable(removeHook, null).apply(
    null,
    name ? [state, name] : [state]
  );
  hook2.api = { remove: removeHookRef };
  hook2.remove = removeHookRef;
  ["before", "error", "after", "wrap"].forEach((kind) => {
    const args = name ? [state, kind, name] : [state, kind];
    hook2[kind] = hook2.api[kind] = bindable(addHook, null).apply(null, args);
  });
}
__name(bindApi, "bindApi");
function Singular() {
  const singularHookName = Symbol("Singular");
  const singularHookState = {
    registry: {}
  };
  const singularHook = register.bind(null, singularHookState, singularHookName);
  bindApi(singularHook, singularHookState, singularHookName);
  return singularHook;
}
__name(Singular, "Singular");
function Collection() {
  const state = {
    registry: {}
  };
  const hook2 = register.bind(null, state);
  bindApi(hook2, state);
  return hook2;
}
__name(Collection, "Collection");
var before_after_hook_default = { Singular, Collection };

// node_modules/.pnpm/@octokit-next+core@2.7.1/node_modules/@octokit-next/core/lib/version.js
var VERSION4 = "2.7.1";

// node_modules/.pnpm/@octokit-next+core@2.7.1/node_modules/@octokit-next/core/index.js
var Octokit = class {
  static {
    __name(this, "Octokit");
  }
  static VERSION = VERSION4;
  static DEFAULTS = {
    baseUrl: endpoint.DEFAULTS.baseUrl,
    userAgent: `octokit-next-core.js/${VERSION4} ${getUserAgent()}`
  };
  static withPlugins(newPlugins) {
    const currentPlugins = this.PLUGINS;
    return class extends this {
      static PLUGINS = currentPlugins.concat(
        newPlugins.filter((plugin) => !currentPlugins.includes(plugin))
      );
    };
  }
  static withDefaults(defaults) {
    const newDefaultUserAgent = [defaults?.userAgent, this.DEFAULTS.userAgent].filter(Boolean).join(" ");
    const newDefaults = {
      ...this.DEFAULTS,
      ...defaults,
      userAgent: newDefaultUserAgent,
      request: {
        ...this.DEFAULTS.request,
        ...defaults?.request
      }
    };
    return class extends this {
      constructor(options) {
        if (typeof defaults === "function") {
          super(defaults(options, newDefaults));
          return;
        }
        super(options);
      }
      static DEFAULTS = newDefaults;
    };
  }
  static PLUGINS = [];
  constructor(options = {}) {
    this.options = {
      ...this.constructor.DEFAULTS,
      ...options,
      request: {
        ...this.constructor.DEFAULTS.request,
        ...options?.request
      }
    };
    const hook2 = new before_after_hook_default.Collection();
    const requestDefaults = {
      baseUrl: this.options.baseUrl,
      headers: {},
      request: {
        ...this.options.request,
        hook: hook2.bind(null, "request")
      },
      mediaType: {
        previews: [],
        format: ""
      }
    };
    const userAgent2 = [options?.userAgent, this.constructor.DEFAULTS.userAgent].filter(Boolean).join(" ");
    requestDefaults.headers["user-agent"] = userAgent2;
    if (this.options.previews) {
      requestDefaults.mediaType.previews = this.options.previews;
    }
    if (this.options.timeZone) {
      requestDefaults.headers["time-zone"] = this.options.timeZone;
    }
    this.constructor.PLUGINS.forEach((plugin) => {
      Object.assign(this, plugin(this, this.options));
    });
    this.request = request2.defaults(requestDefaults);
    this.graphql = withCustomRequest(this.request).defaults(requestDefaults);
    this.log = Object.assign(
      {
        debug: () => {
        },
        info: () => {
        },
        warn: console.warn.bind(console),
        error: console.error.bind(console)
      },
      this.options.log
    );
    this.hook = hook2;
    if (!this.options.authStrategy) {
      if (!this.options.auth) {
        this.auth = async () => ({
          type: "unauthenticated"
        });
      } else {
        const auth2 = createTokenAuth({ token: this.options.auth });
        hook2.wrap("request", auth2.hook);
        this.auth = auth2;
      }
    } else {
      const { authStrategy, ...otherOptions } = this.options;
      const auth2 = authStrategy(
        Object.assign(
          {
            request: this.request,
            log: this.log,
            // we pass the current octokit instance as well as its constructor options
            // to allow for authentication strategies that return a new octokit instance
            // that shares the same internal state as the current one. The original
            // requirement for this was the "event-octokit" authentication strategy
            // of https://github.com/probot/octokit-auth-probot.
            octokit: this,
            octokitOptions: otherOptions
          },
          this.options.auth
        )
      );
      hook2.wrap("request", auth2.hook);
      this.auth = auth2;
    }
  }
};

// src/github/api/paginate.ts
var import_plugin_paginate_rest = __toESM(require_dist_node(), 1);
var paginate = /* @__PURE__ */ __name(async (endpoint2, options) => {
  const { gitHubApiToken } = useInputs();
  return new (Octokit.withPlugins([import_plugin_paginate_rest.paginateRest]))({
    auth: gitHubApiToken
  }).paginate(endpoint2, options);
}, "paginate");

// __generated__/gql/graphql.ts
var TypedDocumentString = class extends String {
  constructor(value, __meta__) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }
  static {
    __name(this, "TypedDocumentString");
  }
  __apiType;
  toString() {
    return this.value;
  }
};
var DeploymentFragmentFragmentDoc = new TypedDocumentString(`
    fragment DeploymentFragment on Deployment {
  id
  environment
  state
}
    `, { "fragmentName": "DeploymentFragment" });
var EnvironmentFragmentFragmentDoc = new TypedDocumentString(`
    fragment EnvironmentFragment on Environment {
  name
  id
}
    `, { "fragmentName": "EnvironmentFragment" });
var FilesDocument = new TypedDocumentString(`
    query Files($owner: String!, $repo: String!, $path: String!) {
  repository(owner: $owner, name: $repo) {
    object(expression: $path) {
      __typename
      ... on Tree {
        entries {
          name
          type
          language {
            name
          }
          object {
            __typename
            ... on Blob {
              text
            }
          }
        }
      }
    }
  }
}
    `);
var AddCommentDocument = new TypedDocumentString(`
    mutation AddComment($subjectId: ID!, $body: String!) {
  addComment(input: {subjectId: $subjectId, body: $body}) {
    commentEdge {
      node {
        id
      }
    }
  }
}
    `);
var CreateGitHubDeploymentDocument = new TypedDocumentString(`
    mutation CreateGitHubDeployment($repositoryId: ID!, $environmentName: String!, $refId: ID!, $payload: String!, $description: String) {
  createDeployment(
    input: {autoMerge: false, description: $description, environment: $environmentName, refId: $refId, repositoryId: $repositoryId, requiredContexts: [], payload: $payload}
  ) {
    deployment {
      ...DeploymentFragment
    }
  }
}
    fragment DeploymentFragment on Deployment {
  id
  environment
  state
}`);
var DeleteGitHubDeploymentDocument = new TypedDocumentString(`
    mutation DeleteGitHubDeployment($deploymentId: ID!) {
  deleteDeployment(input: {id: $deploymentId}) {
    clientMutationId
  }
}
    `);
var DeleteGitHubDeploymentAndCommentDocument = new TypedDocumentString(`
    mutation DeleteGitHubDeploymentAndComment($deploymentId: ID!, $commentId: ID!) {
  deleteDeployment(input: {id: $deploymentId}) {
    clientMutationId
  }
  deleteIssueComment(input: {id: $commentId}) {
    clientMutationId
  }
}
    `);
var CreateGitHubDeploymentStatusDocument = new TypedDocumentString(`
    mutation CreateGitHubDeploymentStatus($deploymentId: ID!, $environment: String, $environmentUrl: String!, $logUrl: String!, $state: DeploymentStatusState!) {
  createDeploymentStatus(
    input: {autoInactive: false, deploymentId: $deploymentId, environment: $environment, environmentUrl: $environmentUrl, logUrl: $logUrl, state: $state}
  ) {
    deploymentStatus {
      deployment {
        ...DeploymentFragment
      }
    }
  }
}
    fragment DeploymentFragment on Deployment {
  id
  environment
  state
}`);
var CreateEnvironmentDocument = new TypedDocumentString(`
    mutation CreateEnvironment($repositoryId: ID!, $name: String!) {
  createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {
    environment {
      ...EnvironmentFragment
    }
  }
}
    fragment EnvironmentFragment on Environment {
  name
  id
}`);
var GetEnvironmentDocument = new TypedDocumentString(`
    query GetEnvironment($owner: String!, $repo: String!, $environment_name: String!, $qualifiedName: String!) {
  repository(owner: $owner, name: $repo) {
    environment(name: $environment_name) {
      ...EnvironmentFragment
    }
    ref(qualifiedName: $qualifiedName) {
      id
      name
      prefix
    }
  }
}
    fragment EnvironmentFragment on Environment {
  name
  id
}`);

// __generated__/gql/gql.ts
var documents = {
  "\n      query Files($owner: String!, $repo: String!, $path: String!) {\n        repository(owner: $owner, name: $repo) {\n          object(expression: $path) {\n            __typename\n            ... on Tree {\n              entries {\n                name\n                type\n                language {\n                  name\n                }\n                object {\n                  __typename\n                  ... on Blob {\n                    text\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ": FilesDocument,
  "\n  mutation AddComment($subjectId: ID!, $body: String!) {\n    addComment(input: {subjectId: $subjectId, body: $body}) {\n      commentEdge {\n        node {\n          id\n        }\n      }\n    }\n  }\n": AddCommentDocument,
  "\n  mutation CreateGitHubDeployment(\n    $repositoryId: ID!\n    $environmentName: String!\n    $refId: ID!\n    $payload: String!\n    $description: String\n  ) {\n    createDeployment(\n      input: {\n        autoMerge: false\n        description: $description\n        environment: $environmentName\n        refId: $refId\n        repositoryId: $repositoryId\n        requiredContexts: []\n        payload: $payload\n      }\n    ) {\n      deployment {\n        ...DeploymentFragment\n      }\n    }\n  }\n": CreateGitHubDeploymentDocument,
  "\n  mutation DeleteGitHubDeployment($deploymentId: ID!) {\n    deleteDeployment(input: {id: $deploymentId}) {\n      clientMutationId\n    }\n  }\n": DeleteGitHubDeploymentDocument,
  "\n  mutation DeleteGitHubDeploymentAndComment(\n    $deploymentId: ID!\n    $commentId: ID!\n  ) {\n    deleteDeployment(input: {id: $deploymentId}) {\n      clientMutationId\n    }\n    deleteIssueComment(input: {id: $commentId}) {\n      clientMutationId\n    }\n  }\n": DeleteGitHubDeploymentAndCommentDocument,
  "\n  fragment DeploymentFragment on Deployment {\n    id\n    environment\n    state\n  }\n": DeploymentFragmentFragmentDoc,
  "\n  mutation CreateGitHubDeploymentStatus(\n    $deploymentId: ID!\n    $environment: String\n    $environmentUrl: String!\n    $logUrl: String!\n    $state: DeploymentStatusState!\n  ) {\n    createDeploymentStatus(\n      input: {\n        autoInactive: false\n        deploymentId: $deploymentId\n        environment: $environment\n        environmentUrl: $environmentUrl\n        logUrl: $logUrl\n        state: $state\n      }\n    ) {\n      deploymentStatus {\n        deployment {\n          ...DeploymentFragment\n        }\n      }\n    }\n  }\n": CreateGitHubDeploymentStatusDocument,
  "\n  fragment EnvironmentFragment on Environment {\n    name\n    id\n  }\n": EnvironmentFragmentFragmentDoc,
  "\n  mutation CreateEnvironment($repositoryId: ID!, $name: String!) {\n    createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {\n      environment {\n        ...EnvironmentFragment\n      }\n    }\n  }\n": CreateEnvironmentDocument,
  "\n  query GetEnvironment(\n    $owner: String!\n    $repo: String!\n    $environment_name: String!\n    $qualifiedName: String!\n  ) {\n    repository(owner: $owner, name: $repo) {\n      environment(name: $environment_name) {\n        ...EnvironmentFragment\n      }\n      ref(qualifiedName: $qualifiedName) {\n        id\n        name\n        prefix\n      }\n    }\n  }\n": GetEnvironmentDocument
};
function graphql3(source) {
  return documents[source] ?? {};
}
__name(graphql3, "graphql");

// src/cloudflare/api/endpoints.ts
var API_ENDPOINT = `https://api.cloudflare.com`;
var getCloudflareApiEndpoint = /* @__PURE__ */ __name((path3) => {
  const { cloudflareAccountId, cloudflareProjectName } = useInputs();
  const input = [
    `/client/v4/accounts/${cloudflareAccountId}/pages/projects/${cloudflareProjectName}`,
    path3
  ].filter(Boolean).join("/");
  return new URL(input, API_ENDPOINT).toString();
}, "getCloudflareApiEndpoint");
var getCloudflareLogEndpoint = /* @__PURE__ */ __name((id) => {
  const { cloudflareAccountId, cloudflareProjectName } = useInputs();
  return new URL(
    `${cloudflareAccountId}/pages/view/${cloudflareProjectName}/${id}`,
    `https://dash.cloudflare.com`
  ).toString();
}, "getCloudflareLogEndpoint");

// src/cloudflare/api/parse-error.ts
var ParseError = class extends Error {
  static {
    __name(this, "ParseError");
  }
  text;
  notes;
  location;
  kind;
  code;
  constructor({ text, notes, location, kind }) {
    super(text);
    this.name = this.constructor.name;
    this.text = text;
    this.notes = notes ?? [];
    this.location = location;
    this.kind = kind ?? "error";
  }
};

// src/cloudflare/api/fetch-error.ts
var throwFetchError = /* @__PURE__ */ __name((resource, response) => {
  const error2 = new ParseError({
    text: `A request to the Cloudflare API (${resource}) failed.`,
    notes: response.errors.map((err) => ({
      text: renderError(err)
    }))
  });
  const code = response.errors[0]?.code;
  if (code) {
    error2.code = code;
  }
  if (error2.notes?.length > 0) {
    error2.notes.map((note) => {
      error(`Cloudflare API: ${note.text}`);
    });
  }
  throw error2;
}, "throwFetchError");
var renderError = /* @__PURE__ */ __name((err, level = 0) => {
  const chainedMessages = err.error_chain?.map(
    (chainedError) => `
${"  ".repeat(level)}- ${renderError(chainedError, level + 1)}`
  ).join("\n") ?? "";
  return (err.code ? `${err.message} [code: ${err.code}]` : err.message) + chainedMessages;
}, "renderError");

// src/cloudflare/api/fetch-result.ts
var fetchResult = /* @__PURE__ */ __name(async (resource, init = {}, queryParams, abortSignal) => {
  const method = init.method ?? "GET";
  const { cloudflareApiToken } = useInputs();
  const initFetch = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${cloudflareApiToken}`
    }
  };
  const response = await fetch(resource, {
    method,
    ...initFetch,
    signal: abortSignal
  }).then((response2) => response2.json());
  if (response.success) {
    if (response.result === null || response.result === void 0) {
      throw new Error(`Cloudflare API: response missing 'result'`);
    }
    return response.result;
  }
  return throwFetchError(resource, response);
}, "fetchResult");
var fetchSuccess = /* @__PURE__ */ __name(async (resource, init = {}) => {
  const method = init.method ?? "GET";
  const { cloudflareApiToken } = useInputs();
  const initFetch = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${cloudflareApiToken}`
    }
  };
  const response = await fetch(resource, {
    method,
    ...initFetch
  }).then((response2) => response2.json());
  if (!response.success && response.errors.length > 0) {
    throwFetchError(resource, response);
  }
  return response.success;
}, "fetchSuccess");

// src/cloudflare/deployment/get.ts
var getCloudflareDeployments = /* @__PURE__ */ __name(async () => {
  const url2 = getCloudflareApiEndpoint("deployments");
  const result = await fetchResult(url2);
  return result;
}, "getCloudflareDeployments");
var getCloudflareDeploymentAlias = /* @__PURE__ */ __name((deployment) => {
  return deployment.aliases && deployment.aliases.length > 0 ? deployment.aliases[0] : deployment.url;
}, "getCloudflareDeploymentAlias");
var getCloudflareLatestDeployment = /* @__PURE__ */ __name(async () => {
  const { sha: commitHash } = useContext();
  const deployments = await getCloudflareDeployments();
  const deployment = deployments?.find(
    (deployment2) => deployment2.deployment_trigger.metadata.commit_hash === commitHash
  );
  if (deployment === void 0) {
    throw new Error(
      `Cloudflare: could not find deployment with commitHash: ${commitHash}`
    );
  }
  return deployment;
}, "getCloudflareLatestDeployment");

// src/github/comment.ts
var MutationAddComment = graphql3(
  /* GraphQL */
  `
  mutation AddComment($subjectId: ID!, $body: String!) {
    addComment(input: {subjectId: $subjectId, body: $body}) {
      commentEdge {
        node {
          id
        }
      }
    }
  }
`
);
var addComment = /* @__PURE__ */ __name(async (deployment) => {
  const { eventName, payload } = useContextEvent();
  if (eventName === "pull_request" && payload.action !== "closed") {
    const prNodeId = payload.pull_request.node_id ?? raise("No pull request node id");
    const { sha } = useContext();
    const rawBody = `## Cloudflare Pages Deployment
 **Environment:** ${deployment.environment} 
 **Project:** ${deployment.project_name} 
 **Built with commit:** ${sha}
 **Preview URL:** ${deployment.url} 
 **Branch Preview URL:** ${getCloudflareDeploymentAlias(deployment)}`;
    const comment = await request({
      query: MutationAddComment,
      variables: {
        subjectId: prNodeId,
        body: rawBody
      }
    });
    return comment.data.addComment?.commentEdge?.node?.id;
  }
}, "addComment");

// src/github/environment.ts
var EnvironmentFragment = graphql3(
  /* GraphQL */
  `
  fragment EnvironmentFragment on Environment {
    name
    id
  }
`
);
var MutationCreateEnvironment = graphql3(
  /* GraphQL */
  `
  mutation CreateEnvironment($repositoryId: ID!, $name: String!) {
    createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {
      environment {
        ...EnvironmentFragment
      }
    }
  }
`
);
var QueryGetEnvironment = graphql3(
  /* GraphQL */
  `
  query GetEnvironment(
    $owner: String!
    $repo: String!
    $environment_name: String!
    $qualifiedName: String!
  ) {
    repository(owner: $owner, name: $repo) {
      environment(name: $environment_name) {
        ...EnvironmentFragment
      }
      ref(qualifiedName: $qualifiedName) {
        id
        name
        prefix
      }
    }
  }
`
);
var checkEnvironment = /* @__PURE__ */ __name(async () => {
  const { gitHubEnvironment } = useInputs();
  const { repo, ref } = useContext();
  const environment = await request({
    query: QueryGetEnvironment,
    variables: {
      owner: repo.owner,
      repo: repo.repo,
      environment_name: gitHubEnvironment,
      qualifiedName: ref
    },
    options: {
      errorThrows: false
    }
  });
  if (environment.errors) {
    error(`GitHub Environment: Errors - ${JSON.stringify(environment.errors)}`);
  }
  if (!environment.data.repository?.environment) {
    throw new Error(`GitHub Environment: Not created for ${gitHubEnvironment}`);
  }
  if (!environment.data.repository?.ref?.id) {
    throw new Error(`GitHub Environment: No ref id ${gitHubEnvironment}`);
  }
  return {
    ...environment.data.repository.environment,
    refId: environment.data.repository?.ref?.id
  };
}, "checkEnvironment");

// src/github/deployment/status.ts
var MutationCreateGitHubDeploymentStatus = graphql3(
  /* GraphQL */
  `
  mutation CreateGitHubDeploymentStatus(
    $deploymentId: ID!
    $environment: String
    $environmentUrl: String!
    $logUrl: String!
    $state: DeploymentStatusState!
  ) {
    createDeploymentStatus(
      input: {
        autoInactive: false
        deploymentId: $deploymentId
        environment: $environment
        environmentUrl: $environmentUrl
        logUrl: $logUrl
        state: $state
      }
    ) {
      deploymentStatus {
        deployment {
          ...DeploymentFragment
        }
      }
    }
  }
`
);

// src/github/deployment/create.ts
var MutationCreateGitHubDeployment = graphql3(
  /* GraphQL */
  `
  mutation CreateGitHubDeployment(
    $repositoryId: ID!
    $environmentName: String!
    $refId: ID!
    $payload: String!
    $description: String
  ) {
    createDeployment(
      input: {
        autoMerge: false
        description: $description
        environment: $environmentName
        refId: $refId
        repositoryId: $repositoryId
        requiredContexts: []
        payload: $payload
      }
    ) {
      deployment {
        ...DeploymentFragment
      }
    }
  }
`
);
var createGitHubDeployment = /* @__PURE__ */ __name(async ({ id, url: url2 }, commentId) => {
  const { name, refId } = await checkEnvironment() ?? raise("GitHub Deployment: GitHub Environment is required");
  const { repo } = useContext();
  const payload = { cloudflareId: id, url: url2, commentId };
  const deployment = await request({
    query: MutationCreateGitHubDeployment,
    variables: {
      repositoryId: repo.node_id,
      environmentName: name,
      refId,
      payload: JSON.stringify(payload),
      description: `Cloudflare Pages Deployment: ${id}`
    }
  });
  const gitHubDeploymentId = deployment.data.createDeployment?.deployment?.id ?? raise("GitHub Deployment: GitHub deployment id is required");
  await request({
    query: MutationCreateGitHubDeploymentStatus,
    variables: {
      environment: name,
      deploymentId: gitHubDeploymentId,
      environmentUrl: url2,
      logUrl: getCloudflareLogEndpoint(id),
      state: "SUCCESS" /* Success */
    }
  });
}, "createGitHubDeployment");

// src/github/deployment/delete.ts
var MutationDeleteGitHubDeployment = graphql3(
  /* GraphQL */
  `
  mutation DeleteGitHubDeployment($deploymentId: ID!) {
    deleteDeployment(input: {id: $deploymentId}) {
      clientMutationId
    }
  }
`
);
var MutationDeleteGitHubDeploymentAndComment = graphql3(
  /* GraphQL */
  `
  mutation DeleteGitHubDeploymentAndComment(
    $deploymentId: ID!
    $commentId: ID!
  ) {
    deleteDeployment(input: {id: $deploymentId}) {
      clientMutationId
    }
    deleteIssueComment(input: {id: $commentId}) {
      clientMutationId
    }
  }
`
);

// src/github/deployment/get.ts
var getGitHubDeployments = /* @__PURE__ */ __name(async () => {
  const { repo, branch } = useContext();
  const deployments = await paginate("GET /repos/{owner}/{repo}/deployments", {
    owner: repo.owner,
    repo: repo.repo,
    ref: branch,
    per_page: 100
  });
  return deployments;
}, "getGitHubDeployments");

// src/cloudflare/deployment/create.ts
var CLOUDFLARE_API_TOKEN = "CLOUDFLARE_API_TOKEN";
var CLOUDFLARE_ACCOUNT_ID = "CLOUDFLARE_ACCOUNT_ID";
var ERROR_KEY = `Create Deployment:`;
var createCloudflareDeployment = /* @__PURE__ */ __name(async () => {
  const {
    cloudflareAccountId,
    cloudflareProjectName,
    directory,
    cloudflareApiToken
  } = useInputs();
  process.env[CLOUDFLARE_API_TOKEN] = cloudflareApiToken;
  process.env[CLOUDFLARE_ACCOUNT_ID] = cloudflareAccountId;
  const { repo, branch, sha: commitHash } = useContext();
  if (branch === void 0) {
    throw new Error(`${ERROR_KEY} branch is undefined`);
  }
  try {
    const WRANGLER_VERSION = "3.3.0";
    strict(WRANGLER_VERSION, "wrangler version should exist");
    await $`npx wrangler@${WRANGLER_VERSION} pages deploy ${directory} --project-name=${cloudflareProjectName} --branch=${branch} --commit-dirty=true --commit-hash=${commitHash}`;
    const deployment = await getCloudflareLatestDeployment();
    setOutput("id", deployment.id);
    setOutput("url", deployment.url);
    setOutput("environment", deployment.environment);
    const alias = getCloudflareDeploymentAlias(deployment);
    setOutput("alias", alias);
    const deployStage = deployment.stages.find((stage) => stage.name === "deploy");
    await summary.addHeading("Cloudflare Pages Deployment").write();
    await summary.addBreak().write();
    await summary.addTable([
      [
        {
          data: "Name",
          header: true
        },
        {
          data: "Result",
          header: true
        }
      ],
      ["Environment:", deployment.environment],
      [
        "Branch:",
        `<a href='https://github.com/${repo.owner}/${repo.repo}/tree/${deployment.deployment_trigger.metadata.branch}'><code>${deployment.deployment_trigger.metadata.branch}</code></a>`
      ],
      [
        "Commit Hash:",
        `<a href='https://github.com/${repo.owner}/${repo.repo}/commit/${deployment.deployment_trigger.metadata.commit_hash}'><code>${deployment.deployment_trigger.metadata.commit_hash}</code></a>`
      ],
      [
        "Commit Message:",
        deployment.deployment_trigger.metadata.commit_message
      ],
      [
        "Status:",
        `<strong>${deployStage?.status.toUpperCase() || `UNKNOWN`}</strong>`
      ],
      ["Preview URL:", `<a href='${deployment.url}'>${deployment.url}</a>`],
      ["Branch Preview URL:", `<a href='${alias}'>${alias}</a>`]
    ]).write();
    return deployment;
  } catch (error2) {
    if (error2 instanceof Error) {
      throw error2;
    }
    if (error2 && typeof error2 === "object" && "stderr" in error2 && typeof error2.stderr === "string") {
      throw new Error(error2.stderr);
    }
    throw new Error(`${ERROR_KEY} unknown error`);
  }
}, "createCloudflareDeployment");

// src/cloudflare/project/get.ts
var getCloudflareProject = /* @__PURE__ */ __name(async () => {
  const url2 = getCloudflareApiEndpoint();
  const result = await fetchResult(url2);
  return result;
}, "getCloudflareProject");

// src/cloudflare/deployment/delete.ts
var deleteCloudflareDeployment = /* @__PURE__ */ __name(async (deploymentIdentifier) => {
  const url2 = getCloudflareApiEndpoint(
    `deployments/${deploymentIdentifier}?force=true`
  );
  try {
    const success = await fetchSuccess(url2, {
      method: "DELETE"
    });
    if (success === true) {
      info(`Cloudflare Deployment Deleted: ${deploymentIdentifier}`);
      return true;
    }
    throw new Error("Cloudflare Delete Deployment: fail");
  } catch (successError) {
    if (successError instanceof ParseError && successError.code === 8000009) {
      warning(
        `Cloudflare Deployment might have been deleted already: ${deploymentIdentifier}`
      );
      return true;
    }
    error(`Cloudflare Error deleting deployment: ${deploymentIdentifier}`);
    return false;
  }
}, "deleteCloudflareDeployment");

// src/delete.ts
var idDeploymentPayload = /* @__PURE__ */ __name((payload) => {
  const parsedPayload = typeof payload === "string" ? JSON.parse(payload) : payload;
  if (!parsedPayload || typeof parsedPayload !== "object")
    return false;
  return "cloudflareId" in parsedPayload && "url" in parsedPayload;
}, "idDeploymentPayload");
var deleteDeployments = /* @__PURE__ */ __name(async (isProduction = false) => {
  let deployments = await getGitHubDeployments();
  if (isProduction) {
    deployments = deployments.slice(5);
  }
  if (deployments.length === 0) {
    info("No deployments found to delete");
    return;
  }
  for (const deployment of deployments) {
    const payload = deployment.payload;
    if (!idDeploymentPayload(payload)) {
      info(`Deployment ${deployment.id} has no payload`);
      continue;
    }
    const { cloudflareId, commentId, url: url2 } = payload;
    const deletedCloudflareDeployment = await deleteCloudflareDeployment(
      cloudflareId
    );
    if (!deletedCloudflareDeployment)
      continue;
    const updateStatusGitHubDeployment = await request({
      query: MutationCreateGitHubDeploymentStatus,
      variables: {
        environment: deployment.environment,
        deploymentId: deployment.node_id,
        environmentUrl: url2,
        logUrl: getCloudflareLogEndpoint(cloudflareId),
        state: "INACTIVE" /* Inactive */
      },
      options: {
        errorThrows: false
      }
    });
    if (updateStatusGitHubDeployment.errors) {
      warning(
        `Error updating GitHub deployment status: ${JSON.stringify(
          updateStatusGitHubDeployment.errors
        )}`
      );
      continue;
    }
    const deletedGitHubDeployment = commentId ? await request({
      query: MutationDeleteGitHubDeploymentAndComment,
      variables: {
        deploymentId: deployment.node_id,
        commentId
      },
      options: {
        errorThrows: false
      }
    }) : await request({
      query: MutationDeleteGitHubDeployment,
      variables: {
        deploymentId: deployment.node_id
      },
      options: {
        errorThrows: false
      }
    });
    if (deletedGitHubDeployment.errors) {
      warning(
        `Error deleting GitHub deployment: ${JSON.stringify(
          deletedGitHubDeployment.errors
        )}`
      );
    }
    info(`GitHub Deployment Deleted: ${deployment.node_id}`);
  }
}, "deleteDeployments");

// src/main.ts
async function run() {
  const { branch } = useContext();
  const { eventName, payload } = useContextEvent();
  if (eventName !== "push" && eventName !== "pull_request")
    return;
  const project = await getCloudflareProject();
  if (eventName === "pull_request" && payload.action === "closed") {
    await deleteDeployments();
    return;
  }
  const isProduction = project.production_branch === branch;
  if (eventName === "push" && isProduction) {
    try {
      info("Is production branch, deleting old deployments but latest 5");
      await deleteDeployments(isProduction);
    } catch {
      info("Error deleting deployments for production branch");
    }
  }
  const cloudflareDeployment = await createCloudflareDeployment();
  const commentId = await addComment(cloudflareDeployment);
  await createGitHubDeployment(cloudflareDeployment, commentId);
}
__name(run, "run");

// src/index.ts
try {
  void run();
} catch (error2) {
  if (error2 instanceof Error)
    setFailed(error2.message);
}
//# sourceMappingURL=index.js.map
