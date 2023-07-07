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
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.pnpm/@actions+http-client@2.1.0/node_modules/@actions/http-client/lib/proxy.js
var require_proxy = __commonJS({
  "node_modules/.pnpm/@actions+http-client@2.1.0/node_modules/@actions/http-client/lib/proxy.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkBypass = exports.getProxyUrl = void 0;
    function getProxyUrl(reqUrl) {
      const usingSsl = reqUrl.protocol === "https:";
      if (checkBypass(reqUrl)) {
        return void 0;
      }
      const proxyVar = (() => {
        if (usingSsl) {
          return process.env["https_proxy"] || process.env["HTTPS_PROXY"];
        } else {
          return process.env["http_proxy"] || process.env["HTTP_PROXY"];
        }
      })();
      if (proxyVar) {
        return new URL(proxyVar);
      } else {
        return void 0;
      }
    }
    __name(getProxyUrl, "getProxyUrl");
    exports.getProxyUrl = getProxyUrl;
    function checkBypass(reqUrl) {
      if (!reqUrl.hostname) {
        return false;
      }
      const reqHost = reqUrl.hostname;
      if (isLoopbackAddress(reqHost)) {
        return true;
      }
      const noProxy = process.env["no_proxy"] || process.env["NO_PROXY"] || "";
      if (!noProxy) {
        return false;
      }
      let reqPort;
      if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
      } else if (reqUrl.protocol === "http:") {
        reqPort = 80;
      } else if (reqUrl.protocol === "https:") {
        reqPort = 443;
      }
      const upperReqHosts = [reqUrl.hostname.toUpperCase()];
      if (typeof reqPort === "number") {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
      }
      for (const upperNoProxyItem of noProxy.split(",").map((x) => x.trim().toUpperCase()).filter((x) => x)) {
        if (upperNoProxyItem === "*" || upperReqHosts.some((x) => x === upperNoProxyItem || x.endsWith(`.${upperNoProxyItem}`) || upperNoProxyItem.startsWith(".") && x.endsWith(`${upperNoProxyItem}`))) {
          return true;
        }
      }
      return false;
    }
    __name(checkBypass, "checkBypass");
    exports.checkBypass = checkBypass;
    function isLoopbackAddress(host) {
      const hostLower = host.toLowerCase();
      return hostLower === "localhost" || hostLower.startsWith("127.") || hostLower.startsWith("[::1]") || hostLower.startsWith("[0:0:0:0:0:0:0:1]");
    }
    __name(isLoopbackAddress, "isLoopbackAddress");
  }
});

// node_modules/.pnpm/tunnel@0.0.6/node_modules/tunnel/lib/tunnel.js
var require_tunnel = __commonJS({
  "node_modules/.pnpm/tunnel@0.0.6/node_modules/tunnel/lib/tunnel.js"(exports) {
    "use strict";
    var net = __require("net");
    var tls = __require("tls");
    var http = __require("http");
    var https = __require("https");
    var events = __require("events");
    var assert2 = __require("assert");
    var util = __require("util");
    exports.httpOverHttp = httpOverHttp;
    exports.httpsOverHttp = httpsOverHttp;
    exports.httpOverHttps = httpOverHttps;
    exports.httpsOverHttps = httpsOverHttps;
    function httpOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      return agent;
    }
    __name(httpOverHttp, "httpOverHttp");
    function httpsOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    __name(httpsOverHttp, "httpsOverHttp");
    function httpOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      return agent;
    }
    __name(httpOverHttps, "httpOverHttps");
    function httpsOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    __name(httpsOverHttps, "httpsOverHttps");
    function TunnelingAgent(options) {
      var self = this;
      self.options = options || {};
      self.proxyOptions = self.options.proxy || {};
      self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
      self.requests = [];
      self.sockets = [];
      self.on("free", /* @__PURE__ */ __name(function onFree(socket, host, port, localAddress) {
        var options2 = toOptions(host, port, localAddress);
        for (var i = 0, len = self.requests.length; i < len; ++i) {
          var pending = self.requests[i];
          if (pending.host === options2.host && pending.port === options2.port) {
            self.requests.splice(i, 1);
            pending.request.onSocket(socket);
            return;
          }
        }
        socket.destroy();
        self.removeSocket(socket);
      }, "onFree"));
    }
    __name(TunnelingAgent, "TunnelingAgent");
    util.inherits(TunnelingAgent, events.EventEmitter);
    TunnelingAgent.prototype.addRequest = /* @__PURE__ */ __name(function addRequest(req, host, port, localAddress) {
      var self = this;
      var options = mergeOptions({ request: req }, self.options, toOptions(host, port, localAddress));
      if (self.sockets.length >= this.maxSockets) {
        self.requests.push(options);
        return;
      }
      self.createSocket(options, function(socket) {
        socket.on("free", onFree);
        socket.on("close", onCloseOrRemove);
        socket.on("agentRemove", onCloseOrRemove);
        req.onSocket(socket);
        function onFree() {
          self.emit("free", socket, options);
        }
        __name(onFree, "onFree");
        function onCloseOrRemove(err) {
          self.removeSocket(socket);
          socket.removeListener("free", onFree);
          socket.removeListener("close", onCloseOrRemove);
          socket.removeListener("agentRemove", onCloseOrRemove);
        }
        __name(onCloseOrRemove, "onCloseOrRemove");
      });
    }, "addRequest");
    TunnelingAgent.prototype.createSocket = /* @__PURE__ */ __name(function createSocket(options, cb) {
      var self = this;
      var placeholder = {};
      self.sockets.push(placeholder);
      var connectOptions = mergeOptions({}, self.proxyOptions, {
        method: "CONNECT",
        path: options.host + ":" + options.port,
        agent: false,
        headers: {
          host: options.host + ":" + options.port
        }
      });
      if (options.localAddress) {
        connectOptions.localAddress = options.localAddress;
      }
      if (connectOptions.proxyAuth) {
        connectOptions.headers = connectOptions.headers || {};
        connectOptions.headers["Proxy-Authorization"] = "Basic " + new Buffer(connectOptions.proxyAuth).toString("base64");
      }
      debug2("making CONNECT request");
      var connectReq = self.request(connectOptions);
      connectReq.useChunkedEncodingByDefault = false;
      connectReq.once("response", onResponse);
      connectReq.once("upgrade", onUpgrade);
      connectReq.once("connect", onConnect);
      connectReq.once("error", onError);
      connectReq.end();
      function onResponse(res) {
        res.upgrade = true;
      }
      __name(onResponse, "onResponse");
      function onUpgrade(res, socket, head) {
        process.nextTick(function() {
          onConnect(res, socket, head);
        });
      }
      __name(onUpgrade, "onUpgrade");
      function onConnect(res, socket, head) {
        connectReq.removeAllListeners();
        socket.removeAllListeners();
        if (res.statusCode !== 200) {
          debug2(
            "tunneling socket could not be established, statusCode=%d",
            res.statusCode
          );
          socket.destroy();
          var error2 = new Error("tunneling socket could not be established, statusCode=" + res.statusCode);
          error2.code = "ECONNRESET";
          options.request.emit("error", error2);
          self.removeSocket(placeholder);
          return;
        }
        if (head.length > 0) {
          debug2("got illegal response body from proxy");
          socket.destroy();
          var error2 = new Error("got illegal response body from proxy");
          error2.code = "ECONNRESET";
          options.request.emit("error", error2);
          self.removeSocket(placeholder);
          return;
        }
        debug2("tunneling connection has established");
        self.sockets[self.sockets.indexOf(placeholder)] = socket;
        return cb(socket);
      }
      __name(onConnect, "onConnect");
      function onError(cause) {
        connectReq.removeAllListeners();
        debug2(
          "tunneling socket could not be established, cause=%s\n",
          cause.message,
          cause.stack
        );
        var error2 = new Error("tunneling socket could not be established, cause=" + cause.message);
        error2.code = "ECONNRESET";
        options.request.emit("error", error2);
        self.removeSocket(placeholder);
      }
      __name(onError, "onError");
    }, "createSocket");
    TunnelingAgent.prototype.removeSocket = /* @__PURE__ */ __name(function removeSocket(socket) {
      var pos = this.sockets.indexOf(socket);
      if (pos === -1) {
        return;
      }
      this.sockets.splice(pos, 1);
      var pending = this.requests.shift();
      if (pending) {
        this.createSocket(pending, function(socket2) {
          pending.request.onSocket(socket2);
        });
      }
    }, "removeSocket");
    function createSecureSocket(options, cb) {
      var self = this;
      TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
        var hostHeader = options.request.getHeader("host");
        var tlsOptions = mergeOptions({}, self.options, {
          socket,
          servername: hostHeader ? hostHeader.replace(/:.*$/, "") : options.host
        });
        var secureSocket = tls.connect(0, tlsOptions);
        self.sockets[self.sockets.indexOf(socket)] = secureSocket;
        cb(secureSocket);
      });
    }
    __name(createSecureSocket, "createSecureSocket");
    function toOptions(host, port, localAddress) {
      if (typeof host === "string") {
        return {
          host,
          port,
          localAddress
        };
      }
      return host;
    }
    __name(toOptions, "toOptions");
    function mergeOptions(target) {
      for (var i = 1, len = arguments.length; i < len; ++i) {
        var overrides = arguments[i];
        if (typeof overrides === "object") {
          var keys = Object.keys(overrides);
          for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
            var k = keys[j];
            if (overrides[k] !== void 0) {
              target[k] = overrides[k];
            }
          }
        }
      }
      return target;
    }
    __name(mergeOptions, "mergeOptions");
    var debug2;
    if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
      debug2 = /* @__PURE__ */ __name(function() {
        var args = Array.prototype.slice.call(arguments);
        if (typeof args[0] === "string") {
          args[0] = "TUNNEL: " + args[0];
        } else {
          args.unshift("TUNNEL:");
        }
        console.error.apply(console, args);
      }, "debug");
    } else {
      debug2 = /* @__PURE__ */ __name(function() {
      }, "debug");
    }
    exports.debug = debug2;
  }
});

// node_modules/.pnpm/tunnel@0.0.6/node_modules/tunnel/index.js
var require_tunnel2 = __commonJS({
  "node_modules/.pnpm/tunnel@0.0.6/node_modules/tunnel/index.js"(exports, module) {
    module.exports = require_tunnel();
  }
});

// node_modules/.pnpm/@actions+http-client@2.1.0/node_modules/@actions/http-client/lib/index.js
var require_lib = __commonJS({
  "node_modules/.pnpm/@actions+http-client@2.1.0/node_modules/@actions/http-client/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpClient = exports.isHttps = exports.HttpClientResponse = exports.HttpClientError = exports.getProxyUrl = exports.MediaTypes = exports.Headers = exports.HttpCodes = void 0;
    var http = __importStar(__require("http"));
    var https = __importStar(__require("https"));
    var pm = __importStar(require_proxy());
    var tunnel = __importStar(require_tunnel2());
    var HttpCodes;
    (function(HttpCodes2) {
      HttpCodes2[HttpCodes2["OK"] = 200] = "OK";
      HttpCodes2[HttpCodes2["MultipleChoices"] = 300] = "MultipleChoices";
      HttpCodes2[HttpCodes2["MovedPermanently"] = 301] = "MovedPermanently";
      HttpCodes2[HttpCodes2["ResourceMoved"] = 302] = "ResourceMoved";
      HttpCodes2[HttpCodes2["SeeOther"] = 303] = "SeeOther";
      HttpCodes2[HttpCodes2["NotModified"] = 304] = "NotModified";
      HttpCodes2[HttpCodes2["UseProxy"] = 305] = "UseProxy";
      HttpCodes2[HttpCodes2["SwitchProxy"] = 306] = "SwitchProxy";
      HttpCodes2[HttpCodes2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
      HttpCodes2[HttpCodes2["PermanentRedirect"] = 308] = "PermanentRedirect";
      HttpCodes2[HttpCodes2["BadRequest"] = 400] = "BadRequest";
      HttpCodes2[HttpCodes2["Unauthorized"] = 401] = "Unauthorized";
      HttpCodes2[HttpCodes2["PaymentRequired"] = 402] = "PaymentRequired";
      HttpCodes2[HttpCodes2["Forbidden"] = 403] = "Forbidden";
      HttpCodes2[HttpCodes2["NotFound"] = 404] = "NotFound";
      HttpCodes2[HttpCodes2["MethodNotAllowed"] = 405] = "MethodNotAllowed";
      HttpCodes2[HttpCodes2["NotAcceptable"] = 406] = "NotAcceptable";
      HttpCodes2[HttpCodes2["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
      HttpCodes2[HttpCodes2["RequestTimeout"] = 408] = "RequestTimeout";
      HttpCodes2[HttpCodes2["Conflict"] = 409] = "Conflict";
      HttpCodes2[HttpCodes2["Gone"] = 410] = "Gone";
      HttpCodes2[HttpCodes2["TooManyRequests"] = 429] = "TooManyRequests";
      HttpCodes2[HttpCodes2["InternalServerError"] = 500] = "InternalServerError";
      HttpCodes2[HttpCodes2["NotImplemented"] = 501] = "NotImplemented";
      HttpCodes2[HttpCodes2["BadGateway"] = 502] = "BadGateway";
      HttpCodes2[HttpCodes2["ServiceUnavailable"] = 503] = "ServiceUnavailable";
      HttpCodes2[HttpCodes2["GatewayTimeout"] = 504] = "GatewayTimeout";
    })(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
    var Headers;
    (function(Headers2) {
      Headers2["Accept"] = "accept";
      Headers2["ContentType"] = "content-type";
    })(Headers = exports.Headers || (exports.Headers = {}));
    var MediaTypes;
    (function(MediaTypes2) {
      MediaTypes2["ApplicationJson"] = "application/json";
    })(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
    function getProxyUrl(serverUrl) {
      const proxyUrl = pm.getProxyUrl(new URL(serverUrl));
      return proxyUrl ? proxyUrl.href : "";
    }
    __name(getProxyUrl, "getProxyUrl");
    exports.getProxyUrl = getProxyUrl;
    var HttpRedirectCodes = [
      HttpCodes.MovedPermanently,
      HttpCodes.ResourceMoved,
      HttpCodes.SeeOther,
      HttpCodes.TemporaryRedirect,
      HttpCodes.PermanentRedirect
    ];
    var HttpResponseRetryCodes = [
      HttpCodes.BadGateway,
      HttpCodes.ServiceUnavailable,
      HttpCodes.GatewayTimeout
    ];
    var RetryableHttpVerbs = ["OPTIONS", "GET", "DELETE", "HEAD"];
    var ExponentialBackoffCeiling = 10;
    var ExponentialBackoffTimeSlice = 5;
    var HttpClientError = class _HttpClientError extends Error {
      static {
        __name(this, "HttpClientError");
      }
      constructor(message, statusCode) {
        super(message);
        this.name = "HttpClientError";
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, _HttpClientError.prototype);
      }
    };
    exports.HttpClientError = HttpClientError;
    var HttpClientResponse = class {
      static {
        __name(this, "HttpClientResponse");
      }
      constructor(message) {
        this.message = message;
      }
      readBody() {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let output = Buffer.alloc(0);
            this.message.on("data", (chunk) => {
              output = Buffer.concat([output, chunk]);
            });
            this.message.on("end", () => {
              resolve(output.toString());
            });
          }));
        });
      }
    };
    exports.HttpClientResponse = HttpClientResponse;
    function isHttps(requestUrl) {
      const parsedUrl = new URL(requestUrl);
      return parsedUrl.protocol === "https:";
    }
    __name(isHttps, "isHttps");
    exports.isHttps = isHttps;
    var HttpClient = class {
      static {
        __name(this, "HttpClient");
      }
      constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
          if (requestOptions.ignoreSslError != null) {
            this._ignoreSslError = requestOptions.ignoreSslError;
          }
          this._socketTimeout = requestOptions.socketTimeout;
          if (requestOptions.allowRedirects != null) {
            this._allowRedirects = requestOptions.allowRedirects;
          }
          if (requestOptions.allowRedirectDowngrade != null) {
            this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
          }
          if (requestOptions.maxRedirects != null) {
            this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
          }
          if (requestOptions.keepAlive != null) {
            this._keepAlive = requestOptions.keepAlive;
          }
          if (requestOptions.allowRetries != null) {
            this._allowRetries = requestOptions.allowRetries;
          }
          if (requestOptions.maxRetries != null) {
            this._maxRetries = requestOptions.maxRetries;
          }
        }
      }
      options(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("OPTIONS", requestUrl, null, additionalHeaders || {});
        });
      }
      get(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("GET", requestUrl, null, additionalHeaders || {});
        });
      }
      del(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("DELETE", requestUrl, null, additionalHeaders || {});
        });
      }
      post(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("POST", requestUrl, data, additionalHeaders || {});
        });
      }
      patch(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("PATCH", requestUrl, data, additionalHeaders || {});
        });
      }
      put(requestUrl, data, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("PUT", requestUrl, data, additionalHeaders || {});
        });
      }
      head(requestUrl, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request("HEAD", requestUrl, null, additionalHeaders || {});
        });
      }
      sendStream(verb, requestUrl, stream, additionalHeaders) {
        return __awaiter(this, void 0, void 0, function* () {
          return this.request(verb, requestUrl, stream, additionalHeaders);
        });
      }
      /**
       * Gets a typed object from an endpoint
       * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
       */
      getJson(requestUrl, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          const res = yield this.get(requestUrl, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      postJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = JSON.stringify(obj, null, 2);
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
          const res = yield this.post(requestUrl, data, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      putJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = JSON.stringify(obj, null, 2);
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
          const res = yield this.put(requestUrl, data, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      patchJson(requestUrl, obj, additionalHeaders = {}) {
        return __awaiter(this, void 0, void 0, function* () {
          const data = JSON.stringify(obj, null, 2);
          additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
          additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
          const res = yield this.patch(requestUrl, data, additionalHeaders);
          return this._processResponse(res, this.requestOptions);
        });
      }
      /**
       * Makes a raw http request.
       * All other methods such as get, post, patch, and request ultimately call this.
       * Prefer get, del, post and patch
       */
      request(verb, requestUrl, data, headers) {
        return __awaiter(this, void 0, void 0, function* () {
          if (this._disposed) {
            throw new Error("Client has already been disposed.");
          }
          const parsedUrl = new URL(requestUrl);
          let info2 = this._prepareRequest(verb, parsedUrl, headers);
          const maxTries = this._allowRetries && RetryableHttpVerbs.includes(verb) ? this._maxRetries + 1 : 1;
          let numTries = 0;
          let response;
          do {
            response = yield this.requestRaw(info2, data);
            if (response && response.message && response.message.statusCode === HttpCodes.Unauthorized) {
              let authenticationHandler;
              for (const handler of this.handlers) {
                if (handler.canHandleAuthentication(response)) {
                  authenticationHandler = handler;
                  break;
                }
              }
              if (authenticationHandler) {
                return authenticationHandler.handleAuthentication(this, info2, data);
              } else {
                return response;
              }
            }
            let redirectsRemaining = this._maxRedirects;
            while (response.message.statusCode && HttpRedirectCodes.includes(response.message.statusCode) && this._allowRedirects && redirectsRemaining > 0) {
              const redirectUrl = response.message.headers["location"];
              if (!redirectUrl) {
                break;
              }
              const parsedRedirectUrl = new URL(redirectUrl);
              if (parsedUrl.protocol === "https:" && parsedUrl.protocol !== parsedRedirectUrl.protocol && !this._allowRedirectDowngrade) {
                throw new Error("Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.");
              }
              yield response.readBody();
              if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                for (const header in headers) {
                  if (header.toLowerCase() === "authorization") {
                    delete headers[header];
                  }
                }
              }
              info2 = this._prepareRequest(verb, parsedRedirectUrl, headers);
              response = yield this.requestRaw(info2, data);
              redirectsRemaining--;
            }
            if (!response.message.statusCode || !HttpResponseRetryCodes.includes(response.message.statusCode)) {
              return response;
            }
            numTries += 1;
            if (numTries < maxTries) {
              yield response.readBody();
              yield this._performExponentialBackoff(numTries);
            }
          } while (numTries < maxTries);
          return response;
        });
      }
      /**
       * Needs to be called if keepAlive is set to true in request options.
       */
      dispose() {
        if (this._agent) {
          this._agent.destroy();
        }
        this._disposed = true;
      }
      /**
       * Raw request.
       * @param info
       * @param data
       */
      requestRaw(info2, data) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => {
            function callbackForResult(err, res) {
              if (err) {
                reject(err);
              } else if (!res) {
                reject(new Error("Unknown error"));
              } else {
                resolve(res);
              }
            }
            __name(callbackForResult, "callbackForResult");
            this.requestRawWithCallback(info2, data, callbackForResult);
          });
        });
      }
      /**
       * Raw request with callback.
       * @param info
       * @param data
       * @param onResult
       */
      requestRawWithCallback(info2, data, onResult) {
        if (typeof data === "string") {
          if (!info2.options.headers) {
            info2.options.headers = {};
          }
          info2.options.headers["Content-Length"] = Buffer.byteLength(data, "utf8");
        }
        let callbackCalled = false;
        function handleResult(err, res) {
          if (!callbackCalled) {
            callbackCalled = true;
            onResult(err, res);
          }
        }
        __name(handleResult, "handleResult");
        const req = info2.httpModule.request(info2.options, (msg) => {
          const res = new HttpClientResponse(msg);
          handleResult(void 0, res);
        });
        let socket;
        req.on("socket", (sock) => {
          socket = sock;
        });
        req.setTimeout(this._socketTimeout || 3 * 6e4, () => {
          if (socket) {
            socket.end();
          }
          handleResult(new Error(`Request timeout: ${info2.options.path}`));
        });
        req.on("error", function(err) {
          handleResult(err);
        });
        if (data && typeof data === "string") {
          req.write(data, "utf8");
        }
        if (data && typeof data !== "string") {
          data.on("close", function() {
            req.end();
          });
          data.pipe(req);
        } else {
          req.end();
        }
      }
      /**
       * Gets an http agent. This function is useful when you need an http agent that handles
       * routing through a proxy server - depending upon the url and proxy environment variables.
       * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
       */
      getAgent(serverUrl) {
        const parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
      }
      _prepareRequest(method, requestUrl, headers) {
        const info2 = {};
        info2.parsedUrl = requestUrl;
        const usingSsl = info2.parsedUrl.protocol === "https:";
        info2.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info2.options = {};
        info2.options.host = info2.parsedUrl.hostname;
        info2.options.port = info2.parsedUrl.port ? parseInt(info2.parsedUrl.port) : defaultPort;
        info2.options.path = (info2.parsedUrl.pathname || "") + (info2.parsedUrl.search || "");
        info2.options.method = method;
        info2.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
          info2.options.headers["user-agent"] = this.userAgent;
        }
        info2.options.agent = this._getAgent(info2.parsedUrl);
        if (this.handlers) {
          for (const handler of this.handlers) {
            handler.prepareRequest(info2.options);
          }
        }
        return info2;
      }
      _mergeHeaders(headers) {
        if (this.requestOptions && this.requestOptions.headers) {
          return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers || {}));
        }
        return lowercaseKeys(headers || {});
      }
      _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
          clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
      }
      _getAgent(parsedUrl) {
        let agent;
        const proxyUrl = pm.getProxyUrl(parsedUrl);
        const useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
          agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
          agent = this._agent;
        }
        if (agent) {
          return agent;
        }
        const usingSsl = parsedUrl.protocol === "https:";
        let maxSockets = 100;
        if (this.requestOptions) {
          maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        if (proxyUrl && proxyUrl.hostname) {
          const agentOptions = {
            maxSockets,
            keepAlive: this._keepAlive,
            proxy: Object.assign(Object.assign({}, (proxyUrl.username || proxyUrl.password) && {
              proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
            }), { host: proxyUrl.hostname, port: proxyUrl.port })
          };
          let tunnelAgent;
          const overHttps = proxyUrl.protocol === "https:";
          if (usingSsl) {
            tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
          } else {
            tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
          }
          agent = tunnelAgent(agentOptions);
          this._proxyAgent = agent;
        }
        if (this._keepAlive && !agent) {
          const options = { keepAlive: this._keepAlive, maxSockets };
          agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
          this._agent = agent;
        }
        if (!agent) {
          agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
          agent.options = Object.assign(agent.options || {}, {
            rejectUnauthorized: false
          });
        }
        return agent;
      }
      _performExponentialBackoff(retryNumber) {
        return __awaiter(this, void 0, void 0, function* () {
          retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
          const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
          return new Promise((resolve) => setTimeout(() => resolve(), ms));
        });
      }
      _processResponse(res, options) {
        return __awaiter(this, void 0, void 0, function* () {
          return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const statusCode = res.message.statusCode || 0;
            const response = {
              statusCode,
              result: null,
              headers: {}
            };
            if (statusCode === HttpCodes.NotFound) {
              resolve(response);
            }
            function dateTimeDeserializer(key, value) {
              if (typeof value === "string") {
                const a = new Date(value);
                if (!isNaN(a.valueOf())) {
                  return a;
                }
              }
              return value;
            }
            __name(dateTimeDeserializer, "dateTimeDeserializer");
            let obj;
            let contents;
            try {
              contents = yield res.readBody();
              if (contents && contents.length > 0) {
                if (options && options.deserializeDates) {
                  obj = JSON.parse(contents, dateTimeDeserializer);
                } else {
                  obj = JSON.parse(contents);
                }
                response.result = obj;
              }
              response.headers = res.message.headers;
            } catch (err) {
            }
            if (statusCode > 299) {
              let msg;
              if (obj && obj.message) {
                msg = obj.message;
              } else if (contents && contents.length > 0) {
                msg = contents;
              } else {
                msg = `Failed request: (${statusCode})`;
              }
              const err = new HttpClientError(msg, statusCode);
              err.result = response.result;
              reject(err);
            } else {
              resolve(response);
            }
          }));
        });
      }
    };
    exports.HttpClient = HttpClient;
    var lowercaseKeys = /* @__PURE__ */ __name((obj) => Object.keys(obj).reduce((c, k) => (c[k.toLowerCase()] = obj[k], c), {}), "lowercaseKeys");
  }
});

// node_modules/.pnpm/@actions+http-client@2.1.0/node_modules/@actions/http-client/lib/auth.js
var require_auth = __commonJS({
  "node_modules/.pnpm/@actions+http-client@2.1.0/node_modules/@actions/http-client/lib/auth.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PersonalAccessTokenCredentialHandler = exports.BearerCredentialHandler = exports.BasicCredentialHandler = void 0;
    var BasicCredentialHandler = class {
      static {
        __name(this, "BasicCredentialHandler");
      }
      constructor(username, password) {
        this.username = username;
        this.password = password;
      }
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports.BasicCredentialHandler = BasicCredentialHandler;
    var BearerCredentialHandler = class {
      static {
        __name(this, "BearerCredentialHandler");
      }
      constructor(token) {
        this.token = token;
      }
      // currently implements pre-authorization
      // TODO: support preAuth = false where it hooks on 401
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Bearer ${this.token}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports.BearerCredentialHandler = BearerCredentialHandler;
    var PersonalAccessTokenCredentialHandler = class {
      static {
        __name(this, "PersonalAccessTokenCredentialHandler");
      }
      constructor(token) {
        this.token = token;
      }
      // currently implements pre-authorization
      // TODO: support preAuth = false where it hooks on 401
      prepareRequest(options) {
        if (!options.headers) {
          throw Error("The request has no headers");
        }
        options.headers["Authorization"] = `Basic ${Buffer.from(`PAT:${this.token}`).toString("base64")}`;
      }
      // This handler cannot handle 401
      canHandleAuthentication() {
        return false;
      }
      handleAuthentication() {
        return __awaiter(this, void 0, void 0, function* () {
          throw new Error("not implemented");
        });
      }
    };
    exports.PersonalAccessTokenCredentialHandler = PersonalAccessTokenCredentialHandler;
  }
});

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
    var process5 = global.process;
    var processOk = /* @__PURE__ */ __name(function(process6) {
      return process6 && typeof process6 === "object" && typeof process6.removeListener === "function" && typeof process6.emit === "function" && typeof process6.reallyExit === "function" && typeof process6.listeners === "function" && typeof process6.kill === "function" && typeof process6.pid === "number" && typeof process6.on === "function";
    }, "processOk");
    if (!processOk(process5)) {
      module.exports = function() {
        return function() {
        };
      };
    } else {
      assert2 = __require("assert");
      signals = require_signals();
      isWin = /^win/i.test(process5.platform);
      EE = __require("events");
      if (typeof EE !== "function") {
        EE = EE.EventEmitter;
      }
      if (process5.__signal_exit_emitter__) {
        emitter = process5.__signal_exit_emitter__;
      } else {
        emitter = process5.__signal_exit_emitter__ = new EE();
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
            process5.removeListener(sig, sigListeners[sig]);
          } catch (er) {
          }
        });
        process5.emit = originalProcessEmit;
        process5.reallyExit = originalProcessReallyExit;
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
          var listeners = process5.listeners(sig);
          if (listeners.length === emitter.count) {
            unload();
            emit("exit", null, sig);
            emit("afterexit", null, sig);
            if (isWin && sig === "SIGHUP") {
              sig = "SIGINT";
            }
            process5.kill(process5.pid, sig);
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
            process5.on(sig, sigListeners[sig]);
            return true;
          } catch (er) {
            return false;
          }
        });
        process5.emit = processEmit;
        process5.reallyExit = processReallyExit;
      }, "load");
      module.exports.load = load;
      originalProcessReallyExit = process5.reallyExit;
      processReallyExit = /* @__PURE__ */ __name(function processReallyExit2(code) {
        if (!processOk(global.process)) {
          return;
        }
        process5.exitCode = code || /* istanbul ignore next */
        0;
        emit("exit", process5.exitCode, null);
        emit("afterexit", process5.exitCode, null);
        originalProcessReallyExit.call(process5, process5.exitCode);
      }, "processReallyExit");
      originalProcessEmit = process5.emit;
      processEmit = /* @__PURE__ */ __name(function processEmit2(ev, arg) {
        if (ev === "exit" && processOk(global.process)) {
          if (arg !== void 0) {
            process5.exitCode = arg;
          }
          var ret = originalProcessEmit.apply(this, arguments);
          emit("exit", process5.exitCode, null);
          emit("afterexit", process5.exitCode, null);
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

// node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/utils.js
var require_utils = __commonJS({
  "node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/utils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toCommandProperties = exports.toCommandValue = void 0;
    function toCommandValue2(input) {
      if (input === null || input === void 0) {
        return "";
      } else if (typeof input === "string" || input instanceof String) {
        return input;
      }
      return JSON.stringify(input);
    }
    __name(toCommandValue2, "toCommandValue");
    exports.toCommandValue = toCommandValue2;
    function toCommandProperties2(annotationProperties) {
      if (!Object.keys(annotationProperties).length) {
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
    }
    __name(toCommandProperties2, "toCommandProperties");
    exports.toCommandProperties = toCommandProperties2;
  }
});

// node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/command.js
var require_command = __commonJS({
  "node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/command.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.issue = exports.issueCommand = void 0;
    var os2 = __importStar(__require("os"));
    var utils_1 = require_utils();
    function issueCommand2(command, properties, message) {
      const cmd = new Command2(command, properties, message);
      process.stdout.write(cmd.toString() + os2.EOL);
    }
    __name(issueCommand2, "issueCommand");
    exports.issueCommand = issueCommand2;
    function issue2(name, message = "") {
      issueCommand2(name, {}, message);
    }
    __name(issue2, "issue");
    exports.issue = issue2;
    var CMD_STRING2 = "::";
    var Command2 = class {
      static {
        __name(this, "Command");
      }
      constructor(command, properties, message) {
        if (!command) {
          command = "missing.command";
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
      }
      toString() {
        let cmdStr = CMD_STRING2 + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
          cmdStr += " ";
          let first = true;
          for (const key in this.properties) {
            if (this.properties.hasOwnProperty(key)) {
              const val = this.properties[key];
              if (val) {
                if (first) {
                  first = false;
                } else {
                  cmdStr += ",";
                }
                cmdStr += `${key}=${escapeProperty2(val)}`;
              }
            }
          }
        }
        cmdStr += `${CMD_STRING2}${escapeData2(this.message)}`;
        return cmdStr;
      }
    };
    function escapeData2(s) {
      return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
    }
    __name(escapeData2, "escapeData");
    function escapeProperty2(s) {
      return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
    }
    __name(escapeProperty2, "escapeProperty");
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/rng.js
import crypto from "crypto";
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var rnds8Pool, poolPtr;
var init_rng = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/rng.js"() {
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
    __name(rng, "rng");
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/validate.js"() {
    init_regex();
    __name(validate, "validate");
    validate_default = validate;
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/stringify.js
function stringify(arr, offset = 0) {
  const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, stringify_default;
var init_stringify = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/stringify.js"() {
    init_validate();
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).substr(1));
    }
    __name(stringify, "stringify");
    stringify_default = stringify;
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/v1.js
function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }
    if (clockseq == null) {
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || stringify_default(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs, v1_default;
var init_v1 = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/v1.js"() {
    init_rng();
    init_stringify();
    _lastMSecs = 0;
    _lastNSecs = 0;
    __name(v1, "v1");
    v1_default = v1;
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default;
var init_parse = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/parse.js"() {
    init_validate();
    __name(parse, "parse");
    parse_default = parse;
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35_default(name, version2, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (namespace.length !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version2;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return stringify_default(bytes);
  }
  __name(generateUUID, "generateUUID");
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL2;
  return generateUUID;
}
var DNS, URL2;
var init_v35 = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/v35.js"() {
    init_stringify();
    init_parse();
    __name(stringToBytes, "stringToBytes");
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
    __name(v35_default, "default");
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/md5.js
import crypto2 from "crypto";
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto2.createHash("md5").update(bytes).digest();
}
var md5_default;
var init_md5 = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/md5.js"() {
    __name(md5, "md5");
    md5_default = md5;
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/v3.js
var v3, v3_default;
var init_v3 = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/v3.js"() {
    init_v35();
    init_md5();
    v3 = v35_default("v3", 48, md5_default);
    v3_default = v3;
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return stringify_default(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/v4.js"() {
    init_rng();
    init_stringify();
    __name(v4, "v4");
    v4_default = v4;
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/sha1.js
import crypto3 from "crypto";
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return crypto3.createHash("sha1").update(bytes).digest();
}
var sha1_default;
var init_sha1 = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/sha1.js"() {
    __name(sha1, "sha1");
    sha1_default = sha1;
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/v5.js"() {
    init_v35();
    init_sha1();
    v5 = v35_default("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/nil.js
var nil_default;
var init_nil = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/nil.js"() {
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.substr(14, 1), 16);
}
var version_default;
var init_version = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/version.js"() {
    init_validate();
    __name(version, "version");
    version_default = version;
  }
});

// node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/index.js
var esm_node_exports = {};
__export(esm_node_exports, {
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_esm_node = __esm({
  "node_modules/.pnpm/uuid@8.3.2/node_modules/uuid/dist/esm-node/index.js"() {
    init_v1();
    init_v3();
    init_v4();
    init_v5();
    init_nil();
    init_version();
    init_validate();
    init_stringify();
    init_parse();
  }
});

// node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/file-command.js
var require_file_command = __commonJS({
  "node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/file-command.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prepareKeyValueMessage = exports.issueFileCommand = void 0;
    var fs = __importStar(__require("fs"));
    var os2 = __importStar(__require("os"));
    var uuid_1 = (init_esm_node(), __toCommonJS(esm_node_exports));
    var utils_1 = require_utils();
    function issueFileCommand2(command, message) {
      const filePath = process.env[`GITHUB_${command}`];
      if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
      }
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
      }
      fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os2.EOL}`, {
        encoding: "utf8"
      });
    }
    __name(issueFileCommand2, "issueFileCommand");
    exports.issueFileCommand = issueFileCommand2;
    function prepareKeyValueMessage2(key, value) {
      const delimiter = `ghadelimiter_${uuid_1.v4()}`;
      const convertedValue = utils_1.toCommandValue(value);
      if (key.includes(delimiter)) {
        throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
      }
      if (convertedValue.includes(delimiter)) {
        throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
      }
      return `${key}<<${delimiter}${os2.EOL}${convertedValue}${os2.EOL}${delimiter}`;
    }
    __name(prepareKeyValueMessage2, "prepareKeyValueMessage");
    exports.prepareKeyValueMessage = prepareKeyValueMessage2;
  }
});

// node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/oidc-utils.js
var require_oidc_utils = __commonJS({
  "node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/oidc-utils.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OidcClient = void 0;
    var http_client_1 = require_lib();
    var auth_1 = require_auth();
    var core_1 = require_core();
    var OidcClient = class _OidcClient {
      static {
        __name(this, "OidcClient");
      }
      static createHttpClient(allowRetry = true, maxRetry = 10) {
        const requestOptions = {
          allowRetries: allowRetry,
          maxRetries: maxRetry
        };
        return new http_client_1.HttpClient("actions/oidc-client", [new auth_1.BearerCredentialHandler(_OidcClient.getRequestToken())], requestOptions);
      }
      static getRequestToken() {
        const token = process.env["ACTIONS_ID_TOKEN_REQUEST_TOKEN"];
        if (!token) {
          throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_TOKEN env variable");
        }
        return token;
      }
      static getIDTokenUrl() {
        const runtimeUrl = process.env["ACTIONS_ID_TOKEN_REQUEST_URL"];
        if (!runtimeUrl) {
          throw new Error("Unable to get ACTIONS_ID_TOKEN_REQUEST_URL env variable");
        }
        return runtimeUrl;
      }
      static getCall(id_token_url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
          const httpclient = _OidcClient.createHttpClient();
          const res = yield httpclient.getJson(id_token_url).catch((error2) => {
            throw new Error(`Failed to get ID Token. 
 
        Error Code : ${error2.statusCode}
 
        Error Message: ${error2.result.message}`);
          });
          const id_token = (_a = res.result) === null || _a === void 0 ? void 0 : _a.value;
          if (!id_token) {
            throw new Error("Response json body do not have ID Token field");
          }
          return id_token;
        });
      }
      static getIDToken(audience) {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            let id_token_url = _OidcClient.getIDTokenUrl();
            if (audience) {
              const encodedAudience = encodeURIComponent(audience);
              id_token_url = `${id_token_url}&audience=${encodedAudience}`;
            }
            core_1.debug(`ID token url is ${id_token_url}`);
            const id_token = yield _OidcClient.getCall(id_token_url);
            core_1.setSecret(id_token);
            return id_token;
          } catch (error2) {
            throw new Error(`Error message: ${error2.message}`);
          }
        });
      }
    };
    exports.OidcClient = OidcClient;
  }
});

// node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/summary.js
var require_summary = __commonJS({
  "node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/summary.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.summary = exports.markdownSummary = exports.SUMMARY_DOCS_URL = exports.SUMMARY_ENV_VAR = void 0;
    var os_1 = __require("os");
    var fs_1 = __require("fs");
    var { access: access2, appendFile: appendFile2, writeFile: writeFile3 } = fs_1.promises;
    exports.SUMMARY_ENV_VAR = "GITHUB_STEP_SUMMARY";
    exports.SUMMARY_DOCS_URL = "https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary";
    var Summary2 = class {
      static {
        __name(this, "Summary");
      }
      constructor() {
        this._buffer = "";
      }
      /**
       * Finds the summary file path from the environment, rejects if env var is not found or file does not exist
       * Also checks r/w permissions.
       *
       * @returns step summary file path
       */
      filePath() {
        return __awaiter(this, void 0, void 0, function* () {
          if (this._filePath) {
            return this._filePath;
          }
          const pathFromEnv = process.env[exports.SUMMARY_ENV_VAR];
          if (!pathFromEnv) {
            throw new Error(`Unable to find environment variable for $${exports.SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`);
          }
          try {
            yield access2(pathFromEnv, fs_1.constants.R_OK | fs_1.constants.W_OK);
          } catch (_a) {
            throw new Error(`Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`);
          }
          this._filePath = pathFromEnv;
          return this._filePath;
        });
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
      wrap(tag, content, attrs = {}) {
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
      write(options) {
        return __awaiter(this, void 0, void 0, function* () {
          const overwrite = !!(options === null || options === void 0 ? void 0 : options.overwrite);
          const filePath = yield this.filePath();
          const writeFunc = overwrite ? writeFile3 : appendFile2;
          yield writeFunc(filePath, this._buffer, { encoding: "utf8" });
          return this.emptyBuffer();
        });
      }
      /**
       * Clears the summary buffer and wipes the summary file
       *
       * @returns {Summary} summary instance
       */
      clear() {
        return __awaiter(this, void 0, void 0, function* () {
          return this.emptyBuffer().write({ overwrite: true });
        });
      }
      /**
       * Returns the current summary buffer as a string
       *
       * @returns {string} string of summary buffer
       */
      stringify() {
        return this._buffer;
      }
      /**
       * If the summary buffer is empty
       *
       * @returns {boolen} true if the buffer is empty
       */
      isEmptyBuffer() {
        return this._buffer.length === 0;
      }
      /**
       * Resets the summary buffer without writing to summary file
       *
       * @returns {Summary} summary instance
       */
      emptyBuffer() {
        this._buffer = "";
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
        this._buffer += text;
        return addEOL ? this.addEOL() : this;
      }
      /**
       * Adds the operating system-specific end-of-line marker to the buffer
       *
       * @returns {Summary} summary instance
       */
      addEOL() {
        return this.addRaw(os_1.EOL);
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
        const attrs = Object.assign({}, lang && { lang });
        const element = this.wrap("pre", this.wrap("code", code), attrs);
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
        const listItems = items.map((item) => this.wrap("li", item)).join("");
        const element = this.wrap(tag, listItems);
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
              return this.wrap("td", cell);
            }
            const { header, data, colspan, rowspan } = cell;
            const tag = header ? "th" : "td";
            const attrs = Object.assign(Object.assign({}, colspan && { colspan }), rowspan && { rowspan });
            return this.wrap(tag, data, attrs);
          }).join("");
          return this.wrap("tr", cells);
        }).join("");
        const element = this.wrap("table", tableBody);
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
        const element = this.wrap("details", this.wrap("summary", label) + content);
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
        const attrs = Object.assign(Object.assign({}, width && { width }), height && { height });
        const element = this.wrap("img", null, Object.assign({ src, alt }, attrs));
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
        const element = this.wrap(allowedTag, text);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML thematic break (<hr>) to the summary buffer
       *
       * @returns {Summary} summary instance
       */
      addSeparator() {
        const element = this.wrap("hr", null);
        return this.addRaw(element).addEOL();
      }
      /**
       * Adds an HTML line break (<br>) to the summary buffer
       *
       * @returns {Summary} summary instance
       */
      addBreak() {
        const element = this.wrap("br", null);
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
        const attrs = Object.assign({}, cite && { cite });
        const element = this.wrap("blockquote", text, attrs);
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
        const element = this.wrap("a", text, { href });
        return this.addRaw(element).addEOL();
      }
    };
    var _summary2 = new Summary2();
    exports.markdownSummary = _summary2;
    exports.summary = _summary2;
  }
});

// node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/path-utils.js
var require_path_utils = __commonJS({
  "node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/path-utils.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toPlatformPath = exports.toWin32Path = exports.toPosixPath = void 0;
    var path3 = __importStar(__require("path"));
    function toPosixPath(pth) {
      return pth.replace(/[\\]/g, "/");
    }
    __name(toPosixPath, "toPosixPath");
    exports.toPosixPath = toPosixPath;
    function toWin32Path(pth) {
      return pth.replace(/[/]/g, "\\");
    }
    __name(toWin32Path, "toWin32Path");
    exports.toWin32Path = toWin32Path;
    function toPlatformPath(pth) {
      return pth.replace(/[/\\]/g, path3.sep);
    }
    __name(toPlatformPath, "toPlatformPath");
    exports.toPlatformPath = toPlatformPath;
  }
});

// node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/core.js
var require_core = __commonJS({
  "node_modules/.pnpm/@actions+core@1.10.0/node_modules/@actions/core/lib/core.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIDToken = exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.notice = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
    var command_1 = require_command();
    var file_command_1 = require_file_command();
    var utils_1 = require_utils();
    var os2 = __importStar(__require("os"));
    var path3 = __importStar(__require("path"));
    var oidc_utils_1 = require_oidc_utils();
    var ExitCode2;
    (function(ExitCode3) {
      ExitCode3[ExitCode3["Success"] = 0] = "Success";
      ExitCode3[ExitCode3["Failure"] = 1] = "Failure";
    })(ExitCode2 = exports.ExitCode || (exports.ExitCode = {}));
    function exportVariable2(name, val) {
      const convertedVal = utils_1.toCommandValue(val);
      process.env[name] = convertedVal;
      const filePath = process.env["GITHUB_ENV"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("ENV", file_command_1.prepareKeyValueMessage(name, val));
      }
      command_1.issueCommand("set-env", { name }, convertedVal);
    }
    __name(exportVariable2, "exportVariable");
    exports.exportVariable = exportVariable2;
    function setSecret2(secret) {
      command_1.issueCommand("add-mask", {}, secret);
    }
    __name(setSecret2, "setSecret");
    exports.setSecret = setSecret2;
    function addPath2(inputPath) {
      const filePath = process.env["GITHUB_PATH"] || "";
      if (filePath) {
        file_command_1.issueFileCommand("PATH", inputPath);
      } else {
        command_1.issueCommand("add-path", {}, inputPath);
      }
      process.env["PATH"] = `${inputPath}${path3.delimiter}${process.env["PATH"]}`;
    }
    __name(addPath2, "addPath");
    exports.addPath = addPath2;
    function getInput3(name, options) {
      const val = process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] || "";
      if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
      }
      if (options && options.trimWhitespace === false) {
        return val;
      }
      return val.trim();
    }
    __name(getInput3, "getInput");
    exports.getInput = getInput3;
    function getMultilineInput2(name, options) {
      const inputs = getInput3(name, options).split("\n").filter((x) => x !== "");
      if (options && options.trimWhitespace === false) {
        return inputs;
      }
      return inputs.map((input) => input.trim());
    }
    __name(getMultilineInput2, "getMultilineInput");
    exports.getMultilineInput = getMultilineInput2;
    function getBooleanInput2(name, options) {
      const trueValue = ["true", "True", "TRUE"];
      const falseValue = ["false", "False", "FALSE"];
      const val = getInput3(name, options);
      if (trueValue.includes(val))
        return true;
      if (falseValue.includes(val))
        return false;
      throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}
Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
    }
    __name(getBooleanInput2, "getBooleanInput");
    exports.getBooleanInput = getBooleanInput2;
    function setOutput2(name, value) {
      const filePath = process.env["GITHUB_OUTPUT"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("OUTPUT", file_command_1.prepareKeyValueMessage(name, value));
      }
      process.stdout.write(os2.EOL);
      command_1.issueCommand("set-output", { name }, utils_1.toCommandValue(value));
    }
    __name(setOutput2, "setOutput");
    exports.setOutput = setOutput2;
    function setCommandEcho2(enabled) {
      command_1.issue("echo", enabled ? "on" : "off");
    }
    __name(setCommandEcho2, "setCommandEcho");
    exports.setCommandEcho = setCommandEcho2;
    function setFailed2(message) {
      process.exitCode = ExitCode2.Failure;
      error2(message);
    }
    __name(setFailed2, "setFailed");
    exports.setFailed = setFailed2;
    function isDebug2() {
      return process.env["RUNNER_DEBUG"] === "1";
    }
    __name(isDebug2, "isDebug");
    exports.isDebug = isDebug2;
    function debug2(message) {
      command_1.issueCommand("debug", {}, message);
    }
    __name(debug2, "debug");
    exports.debug = debug2;
    function error2(message, properties = {}) {
      command_1.issueCommand("error", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    __name(error2, "error");
    exports.error = error2;
    function warning2(message, properties = {}) {
      command_1.issueCommand("warning", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    __name(warning2, "warning");
    exports.warning = warning2;
    function notice2(message, properties = {}) {
      command_1.issueCommand("notice", utils_1.toCommandProperties(properties), message instanceof Error ? message.toString() : message);
    }
    __name(notice2, "notice");
    exports.notice = notice2;
    function info2(message) {
      process.stdout.write(message + os2.EOL);
    }
    __name(info2, "info");
    exports.info = info2;
    function startGroup2(name) {
      command_1.issue("group", name);
    }
    __name(startGroup2, "startGroup");
    exports.startGroup = startGroup2;
    function endGroup2() {
      command_1.issue("endgroup");
    }
    __name(endGroup2, "endGroup");
    exports.endGroup = endGroup2;
    function group2(name, fn) {
      return __awaiter(this, void 0, void 0, function* () {
        startGroup2(name);
        let result;
        try {
          result = yield fn();
        } finally {
          endGroup2();
        }
        return result;
      });
    }
    __name(group2, "group");
    exports.group = group2;
    function saveState(name, value) {
      const filePath = process.env["GITHUB_STATE"] || "";
      if (filePath) {
        return file_command_1.issueFileCommand("STATE", file_command_1.prepareKeyValueMessage(name, value));
      }
      command_1.issueCommand("save-state", { name }, utils_1.toCommandValue(value));
    }
    __name(saveState, "saveState");
    exports.saveState = saveState;
    function getState(name) {
      return process.env[`STATE_${name}`] || "";
    }
    __name(getState, "getState");
    exports.getState = getState;
    function getIDToken(aud) {
      return __awaiter(this, void 0, void 0, function* () {
        return yield oidc_utils_1.OidcClient.getIDToken(aud);
      });
    }
    __name(getIDToken, "getIDToken");
    exports.getIDToken = getIDToken;
    var summary_1 = require_summary();
    Object.defineProperty(exports, "summary", { enumerable: true, get: function() {
      return summary_1.summary;
    } });
    var summary_2 = require_summary();
    Object.defineProperty(exports, "markdownSummary", { enumerable: true, get: function() {
      return summary_2.markdownSummary;
    } });
    var path_utils_1 = require_path_utils();
    Object.defineProperty(exports, "toPosixPath", { enumerable: true, get: function() {
      return path_utils_1.toPosixPath;
    } });
    Object.defineProperty(exports, "toWin32Path", { enumerable: true, get: function() {
      return path_utils_1.toWin32Path;
    } });
    Object.defineProperty(exports, "toPlatformPath", { enumerable: true, get: function() {
      return path_utils_1.toPlatformPath;
    } });
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/path-and-artifact-name-validation.js
var require_path_and_artifact_name_validation = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/path-and-artifact-name-validation.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkArtifactFilePath = exports.checkArtifactName = void 0;
    var core_1 = require_core();
    var invalidArtifactFilePathCharacters = /* @__PURE__ */ new Map([
      ['"', ' Double quote "'],
      [":", " Colon :"],
      ["<", " Less than <"],
      [">", " Greater than >"],
      ["|", " Vertical bar |"],
      ["*", " Asterisk *"],
      ["?", " Question mark ?"],
      ["\r", " Carriage return \\r"],
      ["\n", " Line feed \\n"]
    ]);
    var invalidArtifactNameCharacters = new Map([
      ...invalidArtifactFilePathCharacters,
      ["\\", " Backslash \\"],
      ["/", " Forward slash /"]
    ]);
    function checkArtifactName(name) {
      if (!name) {
        throw new Error(`Artifact name: ${name}, is incorrectly provided`);
      }
      for (const [invalidCharacterKey, errorMessageForCharacter] of invalidArtifactNameCharacters) {
        if (name.includes(invalidCharacterKey)) {
          throw new Error(`Artifact name is not valid: ${name}. Contains the following character: ${errorMessageForCharacter}
          
Invalid characters include: ${Array.from(invalidArtifactNameCharacters.values()).toString()}
          
These characters are not allowed in the artifact name due to limitations with certain file systems such as NTFS. To maintain file system agnostic behavior, these characters are intentionally not allowed to prevent potential problems with downloads on different file systems.`);
        }
      }
      core_1.info(`Artifact name is valid!`);
    }
    __name(checkArtifactName, "checkArtifactName");
    exports.checkArtifactName = checkArtifactName;
    function checkArtifactFilePath(path3) {
      if (!path3) {
        throw new Error(`Artifact path: ${path3}, is incorrectly provided`);
      }
      for (const [invalidCharacterKey, errorMessageForCharacter] of invalidArtifactFilePathCharacters) {
        if (path3.includes(invalidCharacterKey)) {
          throw new Error(`Artifact path is not valid: ${path3}. Contains the following character: ${errorMessageForCharacter}
          
Invalid characters include: ${Array.from(invalidArtifactFilePathCharacters.values()).toString()}
          
The following characters are not allowed in files that are uploaded due to limitations with certain file systems such as NTFS. To maintain file system agnostic behavior, these characters are intentionally not allowed to prevent potential problems with downloads on different file systems.
          `);
        }
      }
    }
    __name(checkArtifactFilePath, "checkArtifactFilePath");
    exports.checkArtifactFilePath = checkArtifactFilePath;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/upload-specification.js
var require_upload_specification = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/upload-specification.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUploadSpecification = void 0;
    var fs = __importStar(__require("fs"));
    var core_1 = require_core();
    var path_1 = __require("path");
    var path_and_artifact_name_validation_1 = require_path_and_artifact_name_validation();
    function getUploadSpecification(artifactName, rootDirectory, artifactFiles) {
      const specifications = [];
      if (!fs.existsSync(rootDirectory)) {
        throw new Error(`Provided rootDirectory ${rootDirectory} does not exist`);
      }
      if (!fs.lstatSync(rootDirectory).isDirectory()) {
        throw new Error(`Provided rootDirectory ${rootDirectory} is not a valid directory`);
      }
      rootDirectory = path_1.normalize(rootDirectory);
      rootDirectory = path_1.resolve(rootDirectory);
      for (let file of artifactFiles) {
        if (!fs.existsSync(file)) {
          throw new Error(`File ${file} does not exist`);
        }
        if (!fs.lstatSync(file).isDirectory()) {
          file = path_1.normalize(file);
          file = path_1.resolve(file);
          if (!file.startsWith(rootDirectory)) {
            throw new Error(`The rootDirectory: ${rootDirectory} is not a parent directory of the file: ${file}`);
          }
          const uploadPath = file.replace(rootDirectory, "");
          path_and_artifact_name_validation_1.checkArtifactFilePath(uploadPath);
          specifications.push({
            absoluteFilePath: file,
            uploadFilePath: path_1.join(artifactName, uploadPath)
          });
        } else {
          core_1.debug(`Removing ${file} from rawSearchResults because it is a directory`);
        }
      }
      return specifications;
    }
    __name(getUploadSpecification, "getUploadSpecification");
    exports.getUploadSpecification = getUploadSpecification;
  }
});

// node_modules/.pnpm/fs.realpath@1.0.0/node_modules/fs.realpath/old.js
var require_old = __commonJS({
  "node_modules/.pnpm/fs.realpath@1.0.0/node_modules/fs.realpath/old.js"(exports) {
    var pathModule = __require("path");
    var isWindows = process.platform === "win32";
    var fs = __require("fs");
    var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
    function rethrow() {
      var callback;
      if (DEBUG) {
        var backtrace = new Error();
        callback = debugCallback;
      } else
        callback = missingCallback;
      return callback;
      function debugCallback(err) {
        if (err) {
          backtrace.message = err.message;
          err = backtrace;
          missingCallback(err);
        }
      }
      __name(debugCallback, "debugCallback");
      function missingCallback(err) {
        if (err) {
          if (process.throwDeprecation)
            throw err;
          else if (!process.noDeprecation) {
            var msg = "fs: missing callback " + (err.stack || err.message);
            if (process.traceDeprecation)
              console.trace(msg);
            else
              console.error(msg);
          }
        }
      }
      __name(missingCallback, "missingCallback");
    }
    __name(rethrow, "rethrow");
    function maybeCallback(cb) {
      return typeof cb === "function" ? cb : rethrow();
    }
    __name(maybeCallback, "maybeCallback");
    var normalize = pathModule.normalize;
    if (isWindows) {
      nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
    } else {
      nextPartRe = /(.*?)(?:[\/]+|$)/g;
    }
    var nextPartRe;
    if (isWindows) {
      splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
    } else {
      splitRootRe = /^[\/]*/;
    }
    var splitRootRe;
    exports.realpathSync = /* @__PURE__ */ __name(function realpathSync(p, cache) {
      p = pathModule.resolve(p);
      if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
        return cache[p];
      }
      var original = p, seenLinks = {}, knownHard = {};
      var pos;
      var current;
      var base;
      var previous;
      start();
      function start() {
        var m = splitRootRe.exec(p);
        pos = m[0].length;
        current = m[0];
        base = m[0];
        previous = "";
        if (isWindows && !knownHard[base]) {
          fs.lstatSync(base);
          knownHard[base] = true;
        }
      }
      __name(start, "start");
      while (pos < p.length) {
        nextPartRe.lastIndex = pos;
        var result = nextPartRe.exec(p);
        previous = current;
        current += result[0];
        base = previous + result[1];
        pos = nextPartRe.lastIndex;
        if (knownHard[base] || cache && cache[base] === base) {
          continue;
        }
        var resolvedLink;
        if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
          resolvedLink = cache[base];
        } else {
          var stat = fs.lstatSync(base);
          if (!stat.isSymbolicLink()) {
            knownHard[base] = true;
            if (cache)
              cache[base] = base;
            continue;
          }
          var linkTarget = null;
          if (!isWindows) {
            var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
            if (seenLinks.hasOwnProperty(id)) {
              linkTarget = seenLinks[id];
            }
          }
          if (linkTarget === null) {
            fs.statSync(base);
            linkTarget = fs.readlinkSync(base);
          }
          resolvedLink = pathModule.resolve(previous, linkTarget);
          if (cache)
            cache[base] = resolvedLink;
          if (!isWindows)
            seenLinks[id] = linkTarget;
        }
        p = pathModule.resolve(resolvedLink, p.slice(pos));
        start();
      }
      if (cache)
        cache[original] = p;
      return p;
    }, "realpathSync");
    exports.realpath = /* @__PURE__ */ __name(function realpath(p, cache, cb) {
      if (typeof cb !== "function") {
        cb = maybeCallback(cache);
        cache = null;
      }
      p = pathModule.resolve(p);
      if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
        return process.nextTick(cb.bind(null, null, cache[p]));
      }
      var original = p, seenLinks = {}, knownHard = {};
      var pos;
      var current;
      var base;
      var previous;
      start();
      function start() {
        var m = splitRootRe.exec(p);
        pos = m[0].length;
        current = m[0];
        base = m[0];
        previous = "";
        if (isWindows && !knownHard[base]) {
          fs.lstat(base, function(err) {
            if (err)
              return cb(err);
            knownHard[base] = true;
            LOOP();
          });
        } else {
          process.nextTick(LOOP);
        }
      }
      __name(start, "start");
      function LOOP() {
        if (pos >= p.length) {
          if (cache)
            cache[original] = p;
          return cb(null, p);
        }
        nextPartRe.lastIndex = pos;
        var result = nextPartRe.exec(p);
        previous = current;
        current += result[0];
        base = previous + result[1];
        pos = nextPartRe.lastIndex;
        if (knownHard[base] || cache && cache[base] === base) {
          return process.nextTick(LOOP);
        }
        if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
          return gotResolvedLink(cache[base]);
        }
        return fs.lstat(base, gotStat);
      }
      __name(LOOP, "LOOP");
      function gotStat(err, stat) {
        if (err)
          return cb(err);
        if (!stat.isSymbolicLink()) {
          knownHard[base] = true;
          if (cache)
            cache[base] = base;
          return process.nextTick(LOOP);
        }
        if (!isWindows) {
          var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
          if (seenLinks.hasOwnProperty(id)) {
            return gotTarget(null, seenLinks[id], base);
          }
        }
        fs.stat(base, function(err2) {
          if (err2)
            return cb(err2);
          fs.readlink(base, function(err3, target) {
            if (!isWindows)
              seenLinks[id] = target;
            gotTarget(err3, target);
          });
        });
      }
      __name(gotStat, "gotStat");
      function gotTarget(err, target, base2) {
        if (err)
          return cb(err);
        var resolvedLink = pathModule.resolve(previous, target);
        if (cache)
          cache[base2] = resolvedLink;
        gotResolvedLink(resolvedLink);
      }
      __name(gotTarget, "gotTarget");
      function gotResolvedLink(resolvedLink) {
        p = pathModule.resolve(resolvedLink, p.slice(pos));
        start();
      }
      __name(gotResolvedLink, "gotResolvedLink");
    }, "realpath");
  }
});

// node_modules/.pnpm/fs.realpath@1.0.0/node_modules/fs.realpath/index.js
var require_fs = __commonJS({
  "node_modules/.pnpm/fs.realpath@1.0.0/node_modules/fs.realpath/index.js"(exports, module) {
    module.exports = realpath;
    realpath.realpath = realpath;
    realpath.sync = realpathSync;
    realpath.realpathSync = realpathSync;
    realpath.monkeypatch = monkeypatch;
    realpath.unmonkeypatch = unmonkeypatch;
    var fs = __require("fs");
    var origRealpath = fs.realpath;
    var origRealpathSync = fs.realpathSync;
    var version2 = process.version;
    var ok = /^v[0-5]\./.test(version2);
    var old = require_old();
    function newError(er) {
      return er && er.syscall === "realpath" && (er.code === "ELOOP" || er.code === "ENOMEM" || er.code === "ENAMETOOLONG");
    }
    __name(newError, "newError");
    function realpath(p, cache, cb) {
      if (ok) {
        return origRealpath(p, cache, cb);
      }
      if (typeof cache === "function") {
        cb = cache;
        cache = null;
      }
      origRealpath(p, cache, function(er, result) {
        if (newError(er)) {
          old.realpath(p, cache, cb);
        } else {
          cb(er, result);
        }
      });
    }
    __name(realpath, "realpath");
    function realpathSync(p, cache) {
      if (ok) {
        return origRealpathSync(p, cache);
      }
      try {
        return origRealpathSync(p, cache);
      } catch (er) {
        if (newError(er)) {
          return old.realpathSync(p, cache);
        } else {
          throw er;
        }
      }
    }
    __name(realpathSync, "realpathSync");
    function monkeypatch() {
      fs.realpath = realpath;
      fs.realpathSync = realpathSync;
    }
    __name(monkeypatch, "monkeypatch");
    function unmonkeypatch() {
      fs.realpath = origRealpath;
      fs.realpathSync = origRealpathSync;
    }
    __name(unmonkeypatch, "unmonkeypatch");
  }
});

// node_modules/.pnpm/concat-map@0.0.1/node_modules/concat-map/index.js
var require_concat_map = __commonJS({
  "node_modules/.pnpm/concat-map@0.0.1/node_modules/concat-map/index.js"(exports, module) {
    module.exports = function(xs, fn) {
      var res = [];
      for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x))
          res.push.apply(res, x);
        else
          res.push(x);
      }
      return res;
    };
    var isArray = Array.isArray || function(xs) {
      return Object.prototype.toString.call(xs) === "[object Array]";
    };
  }
});

// node_modules/.pnpm/balanced-match@1.0.2/node_modules/balanced-match/index.js
var require_balanced_match = __commonJS({
  "node_modules/.pnpm/balanced-match@1.0.2/node_modules/balanced-match/index.js"(exports, module) {
    "use strict";
    module.exports = balanced;
    function balanced(a, b, str) {
      if (a instanceof RegExp)
        a = maybeMatch(a, str);
      if (b instanceof RegExp)
        b = maybeMatch(b, str);
      var r = range(a, b, str);
      return r && {
        start: r[0],
        end: r[1],
        pre: str.slice(0, r[0]),
        body: str.slice(r[0] + a.length, r[1]),
        post: str.slice(r[1] + b.length)
      };
    }
    __name(balanced, "balanced");
    function maybeMatch(reg, str) {
      var m = str.match(reg);
      return m ? m[0] : null;
    }
    __name(maybeMatch, "maybeMatch");
    balanced.range = range;
    function range(a, b, str) {
      var begs, beg, left, right, result;
      var ai = str.indexOf(a);
      var bi = str.indexOf(b, ai + 1);
      var i = ai;
      if (ai >= 0 && bi > 0) {
        if (a === b) {
          return [ai, bi];
        }
        begs = [];
        left = str.length;
        while (i >= 0 && !result) {
          if (i == ai) {
            begs.push(i);
            ai = str.indexOf(a, i + 1);
          } else if (begs.length == 1) {
            result = [begs.pop(), bi];
          } else {
            beg = begs.pop();
            if (beg < left) {
              left = beg;
              right = bi;
            }
            bi = str.indexOf(b, i + 1);
          }
          i = ai < bi && ai >= 0 ? ai : bi;
        }
        if (begs.length) {
          result = [left, right];
        }
      }
      return result;
    }
    __name(range, "range");
  }
});

// node_modules/.pnpm/brace-expansion@1.1.11/node_modules/brace-expansion/index.js
var require_brace_expansion = __commonJS({
  "node_modules/.pnpm/brace-expansion@1.1.11/node_modules/brace-expansion/index.js"(exports, module) {
    var concatMap = require_concat_map();
    var balanced = require_balanced_match();
    module.exports = expandTop;
    var escSlash = "\0SLASH" + Math.random() + "\0";
    var escOpen = "\0OPEN" + Math.random() + "\0";
    var escClose = "\0CLOSE" + Math.random() + "\0";
    var escComma = "\0COMMA" + Math.random() + "\0";
    var escPeriod = "\0PERIOD" + Math.random() + "\0";
    function numeric(str) {
      return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
    }
    __name(numeric, "numeric");
    function escapeBraces(str) {
      return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
    }
    __name(escapeBraces, "escapeBraces");
    function unescapeBraces(str) {
      return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
    }
    __name(unescapeBraces, "unescapeBraces");
    function parseCommaParts(str) {
      if (!str)
        return [""];
      var parts = [];
      var m = balanced("{", "}", str);
      if (!m)
        return str.split(",");
      var pre = m.pre;
      var body = m.body;
      var post = m.post;
      var p = pre.split(",");
      p[p.length - 1] += "{" + body + "}";
      var postParts = parseCommaParts(post);
      if (post.length) {
        p[p.length - 1] += postParts.shift();
        p.push.apply(p, postParts);
      }
      parts.push.apply(parts, p);
      return parts;
    }
    __name(parseCommaParts, "parseCommaParts");
    function expandTop(str) {
      if (!str)
        return [];
      if (str.substr(0, 2) === "{}") {
        str = "\\{\\}" + str.substr(2);
      }
      return expand(escapeBraces(str), true).map(unescapeBraces);
    }
    __name(expandTop, "expandTop");
    function embrace(str) {
      return "{" + str + "}";
    }
    __name(embrace, "embrace");
    function isPadded(el) {
      return /^-?0\d/.test(el);
    }
    __name(isPadded, "isPadded");
    function lte(i, y) {
      return i <= y;
    }
    __name(lte, "lte");
    function gte(i, y) {
      return i >= y;
    }
    __name(gte, "gte");
    function expand(str, isTop) {
      var expansions = [];
      var m = balanced("{", "}", str);
      if (!m || /\$$/.test(m.pre))
        return [str];
      var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
      var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
      var isSequence = isNumericSequence || isAlphaSequence;
      var isOptions = m.body.indexOf(",") >= 0;
      if (!isSequence && !isOptions) {
        if (m.post.match(/,.*\}/)) {
          str = m.pre + "{" + m.body + escClose + m.post;
          return expand(str);
        }
        return [str];
      }
      var n;
      if (isSequence) {
        n = m.body.split(/\.\./);
      } else {
        n = parseCommaParts(m.body);
        if (n.length === 1) {
          n = expand(n[0], false).map(embrace);
          if (n.length === 1) {
            var post = m.post.length ? expand(m.post, false) : [""];
            return post.map(function(p) {
              return m.pre + n[0] + p;
            });
          }
        }
      }
      var pre = m.pre;
      var post = m.post.length ? expand(m.post, false) : [""];
      var N;
      if (isSequence) {
        var x = numeric(n[0]);
        var y = numeric(n[1]);
        var width = Math.max(n[0].length, n[1].length);
        var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
        var test = lte;
        var reverse = y < x;
        if (reverse) {
          incr *= -1;
          test = gte;
        }
        var pad = n.some(isPadded);
        N = [];
        for (var i = x; test(i, y); i += incr) {
          var c;
          if (isAlphaSequence) {
            c = String.fromCharCode(i);
            if (c === "\\")
              c = "";
          } else {
            c = String(i);
            if (pad) {
              var need = width - c.length;
              if (need > 0) {
                var z = new Array(need + 1).join("0");
                if (i < 0)
                  c = "-" + z + c.slice(1);
                else
                  c = z + c;
              }
            }
          }
          N.push(c);
        }
      } else {
        N = concatMap(n, function(el) {
          return expand(el, false);
        });
      }
      for (var j = 0; j < N.length; j++) {
        for (var k = 0; k < post.length; k++) {
          var expansion = pre + N[j] + post[k];
          if (!isTop || isSequence || expansion)
            expansions.push(expansion);
        }
      }
      return expansions;
    }
    __name(expand, "expand");
  }
});

// node_modules/.pnpm/minimatch@3.1.2/node_modules/minimatch/minimatch.js
var require_minimatch = __commonJS({
  "node_modules/.pnpm/minimatch@3.1.2/node_modules/minimatch/minimatch.js"(exports, module) {
    module.exports = minimatch;
    minimatch.Minimatch = Minimatch;
    var path3 = function() {
      try {
        return __require("path");
      } catch (e) {
      }
    }() || {
      sep: "/"
    };
    minimatch.sep = path3.sep;
    var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};
    var expand = require_brace_expansion();
    var plTypes = {
      "!": { open: "(?:(?!(?:", close: "))[^/]*?)" },
      "?": { open: "(?:", close: ")?" },
      "+": { open: "(?:", close: ")+" },
      "*": { open: "(?:", close: ")*" },
      "@": { open: "(?:", close: ")" }
    };
    var qmark = "[^/]";
    var star = qmark + "*?";
    var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
    var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
    var reSpecials = charSet("().*{}+?[]^$\\!");
    function charSet(s) {
      return s.split("").reduce(function(set, c) {
        set[c] = true;
        return set;
      }, {});
    }
    __name(charSet, "charSet");
    var slashSplit = /\/+/;
    minimatch.filter = filter;
    function filter(pattern, options) {
      options = options || {};
      return function(p, i, list) {
        return minimatch(p, pattern, options);
      };
    }
    __name(filter, "filter");
    function ext(a, b) {
      b = b || {};
      var t = {};
      Object.keys(a).forEach(function(k) {
        t[k] = a[k];
      });
      Object.keys(b).forEach(function(k) {
        t[k] = b[k];
      });
      return t;
    }
    __name(ext, "ext");
    minimatch.defaults = function(def) {
      if (!def || typeof def !== "object" || !Object.keys(def).length) {
        return minimatch;
      }
      var orig = minimatch;
      var m = /* @__PURE__ */ __name(function minimatch2(p, pattern, options) {
        return orig(p, pattern, ext(def, options));
      }, "minimatch");
      m.Minimatch = /* @__PURE__ */ __name(function Minimatch2(pattern, options) {
        return new orig.Minimatch(pattern, ext(def, options));
      }, "Minimatch");
      m.Minimatch.defaults = /* @__PURE__ */ __name(function defaults(options) {
        return orig.defaults(ext(def, options)).Minimatch;
      }, "defaults");
      m.filter = /* @__PURE__ */ __name(function filter2(pattern, options) {
        return orig.filter(pattern, ext(def, options));
      }, "filter");
      m.defaults = /* @__PURE__ */ __name(function defaults(options) {
        return orig.defaults(ext(def, options));
      }, "defaults");
      m.makeRe = /* @__PURE__ */ __name(function makeRe2(pattern, options) {
        return orig.makeRe(pattern, ext(def, options));
      }, "makeRe");
      m.braceExpand = /* @__PURE__ */ __name(function braceExpand2(pattern, options) {
        return orig.braceExpand(pattern, ext(def, options));
      }, "braceExpand");
      m.match = function(list, pattern, options) {
        return orig.match(list, pattern, ext(def, options));
      };
      return m;
    };
    Minimatch.defaults = function(def) {
      return minimatch.defaults(def).Minimatch;
    };
    function minimatch(p, pattern, options) {
      assertValidPattern(pattern);
      if (!options)
        options = {};
      if (!options.nocomment && pattern.charAt(0) === "#") {
        return false;
      }
      return new Minimatch(pattern, options).match(p);
    }
    __name(minimatch, "minimatch");
    function Minimatch(pattern, options) {
      if (!(this instanceof Minimatch)) {
        return new Minimatch(pattern, options);
      }
      assertValidPattern(pattern);
      if (!options)
        options = {};
      pattern = pattern.trim();
      if (!options.allowWindowsEscape && path3.sep !== "/") {
        pattern = pattern.split(path3.sep).join("/");
      }
      this.options = options;
      this.set = [];
      this.pattern = pattern;
      this.regexp = null;
      this.negate = false;
      this.comment = false;
      this.empty = false;
      this.partial = !!options.partial;
      this.make();
    }
    __name(Minimatch, "Minimatch");
    Minimatch.prototype.debug = function() {
    };
    Minimatch.prototype.make = make;
    function make() {
      var pattern = this.pattern;
      var options = this.options;
      if (!options.nocomment && pattern.charAt(0) === "#") {
        this.comment = true;
        return;
      }
      if (!pattern) {
        this.empty = true;
        return;
      }
      this.parseNegate();
      var set = this.globSet = this.braceExpand();
      if (options.debug)
        this.debug = /* @__PURE__ */ __name(function debug2() {
          console.error.apply(console, arguments);
        }, "debug");
      this.debug(this.pattern, set);
      set = this.globParts = set.map(function(s) {
        return s.split(slashSplit);
      });
      this.debug(this.pattern, set);
      set = set.map(function(s, si, set2) {
        return s.map(this.parse, this);
      }, this);
      this.debug(this.pattern, set);
      set = set.filter(function(s) {
        return s.indexOf(false) === -1;
      });
      this.debug(this.pattern, set);
      this.set = set;
    }
    __name(make, "make");
    Minimatch.prototype.parseNegate = parseNegate;
    function parseNegate() {
      var pattern = this.pattern;
      var negate = false;
      var options = this.options;
      var negateOffset = 0;
      if (options.nonegate)
        return;
      for (var i = 0, l = pattern.length; i < l && pattern.charAt(i) === "!"; i++) {
        negate = !negate;
        negateOffset++;
      }
      if (negateOffset)
        this.pattern = pattern.substr(negateOffset);
      this.negate = negate;
    }
    __name(parseNegate, "parseNegate");
    minimatch.braceExpand = function(pattern, options) {
      return braceExpand(pattern, options);
    };
    Minimatch.prototype.braceExpand = braceExpand;
    function braceExpand(pattern, options) {
      if (!options) {
        if (this instanceof Minimatch) {
          options = this.options;
        } else {
          options = {};
        }
      }
      pattern = typeof pattern === "undefined" ? this.pattern : pattern;
      assertValidPattern(pattern);
      if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
        return [pattern];
      }
      return expand(pattern);
    }
    __name(braceExpand, "braceExpand");
    var MAX_PATTERN_LENGTH = 1024 * 64;
    var assertValidPattern = /* @__PURE__ */ __name(function(pattern) {
      if (typeof pattern !== "string") {
        throw new TypeError("invalid pattern");
      }
      if (pattern.length > MAX_PATTERN_LENGTH) {
        throw new TypeError("pattern is too long");
      }
    }, "assertValidPattern");
    Minimatch.prototype.parse = parse2;
    var SUBPARSE = {};
    function parse2(pattern, isSub) {
      assertValidPattern(pattern);
      var options = this.options;
      if (pattern === "**") {
        if (!options.noglobstar)
          return GLOBSTAR;
        else
          pattern = "*";
      }
      if (pattern === "")
        return "";
      var re = "";
      var hasMagic = !!options.nocase;
      var escaping = false;
      var patternListStack = [];
      var negativeLists = [];
      var stateChar;
      var inClass = false;
      var reClassStart = -1;
      var classStart = -1;
      var patternStart = pattern.charAt(0) === "." ? "" : options.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
      var self = this;
      function clearStateChar() {
        if (stateChar) {
          switch (stateChar) {
            case "*":
              re += star;
              hasMagic = true;
              break;
            case "?":
              re += qmark;
              hasMagic = true;
              break;
            default:
              re += "\\" + stateChar;
              break;
          }
          self.debug("clearStateChar %j %j", stateChar, re);
          stateChar = false;
        }
      }
      __name(clearStateChar, "clearStateChar");
      for (var i = 0, len = pattern.length, c; i < len && (c = pattern.charAt(i)); i++) {
        this.debug("%s	%s %s %j", pattern, i, re, c);
        if (escaping && reSpecials[c]) {
          re += "\\" + c;
          escaping = false;
          continue;
        }
        switch (c) {
          case "/": {
            return false;
          }
          case "\\":
            clearStateChar();
            escaping = true;
            continue;
          case "?":
          case "*":
          case "+":
          case "@":
          case "!":
            this.debug("%s	%s %s %j <-- stateChar", pattern, i, re, c);
            if (inClass) {
              this.debug("  in class");
              if (c === "!" && i === classStart + 1)
                c = "^";
              re += c;
              continue;
            }
            self.debug("call clearStateChar %j", stateChar);
            clearStateChar();
            stateChar = c;
            if (options.noext)
              clearStateChar();
            continue;
          case "(":
            if (inClass) {
              re += "(";
              continue;
            }
            if (!stateChar) {
              re += "\\(";
              continue;
            }
            patternListStack.push({
              type: stateChar,
              start: i - 1,
              reStart: re.length,
              open: plTypes[stateChar].open,
              close: plTypes[stateChar].close
            });
            re += stateChar === "!" ? "(?:(?!(?:" : "(?:";
            this.debug("plType %j %j", stateChar, re);
            stateChar = false;
            continue;
          case ")":
            if (inClass || !patternListStack.length) {
              re += "\\)";
              continue;
            }
            clearStateChar();
            hasMagic = true;
            var pl = patternListStack.pop();
            re += pl.close;
            if (pl.type === "!") {
              negativeLists.push(pl);
            }
            pl.reEnd = re.length;
            continue;
          case "|":
            if (inClass || !patternListStack.length || escaping) {
              re += "\\|";
              escaping = false;
              continue;
            }
            clearStateChar();
            re += "|";
            continue;
          case "[":
            clearStateChar();
            if (inClass) {
              re += "\\" + c;
              continue;
            }
            inClass = true;
            classStart = i;
            reClassStart = re.length;
            re += c;
            continue;
          case "]":
            if (i === classStart + 1 || !inClass) {
              re += "\\" + c;
              escaping = false;
              continue;
            }
            var cs = pattern.substring(classStart + 1, i);
            try {
              RegExp("[" + cs + "]");
            } catch (er) {
              var sp = this.parse(cs, SUBPARSE);
              re = re.substr(0, reClassStart) + "\\[" + sp[0] + "\\]";
              hasMagic = hasMagic || sp[1];
              inClass = false;
              continue;
            }
            hasMagic = true;
            inClass = false;
            re += c;
            continue;
          default:
            clearStateChar();
            if (escaping) {
              escaping = false;
            } else if (reSpecials[c] && !(c === "^" && inClass)) {
              re += "\\";
            }
            re += c;
        }
      }
      if (inClass) {
        cs = pattern.substr(classStart + 1);
        sp = this.parse(cs, SUBPARSE);
        re = re.substr(0, reClassStart) + "\\[" + sp[0];
        hasMagic = hasMagic || sp[1];
      }
      for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
        var tail = re.slice(pl.reStart + pl.open.length);
        this.debug("setting tail", re, pl);
        tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function(_, $1, $2) {
          if (!$2) {
            $2 = "\\";
          }
          return $1 + $1 + $2 + "|";
        });
        this.debug("tail=%j\n   %s", tail, tail, pl, re);
        var t = pl.type === "*" ? star : pl.type === "?" ? qmark : "\\" + pl.type;
        hasMagic = true;
        re = re.slice(0, pl.reStart) + t + "\\(" + tail;
      }
      clearStateChar();
      if (escaping) {
        re += "\\\\";
      }
      var addPatternStart = false;
      switch (re.charAt(0)) {
        case "[":
        case ".":
        case "(":
          addPatternStart = true;
      }
      for (var n = negativeLists.length - 1; n > -1; n--) {
        var nl = negativeLists[n];
        var nlBefore = re.slice(0, nl.reStart);
        var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
        var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
        var nlAfter = re.slice(nl.reEnd);
        nlLast += nlAfter;
        var openParensBefore = nlBefore.split("(").length - 1;
        var cleanAfter = nlAfter;
        for (i = 0; i < openParensBefore; i++) {
          cleanAfter = cleanAfter.replace(/\)[+*?]?/, "");
        }
        nlAfter = cleanAfter;
        var dollar = "";
        if (nlAfter === "" && isSub !== SUBPARSE) {
          dollar = "$";
        }
        var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
        re = newRe;
      }
      if (re !== "" && hasMagic) {
        re = "(?=.)" + re;
      }
      if (addPatternStart) {
        re = patternStart + re;
      }
      if (isSub === SUBPARSE) {
        return [re, hasMagic];
      }
      if (!hasMagic) {
        return globUnescape(pattern);
      }
      var flags = options.nocase ? "i" : "";
      try {
        var regExp = new RegExp("^" + re + "$", flags);
      } catch (er) {
        return new RegExp("$.");
      }
      regExp._glob = pattern;
      regExp._src = re;
      return regExp;
    }
    __name(parse2, "parse");
    minimatch.makeRe = function(pattern, options) {
      return new Minimatch(pattern, options || {}).makeRe();
    };
    Minimatch.prototype.makeRe = makeRe;
    function makeRe() {
      if (this.regexp || this.regexp === false)
        return this.regexp;
      var set = this.set;
      if (!set.length) {
        this.regexp = false;
        return this.regexp;
      }
      var options = this.options;
      var twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
      var flags = options.nocase ? "i" : "";
      var re = set.map(function(pattern) {
        return pattern.map(function(p) {
          return p === GLOBSTAR ? twoStar : typeof p === "string" ? regExpEscape(p) : p._src;
        }).join("\\/");
      }).join("|");
      re = "^(?:" + re + ")$";
      if (this.negate)
        re = "^(?!" + re + ").*$";
      try {
        this.regexp = new RegExp(re, flags);
      } catch (ex) {
        this.regexp = false;
      }
      return this.regexp;
    }
    __name(makeRe, "makeRe");
    minimatch.match = function(list, pattern, options) {
      options = options || {};
      var mm = new Minimatch(pattern, options);
      list = list.filter(function(f) {
        return mm.match(f);
      });
      if (mm.options.nonull && !list.length) {
        list.push(pattern);
      }
      return list;
    };
    Minimatch.prototype.match = /* @__PURE__ */ __name(function match(f, partial) {
      if (typeof partial === "undefined")
        partial = this.partial;
      this.debug("match", f, this.pattern);
      if (this.comment)
        return false;
      if (this.empty)
        return f === "";
      if (f === "/" && partial)
        return true;
      var options = this.options;
      if (path3.sep !== "/") {
        f = f.split(path3.sep).join("/");
      }
      f = f.split(slashSplit);
      this.debug(this.pattern, "split", f);
      var set = this.set;
      this.debug(this.pattern, "set", set);
      var filename;
      var i;
      for (i = f.length - 1; i >= 0; i--) {
        filename = f[i];
        if (filename)
          break;
      }
      for (i = 0; i < set.length; i++) {
        var pattern = set[i];
        var file = f;
        if (options.matchBase && pattern.length === 1) {
          file = [filename];
        }
        var hit = this.matchOne(file, pattern, partial);
        if (hit) {
          if (options.flipNegate)
            return true;
          return !this.negate;
        }
      }
      if (options.flipNegate)
        return false;
      return this.negate;
    }, "match");
    Minimatch.prototype.matchOne = function(file, pattern, partial) {
      var options = this.options;
      this.debug(
        "matchOne",
        { "this": this, file, pattern }
      );
      this.debug("matchOne", file.length, pattern.length);
      for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
        this.debug("matchOne loop");
        var p = pattern[pi];
        var f = file[fi];
        this.debug(pattern, p, f);
        if (p === false)
          return false;
        if (p === GLOBSTAR) {
          this.debug("GLOBSTAR", [pattern, p, f]);
          var fr = fi;
          var pr = pi + 1;
          if (pr === pl) {
            this.debug("** at the end");
            for (; fi < fl; fi++) {
              if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".")
                return false;
            }
            return true;
          }
          while (fr < fl) {
            var swallowee = file[fr];
            this.debug("\nglobstar while", file, fr, pattern, pr, swallowee);
            if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
              this.debug("globstar found match!", fr, fl, swallowee);
              return true;
            } else {
              if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
                this.debug("dot detected!", file, fr, pattern, pr);
                break;
              }
              this.debug("globstar swallow a segment, and continue");
              fr++;
            }
          }
          if (partial) {
            this.debug("\n>>> no match, partial?", file, fr, pattern, pr);
            if (fr === fl)
              return true;
          }
          return false;
        }
        var hit;
        if (typeof p === "string") {
          hit = f === p;
          this.debug("string match", p, f, hit);
        } else {
          hit = f.match(p);
          this.debug("pattern match", p, f, hit);
        }
        if (!hit)
          return false;
      }
      if (fi === fl && pi === pl) {
        return true;
      } else if (fi === fl) {
        return partial;
      } else if (pi === pl) {
        return fi === fl - 1 && file[fi] === "";
      }
      throw new Error("wtf?");
    };
    function globUnescape(s) {
      return s.replace(/\\(.)/g, "$1");
    }
    __name(globUnescape, "globUnescape");
    function regExpEscape(s) {
      return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }
    __name(regExpEscape, "regExpEscape");
  }
});

// node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits_browser.js"(exports, module) {
    if (typeof Object.create === "function") {
      module.exports = /* @__PURE__ */ __name(function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      }, "inherits");
    } else {
      module.exports = /* @__PURE__ */ __name(function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = /* @__PURE__ */ __name(function() {
          }, "TempCtor");
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      }, "inherits");
    }
  }
});

// node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "node_modules/.pnpm/inherits@2.0.4/node_modules/inherits/inherits.js"(exports, module) {
    try {
      util = __require("util");
      if (typeof util.inherits !== "function")
        throw "";
      module.exports = util.inherits;
    } catch (e) {
      module.exports = require_inherits_browser();
    }
    var util;
  }
});

// node_modules/.pnpm/path-is-absolute@1.0.1/node_modules/path-is-absolute/index.js
var require_path_is_absolute = __commonJS({
  "node_modules/.pnpm/path-is-absolute@1.0.1/node_modules/path-is-absolute/index.js"(exports, module) {
    "use strict";
    function posix(path3) {
      return path3.charAt(0) === "/";
    }
    __name(posix, "posix");
    function win32(path3) {
      var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
      var result = splitDeviceRe.exec(path3);
      var device = result[1] || "";
      var isUnc = Boolean(device && device.charAt(1) !== ":");
      return Boolean(result[2] || isUnc);
    }
    __name(win32, "win32");
    module.exports = process.platform === "win32" ? win32 : posix;
    module.exports.posix = posix;
    module.exports.win32 = win32;
  }
});

// node_modules/.pnpm/glob@7.2.3/node_modules/glob/common.js
var require_common = __commonJS({
  "node_modules/.pnpm/glob@7.2.3/node_modules/glob/common.js"(exports) {
    exports.setopts = setopts;
    exports.ownProp = ownProp;
    exports.makeAbs = makeAbs;
    exports.finish = finish;
    exports.mark = mark;
    exports.isIgnored = isIgnored;
    exports.childrenIgnored = childrenIgnored;
    function ownProp(obj, field) {
      return Object.prototype.hasOwnProperty.call(obj, field);
    }
    __name(ownProp, "ownProp");
    var fs = __require("fs");
    var path3 = __require("path");
    var minimatch = require_minimatch();
    var isAbsolute = require_path_is_absolute();
    var Minimatch = minimatch.Minimatch;
    function alphasort(a, b) {
      return a.localeCompare(b, "en");
    }
    __name(alphasort, "alphasort");
    function setupIgnores(self, options) {
      self.ignore = options.ignore || [];
      if (!Array.isArray(self.ignore))
        self.ignore = [self.ignore];
      if (self.ignore.length) {
        self.ignore = self.ignore.map(ignoreMap);
      }
    }
    __name(setupIgnores, "setupIgnores");
    function ignoreMap(pattern) {
      var gmatcher = null;
      if (pattern.slice(-3) === "/**") {
        var gpattern = pattern.replace(/(\/\*\*)+$/, "");
        gmatcher = new Minimatch(gpattern, { dot: true });
      }
      return {
        matcher: new Minimatch(pattern, { dot: true }),
        gmatcher
      };
    }
    __name(ignoreMap, "ignoreMap");
    function setopts(self, pattern, options) {
      if (!options)
        options = {};
      if (options.matchBase && -1 === pattern.indexOf("/")) {
        if (options.noglobstar) {
          throw new Error("base matching requires globstar");
        }
        pattern = "**/" + pattern;
      }
      self.silent = !!options.silent;
      self.pattern = pattern;
      self.strict = options.strict !== false;
      self.realpath = !!options.realpath;
      self.realpathCache = options.realpathCache || /* @__PURE__ */ Object.create(null);
      self.follow = !!options.follow;
      self.dot = !!options.dot;
      self.mark = !!options.mark;
      self.nodir = !!options.nodir;
      if (self.nodir)
        self.mark = true;
      self.sync = !!options.sync;
      self.nounique = !!options.nounique;
      self.nonull = !!options.nonull;
      self.nosort = !!options.nosort;
      self.nocase = !!options.nocase;
      self.stat = !!options.stat;
      self.noprocess = !!options.noprocess;
      self.absolute = !!options.absolute;
      self.fs = options.fs || fs;
      self.maxLength = options.maxLength || Infinity;
      self.cache = options.cache || /* @__PURE__ */ Object.create(null);
      self.statCache = options.statCache || /* @__PURE__ */ Object.create(null);
      self.symlinks = options.symlinks || /* @__PURE__ */ Object.create(null);
      setupIgnores(self, options);
      self.changedCwd = false;
      var cwd = process.cwd();
      if (!ownProp(options, "cwd"))
        self.cwd = cwd;
      else {
        self.cwd = path3.resolve(options.cwd);
        self.changedCwd = self.cwd !== cwd;
      }
      self.root = options.root || path3.resolve(self.cwd, "/");
      self.root = path3.resolve(self.root);
      if (process.platform === "win32")
        self.root = self.root.replace(/\\/g, "/");
      self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd);
      if (process.platform === "win32")
        self.cwdAbs = self.cwdAbs.replace(/\\/g, "/");
      self.nomount = !!options.nomount;
      options.nonegate = true;
      options.nocomment = true;
      options.allowWindowsEscape = false;
      self.minimatch = new Minimatch(pattern, options);
      self.options = self.minimatch.options;
    }
    __name(setopts, "setopts");
    function finish(self) {
      var nou = self.nounique;
      var all = nou ? [] : /* @__PURE__ */ Object.create(null);
      for (var i = 0, l = self.matches.length; i < l; i++) {
        var matches = self.matches[i];
        if (!matches || Object.keys(matches).length === 0) {
          if (self.nonull) {
            var literal = self.minimatch.globSet[i];
            if (nou)
              all.push(literal);
            else
              all[literal] = true;
          }
        } else {
          var m = Object.keys(matches);
          if (nou)
            all.push.apply(all, m);
          else
            m.forEach(function(m2) {
              all[m2] = true;
            });
        }
      }
      if (!nou)
        all = Object.keys(all);
      if (!self.nosort)
        all = all.sort(alphasort);
      if (self.mark) {
        for (var i = 0; i < all.length; i++) {
          all[i] = self._mark(all[i]);
        }
        if (self.nodir) {
          all = all.filter(function(e) {
            var notDir = !/\/$/.test(e);
            var c = self.cache[e] || self.cache[makeAbs(self, e)];
            if (notDir && c)
              notDir = c !== "DIR" && !Array.isArray(c);
            return notDir;
          });
        }
      }
      if (self.ignore.length)
        all = all.filter(function(m2) {
          return !isIgnored(self, m2);
        });
      self.found = all;
    }
    __name(finish, "finish");
    function mark(self, p) {
      var abs = makeAbs(self, p);
      var c = self.cache[abs];
      var m = p;
      if (c) {
        var isDir = c === "DIR" || Array.isArray(c);
        var slash = p.slice(-1) === "/";
        if (isDir && !slash)
          m += "/";
        else if (!isDir && slash)
          m = m.slice(0, -1);
        if (m !== p) {
          var mabs = makeAbs(self, m);
          self.statCache[mabs] = self.statCache[abs];
          self.cache[mabs] = self.cache[abs];
        }
      }
      return m;
    }
    __name(mark, "mark");
    function makeAbs(self, f) {
      var abs = f;
      if (f.charAt(0) === "/") {
        abs = path3.join(self.root, f);
      } else if (isAbsolute(f) || f === "") {
        abs = f;
      } else if (self.changedCwd) {
        abs = path3.resolve(self.cwd, f);
      } else {
        abs = path3.resolve(f);
      }
      if (process.platform === "win32")
        abs = abs.replace(/\\/g, "/");
      return abs;
    }
    __name(makeAbs, "makeAbs");
    function isIgnored(self, path4) {
      if (!self.ignore.length)
        return false;
      return self.ignore.some(function(item) {
        return item.matcher.match(path4) || !!(item.gmatcher && item.gmatcher.match(path4));
      });
    }
    __name(isIgnored, "isIgnored");
    function childrenIgnored(self, path4) {
      if (!self.ignore.length)
        return false;
      return self.ignore.some(function(item) {
        return !!(item.gmatcher && item.gmatcher.match(path4));
      });
    }
    __name(childrenIgnored, "childrenIgnored");
  }
});

// node_modules/.pnpm/glob@7.2.3/node_modules/glob/sync.js
var require_sync = __commonJS({
  "node_modules/.pnpm/glob@7.2.3/node_modules/glob/sync.js"(exports, module) {
    module.exports = globSync;
    globSync.GlobSync = GlobSync;
    var rp = require_fs();
    var minimatch = require_minimatch();
    var Minimatch = minimatch.Minimatch;
    var Glob = require_glob().Glob;
    var util = __require("util");
    var path3 = __require("path");
    var assert2 = __require("assert");
    var isAbsolute = require_path_is_absolute();
    var common = require_common();
    var setopts = common.setopts;
    var ownProp = common.ownProp;
    var childrenIgnored = common.childrenIgnored;
    var isIgnored = common.isIgnored;
    function globSync(pattern, options) {
      if (typeof options === "function" || arguments.length === 3)
        throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
      return new GlobSync(pattern, options).found;
    }
    __name(globSync, "globSync");
    function GlobSync(pattern, options) {
      if (!pattern)
        throw new Error("must provide pattern");
      if (typeof options === "function" || arguments.length === 3)
        throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
      if (!(this instanceof GlobSync))
        return new GlobSync(pattern, options);
      setopts(this, pattern, options);
      if (this.noprocess)
        return this;
      var n = this.minimatch.set.length;
      this.matches = new Array(n);
      for (var i = 0; i < n; i++) {
        this._process(this.minimatch.set[i], i, false);
      }
      this._finish();
    }
    __name(GlobSync, "GlobSync");
    GlobSync.prototype._finish = function() {
      assert2.ok(this instanceof GlobSync);
      if (this.realpath) {
        var self = this;
        this.matches.forEach(function(matchset, index) {
          var set = self.matches[index] = /* @__PURE__ */ Object.create(null);
          for (var p in matchset) {
            try {
              p = self._makeAbs(p);
              var real = rp.realpathSync(p, self.realpathCache);
              set[real] = true;
            } catch (er) {
              if (er.syscall === "stat")
                set[self._makeAbs(p)] = true;
              else
                throw er;
            }
          }
        });
      }
      common.finish(this);
    };
    GlobSync.prototype._process = function(pattern, index, inGlobStar) {
      assert2.ok(this instanceof GlobSync);
      var n = 0;
      while (typeof pattern[n] === "string") {
        n++;
      }
      var prefix;
      switch (n) {
        case pattern.length:
          this._processSimple(pattern.join("/"), index);
          return;
        case 0:
          prefix = null;
          break;
        default:
          prefix = pattern.slice(0, n).join("/");
          break;
      }
      var remain = pattern.slice(n);
      var read;
      if (prefix === null)
        read = ".";
      else if (isAbsolute(prefix) || isAbsolute(pattern.map(function(p) {
        return typeof p === "string" ? p : "[*]";
      }).join("/"))) {
        if (!prefix || !isAbsolute(prefix))
          prefix = "/" + prefix;
        read = prefix;
      } else
        read = prefix;
      var abs = this._makeAbs(read);
      if (childrenIgnored(this, read))
        return;
      var isGlobStar = remain[0] === minimatch.GLOBSTAR;
      if (isGlobStar)
        this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);
      else
        this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
    };
    GlobSync.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar) {
      var entries = this._readdir(abs, inGlobStar);
      if (!entries)
        return;
      var pn = remain[0];
      var negate = !!this.minimatch.negate;
      var rawGlob = pn._glob;
      var dotOk = this.dot || rawGlob.charAt(0) === ".";
      var matchedEntries = [];
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.charAt(0) !== "." || dotOk) {
          var m;
          if (negate && !prefix) {
            m = !e.match(pn);
          } else {
            m = e.match(pn);
          }
          if (m)
            matchedEntries.push(e);
        }
      }
      var len = matchedEntries.length;
      if (len === 0)
        return;
      if (remain.length === 1 && !this.mark && !this.stat) {
        if (!this.matches[index])
          this.matches[index] = /* @__PURE__ */ Object.create(null);
        for (var i = 0; i < len; i++) {
          var e = matchedEntries[i];
          if (prefix) {
            if (prefix.slice(-1) !== "/")
              e = prefix + "/" + e;
            else
              e = prefix + e;
          }
          if (e.charAt(0) === "/" && !this.nomount) {
            e = path3.join(this.root, e);
          }
          this._emitMatch(index, e);
        }
        return;
      }
      remain.shift();
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        var newPattern;
        if (prefix)
          newPattern = [prefix, e];
        else
          newPattern = [e];
        this._process(newPattern.concat(remain), index, inGlobStar);
      }
    };
    GlobSync.prototype._emitMatch = function(index, e) {
      if (isIgnored(this, e))
        return;
      var abs = this._makeAbs(e);
      if (this.mark)
        e = this._mark(e);
      if (this.absolute) {
        e = abs;
      }
      if (this.matches[index][e])
        return;
      if (this.nodir) {
        var c = this.cache[abs];
        if (c === "DIR" || Array.isArray(c))
          return;
      }
      this.matches[index][e] = true;
      if (this.stat)
        this._stat(e);
    };
    GlobSync.prototype._readdirInGlobStar = function(abs) {
      if (this.follow)
        return this._readdir(abs, false);
      var entries;
      var lstat;
      var stat;
      try {
        lstat = this.fs.lstatSync(abs);
      } catch (er) {
        if (er.code === "ENOENT") {
          return null;
        }
      }
      var isSym = lstat && lstat.isSymbolicLink();
      this.symlinks[abs] = isSym;
      if (!isSym && lstat && !lstat.isDirectory())
        this.cache[abs] = "FILE";
      else
        entries = this._readdir(abs, false);
      return entries;
    };
    GlobSync.prototype._readdir = function(abs, inGlobStar) {
      var entries;
      if (inGlobStar && !ownProp(this.symlinks, abs))
        return this._readdirInGlobStar(abs);
      if (ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (!c || c === "FILE")
          return null;
        if (Array.isArray(c))
          return c;
      }
      try {
        return this._readdirEntries(abs, this.fs.readdirSync(abs));
      } catch (er) {
        this._readdirError(abs, er);
        return null;
      }
    };
    GlobSync.prototype._readdirEntries = function(abs, entries) {
      if (!this.mark && !this.stat) {
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          if (abs === "/")
            e = abs + e;
          else
            e = abs + "/" + e;
          this.cache[e] = true;
        }
      }
      this.cache[abs] = entries;
      return entries;
    };
    GlobSync.prototype._readdirError = function(f, er) {
      switch (er.code) {
        case "ENOTSUP":
        case "ENOTDIR":
          var abs = this._makeAbs(f);
          this.cache[abs] = "FILE";
          if (abs === this.cwdAbs) {
            var error2 = new Error(er.code + " invalid cwd " + this.cwd);
            error2.path = this.cwd;
            error2.code = er.code;
            throw error2;
          }
          break;
        case "ENOENT":
        case "ELOOP":
        case "ENAMETOOLONG":
        case "UNKNOWN":
          this.cache[this._makeAbs(f)] = false;
          break;
        default:
          this.cache[this._makeAbs(f)] = false;
          if (this.strict)
            throw er;
          if (!this.silent)
            console.error("glob error", er);
          break;
      }
    };
    GlobSync.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar) {
      var entries = this._readdir(abs, inGlobStar);
      if (!entries)
        return;
      var remainWithoutGlobStar = remain.slice(1);
      var gspref = prefix ? [prefix] : [];
      var noGlobStar = gspref.concat(remainWithoutGlobStar);
      this._process(noGlobStar, index, false);
      var len = entries.length;
      var isSym = this.symlinks[abs];
      if (isSym && inGlobStar)
        return;
      for (var i = 0; i < len; i++) {
        var e = entries[i];
        if (e.charAt(0) === "." && !this.dot)
          continue;
        var instead = gspref.concat(entries[i], remainWithoutGlobStar);
        this._process(instead, index, true);
        var below = gspref.concat(entries[i], remain);
        this._process(below, index, true);
      }
    };
    GlobSync.prototype._processSimple = function(prefix, index) {
      var exists = this._stat(prefix);
      if (!this.matches[index])
        this.matches[index] = /* @__PURE__ */ Object.create(null);
      if (!exists)
        return;
      if (prefix && isAbsolute(prefix) && !this.nomount) {
        var trail = /[\/\\]$/.test(prefix);
        if (prefix.charAt(0) === "/") {
          prefix = path3.join(this.root, prefix);
        } else {
          prefix = path3.resolve(this.root, prefix);
          if (trail)
            prefix += "/";
        }
      }
      if (process.platform === "win32")
        prefix = prefix.replace(/\\/g, "/");
      this._emitMatch(index, prefix);
    };
    GlobSync.prototype._stat = function(f) {
      var abs = this._makeAbs(f);
      var needDir = f.slice(-1) === "/";
      if (f.length > this.maxLength)
        return false;
      if (!this.stat && ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (Array.isArray(c))
          c = "DIR";
        if (!needDir || c === "DIR")
          return c;
        if (needDir && c === "FILE")
          return false;
      }
      var exists;
      var stat = this.statCache[abs];
      if (!stat) {
        var lstat;
        try {
          lstat = this.fs.lstatSync(abs);
        } catch (er) {
          if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
            this.statCache[abs] = false;
            return false;
          }
        }
        if (lstat && lstat.isSymbolicLink()) {
          try {
            stat = this.fs.statSync(abs);
          } catch (er) {
            stat = lstat;
          }
        } else {
          stat = lstat;
        }
      }
      this.statCache[abs] = stat;
      var c = true;
      if (stat)
        c = stat.isDirectory() ? "DIR" : "FILE";
      this.cache[abs] = this.cache[abs] || c;
      if (needDir && c === "FILE")
        return false;
      return c;
    };
    GlobSync.prototype._mark = function(p) {
      return common.mark(this, p);
    };
    GlobSync.prototype._makeAbs = function(f) {
      return common.makeAbs(this, f);
    };
  }
});

// node_modules/.pnpm/wrappy@1.0.2/node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS({
  "node_modules/.pnpm/wrappy@1.0.2/node_modules/wrappy/wrappy.js"(exports, module) {
    module.exports = wrappy;
    function wrappy(fn, cb) {
      if (fn && cb)
        return wrappy(fn)(cb);
      if (typeof fn !== "function")
        throw new TypeError("need wrapper function");
      Object.keys(fn).forEach(function(k) {
        wrapper[k] = fn[k];
      });
      return wrapper;
      function wrapper() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        var ret = fn.apply(this, args);
        var cb2 = args[args.length - 1];
        if (typeof ret === "function" && ret !== cb2) {
          Object.keys(cb2).forEach(function(k) {
            ret[k] = cb2[k];
          });
        }
        return ret;
      }
      __name(wrapper, "wrapper");
    }
    __name(wrappy, "wrappy");
  }
});

// node_modules/.pnpm/once@1.4.0/node_modules/once/once.js
var require_once = __commonJS({
  "node_modules/.pnpm/once@1.4.0/node_modules/once/once.js"(exports, module) {
    var wrappy = require_wrappy();
    module.exports = wrappy(once);
    module.exports.strict = wrappy(onceStrict);
    once.proto = once(function() {
      Object.defineProperty(Function.prototype, "once", {
        value: function() {
          return once(this);
        },
        configurable: true
      });
      Object.defineProperty(Function.prototype, "onceStrict", {
        value: function() {
          return onceStrict(this);
        },
        configurable: true
      });
    });
    function once(fn) {
      var f = /* @__PURE__ */ __name(function() {
        if (f.called)
          return f.value;
        f.called = true;
        return f.value = fn.apply(this, arguments);
      }, "f");
      f.called = false;
      return f;
    }
    __name(once, "once");
    function onceStrict(fn) {
      var f = /* @__PURE__ */ __name(function() {
        if (f.called)
          throw new Error(f.onceError);
        f.called = true;
        return f.value = fn.apply(this, arguments);
      }, "f");
      var name = fn.name || "Function wrapped with `once`";
      f.onceError = name + " shouldn't be called more than once";
      f.called = false;
      return f;
    }
    __name(onceStrict, "onceStrict");
  }
});

// node_modules/.pnpm/inflight@1.0.6/node_modules/inflight/inflight.js
var require_inflight = __commonJS({
  "node_modules/.pnpm/inflight@1.0.6/node_modules/inflight/inflight.js"(exports, module) {
    var wrappy = require_wrappy();
    var reqs = /* @__PURE__ */ Object.create(null);
    var once = require_once();
    module.exports = wrappy(inflight);
    function inflight(key, cb) {
      if (reqs[key]) {
        reqs[key].push(cb);
        return null;
      } else {
        reqs[key] = [cb];
        return makeres(key);
      }
    }
    __name(inflight, "inflight");
    function makeres(key) {
      return once(/* @__PURE__ */ __name(function RES() {
        var cbs = reqs[key];
        var len = cbs.length;
        var args = slice(arguments);
        try {
          for (var i = 0; i < len; i++) {
            cbs[i].apply(null, args);
          }
        } finally {
          if (cbs.length > len) {
            cbs.splice(0, len);
            process.nextTick(function() {
              RES.apply(null, args);
            });
          } else {
            delete reqs[key];
          }
        }
      }, "RES"));
    }
    __name(makeres, "makeres");
    function slice(args) {
      var length = args.length;
      var array = [];
      for (var i = 0; i < length; i++)
        array[i] = args[i];
      return array;
    }
    __name(slice, "slice");
  }
});

// node_modules/.pnpm/glob@7.2.3/node_modules/glob/glob.js
var require_glob = __commonJS({
  "node_modules/.pnpm/glob@7.2.3/node_modules/glob/glob.js"(exports, module) {
    module.exports = glob;
    var rp = require_fs();
    var minimatch = require_minimatch();
    var Minimatch = minimatch.Minimatch;
    var inherits = require_inherits();
    var EE = __require("events").EventEmitter;
    var path3 = __require("path");
    var assert2 = __require("assert");
    var isAbsolute = require_path_is_absolute();
    var globSync = require_sync();
    var common = require_common();
    var setopts = common.setopts;
    var ownProp = common.ownProp;
    var inflight = require_inflight();
    var util = __require("util");
    var childrenIgnored = common.childrenIgnored;
    var isIgnored = common.isIgnored;
    var once = require_once();
    function glob(pattern, options, cb) {
      if (typeof options === "function")
        cb = options, options = {};
      if (!options)
        options = {};
      if (options.sync) {
        if (cb)
          throw new TypeError("callback provided to sync glob");
        return globSync(pattern, options);
      }
      return new Glob(pattern, options, cb);
    }
    __name(glob, "glob");
    glob.sync = globSync;
    var GlobSync = glob.GlobSync = globSync.GlobSync;
    glob.glob = glob;
    function extend(origin, add) {
      if (add === null || typeof add !== "object") {
        return origin;
      }
      var keys = Object.keys(add);
      var i = keys.length;
      while (i--) {
        origin[keys[i]] = add[keys[i]];
      }
      return origin;
    }
    __name(extend, "extend");
    glob.hasMagic = function(pattern, options_) {
      var options = extend({}, options_);
      options.noprocess = true;
      var g = new Glob(pattern, options);
      var set = g.minimatch.set;
      if (!pattern)
        return false;
      if (set.length > 1)
        return true;
      for (var j = 0; j < set[0].length; j++) {
        if (typeof set[0][j] !== "string")
          return true;
      }
      return false;
    };
    glob.Glob = Glob;
    inherits(Glob, EE);
    function Glob(pattern, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = null;
      }
      if (options && options.sync) {
        if (cb)
          throw new TypeError("callback provided to sync glob");
        return new GlobSync(pattern, options);
      }
      if (!(this instanceof Glob))
        return new Glob(pattern, options, cb);
      setopts(this, pattern, options);
      this._didRealPath = false;
      var n = this.minimatch.set.length;
      this.matches = new Array(n);
      if (typeof cb === "function") {
        cb = once(cb);
        this.on("error", cb);
        this.on("end", function(matches) {
          cb(null, matches);
        });
      }
      var self = this;
      this._processing = 0;
      this._emitQueue = [];
      this._processQueue = [];
      this.paused = false;
      if (this.noprocess)
        return this;
      if (n === 0)
        return done();
      var sync = true;
      for (var i = 0; i < n; i++) {
        this._process(this.minimatch.set[i], i, false, done);
      }
      sync = false;
      function done() {
        --self._processing;
        if (self._processing <= 0) {
          if (sync) {
            process.nextTick(function() {
              self._finish();
            });
          } else {
            self._finish();
          }
        }
      }
      __name(done, "done");
    }
    __name(Glob, "Glob");
    Glob.prototype._finish = function() {
      assert2(this instanceof Glob);
      if (this.aborted)
        return;
      if (this.realpath && !this._didRealpath)
        return this._realpath();
      common.finish(this);
      this.emit("end", this.found);
    };
    Glob.prototype._realpath = function() {
      if (this._didRealpath)
        return;
      this._didRealpath = true;
      var n = this.matches.length;
      if (n === 0)
        return this._finish();
      var self = this;
      for (var i = 0; i < this.matches.length; i++)
        this._realpathSet(i, next);
      function next() {
        if (--n === 0)
          self._finish();
      }
      __name(next, "next");
    };
    Glob.prototype._realpathSet = function(index, cb) {
      var matchset = this.matches[index];
      if (!matchset)
        return cb();
      var found = Object.keys(matchset);
      var self = this;
      var n = found.length;
      if (n === 0)
        return cb();
      var set = this.matches[index] = /* @__PURE__ */ Object.create(null);
      found.forEach(function(p, i) {
        p = self._makeAbs(p);
        rp.realpath(p, self.realpathCache, function(er, real) {
          if (!er)
            set[real] = true;
          else if (er.syscall === "stat")
            set[p] = true;
          else
            self.emit("error", er);
          if (--n === 0) {
            self.matches[index] = set;
            cb();
          }
        });
      });
    };
    Glob.prototype._mark = function(p) {
      return common.mark(this, p);
    };
    Glob.prototype._makeAbs = function(f) {
      return common.makeAbs(this, f);
    };
    Glob.prototype.abort = function() {
      this.aborted = true;
      this.emit("abort");
    };
    Glob.prototype.pause = function() {
      if (!this.paused) {
        this.paused = true;
        this.emit("pause");
      }
    };
    Glob.prototype.resume = function() {
      if (this.paused) {
        this.emit("resume");
        this.paused = false;
        if (this._emitQueue.length) {
          var eq = this._emitQueue.slice(0);
          this._emitQueue.length = 0;
          for (var i = 0; i < eq.length; i++) {
            var e = eq[i];
            this._emitMatch(e[0], e[1]);
          }
        }
        if (this._processQueue.length) {
          var pq = this._processQueue.slice(0);
          this._processQueue.length = 0;
          for (var i = 0; i < pq.length; i++) {
            var p = pq[i];
            this._processing--;
            this._process(p[0], p[1], p[2], p[3]);
          }
        }
      }
    };
    Glob.prototype._process = function(pattern, index, inGlobStar, cb) {
      assert2(this instanceof Glob);
      assert2(typeof cb === "function");
      if (this.aborted)
        return;
      this._processing++;
      if (this.paused) {
        this._processQueue.push([pattern, index, inGlobStar, cb]);
        return;
      }
      var n = 0;
      while (typeof pattern[n] === "string") {
        n++;
      }
      var prefix;
      switch (n) {
        case pattern.length:
          this._processSimple(pattern.join("/"), index, cb);
          return;
        case 0:
          prefix = null;
          break;
        default:
          prefix = pattern.slice(0, n).join("/");
          break;
      }
      var remain = pattern.slice(n);
      var read;
      if (prefix === null)
        read = ".";
      else if (isAbsolute(prefix) || isAbsolute(pattern.map(function(p) {
        return typeof p === "string" ? p : "[*]";
      }).join("/"))) {
        if (!prefix || !isAbsolute(prefix))
          prefix = "/" + prefix;
        read = prefix;
      } else
        read = prefix;
      var abs = this._makeAbs(read);
      if (childrenIgnored(this, read))
        return cb();
      var isGlobStar = remain[0] === minimatch.GLOBSTAR;
      if (isGlobStar)
        this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
      else
        this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
    };
    Glob.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar, cb) {
      var self = this;
      this._readdir(abs, inGlobStar, function(er, entries) {
        return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
      });
    };
    Glob.prototype._processReaddir2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
      if (!entries)
        return cb();
      var pn = remain[0];
      var negate = !!this.minimatch.negate;
      var rawGlob = pn._glob;
      var dotOk = this.dot || rawGlob.charAt(0) === ".";
      var matchedEntries = [];
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.charAt(0) !== "." || dotOk) {
          var m;
          if (negate && !prefix) {
            m = !e.match(pn);
          } else {
            m = e.match(pn);
          }
          if (m)
            matchedEntries.push(e);
        }
      }
      var len = matchedEntries.length;
      if (len === 0)
        return cb();
      if (remain.length === 1 && !this.mark && !this.stat) {
        if (!this.matches[index])
          this.matches[index] = /* @__PURE__ */ Object.create(null);
        for (var i = 0; i < len; i++) {
          var e = matchedEntries[i];
          if (prefix) {
            if (prefix !== "/")
              e = prefix + "/" + e;
            else
              e = prefix + e;
          }
          if (e.charAt(0) === "/" && !this.nomount) {
            e = path3.join(this.root, e);
          }
          this._emitMatch(index, e);
        }
        return cb();
      }
      remain.shift();
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        var newPattern;
        if (prefix) {
          if (prefix !== "/")
            e = prefix + "/" + e;
          else
            e = prefix + e;
        }
        this._process([e].concat(remain), index, inGlobStar, cb);
      }
      cb();
    };
    Glob.prototype._emitMatch = function(index, e) {
      if (this.aborted)
        return;
      if (isIgnored(this, e))
        return;
      if (this.paused) {
        this._emitQueue.push([index, e]);
        return;
      }
      var abs = isAbsolute(e) ? e : this._makeAbs(e);
      if (this.mark)
        e = this._mark(e);
      if (this.absolute)
        e = abs;
      if (this.matches[index][e])
        return;
      if (this.nodir) {
        var c = this.cache[abs];
        if (c === "DIR" || Array.isArray(c))
          return;
      }
      this.matches[index][e] = true;
      var st = this.statCache[abs];
      if (st)
        this.emit("stat", e, st);
      this.emit("match", e);
    };
    Glob.prototype._readdirInGlobStar = function(abs, cb) {
      if (this.aborted)
        return;
      if (this.follow)
        return this._readdir(abs, false, cb);
      var lstatkey = "lstat\0" + abs;
      var self = this;
      var lstatcb = inflight(lstatkey, lstatcb_);
      if (lstatcb)
        self.fs.lstat(abs, lstatcb);
      function lstatcb_(er, lstat) {
        if (er && er.code === "ENOENT")
          return cb();
        var isSym = lstat && lstat.isSymbolicLink();
        self.symlinks[abs] = isSym;
        if (!isSym && lstat && !lstat.isDirectory()) {
          self.cache[abs] = "FILE";
          cb();
        } else
          self._readdir(abs, false, cb);
      }
      __name(lstatcb_, "lstatcb_");
    };
    Glob.prototype._readdir = function(abs, inGlobStar, cb) {
      if (this.aborted)
        return;
      cb = inflight("readdir\0" + abs + "\0" + inGlobStar, cb);
      if (!cb)
        return;
      if (inGlobStar && !ownProp(this.symlinks, abs))
        return this._readdirInGlobStar(abs, cb);
      if (ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (!c || c === "FILE")
          return cb();
        if (Array.isArray(c))
          return cb(null, c);
      }
      var self = this;
      self.fs.readdir(abs, readdirCb(this, abs, cb));
    };
    function readdirCb(self, abs, cb) {
      return function(er, entries) {
        if (er)
          self._readdirError(abs, er, cb);
        else
          self._readdirEntries(abs, entries, cb);
      };
    }
    __name(readdirCb, "readdirCb");
    Glob.prototype._readdirEntries = function(abs, entries, cb) {
      if (this.aborted)
        return;
      if (!this.mark && !this.stat) {
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          if (abs === "/")
            e = abs + e;
          else
            e = abs + "/" + e;
          this.cache[e] = true;
        }
      }
      this.cache[abs] = entries;
      return cb(null, entries);
    };
    Glob.prototype._readdirError = function(f, er, cb) {
      if (this.aborted)
        return;
      switch (er.code) {
        case "ENOTSUP":
        case "ENOTDIR":
          var abs = this._makeAbs(f);
          this.cache[abs] = "FILE";
          if (abs === this.cwdAbs) {
            var error2 = new Error(er.code + " invalid cwd " + this.cwd);
            error2.path = this.cwd;
            error2.code = er.code;
            this.emit("error", error2);
            this.abort();
          }
          break;
        case "ENOENT":
        case "ELOOP":
        case "ENAMETOOLONG":
        case "UNKNOWN":
          this.cache[this._makeAbs(f)] = false;
          break;
        default:
          this.cache[this._makeAbs(f)] = false;
          if (this.strict) {
            this.emit("error", er);
            this.abort();
          }
          if (!this.silent)
            console.error("glob error", er);
          break;
      }
      return cb();
    };
    Glob.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar, cb) {
      var self = this;
      this._readdir(abs, inGlobStar, function(er, entries) {
        self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
      });
    };
    Glob.prototype._processGlobStar2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
      if (!entries)
        return cb();
      var remainWithoutGlobStar = remain.slice(1);
      var gspref = prefix ? [prefix] : [];
      var noGlobStar = gspref.concat(remainWithoutGlobStar);
      this._process(noGlobStar, index, false, cb);
      var isSym = this.symlinks[abs];
      var len = entries.length;
      if (isSym && inGlobStar)
        return cb();
      for (var i = 0; i < len; i++) {
        var e = entries[i];
        if (e.charAt(0) === "." && !this.dot)
          continue;
        var instead = gspref.concat(entries[i], remainWithoutGlobStar);
        this._process(instead, index, true, cb);
        var below = gspref.concat(entries[i], remain);
        this._process(below, index, true, cb);
      }
      cb();
    };
    Glob.prototype._processSimple = function(prefix, index, cb) {
      var self = this;
      this._stat(prefix, function(er, exists) {
        self._processSimple2(prefix, index, er, exists, cb);
      });
    };
    Glob.prototype._processSimple2 = function(prefix, index, er, exists, cb) {
      if (!this.matches[index])
        this.matches[index] = /* @__PURE__ */ Object.create(null);
      if (!exists)
        return cb();
      if (prefix && isAbsolute(prefix) && !this.nomount) {
        var trail = /[\/\\]$/.test(prefix);
        if (prefix.charAt(0) === "/") {
          prefix = path3.join(this.root, prefix);
        } else {
          prefix = path3.resolve(this.root, prefix);
          if (trail)
            prefix += "/";
        }
      }
      if (process.platform === "win32")
        prefix = prefix.replace(/\\/g, "/");
      this._emitMatch(index, prefix);
      cb();
    };
    Glob.prototype._stat = function(f, cb) {
      var abs = this._makeAbs(f);
      var needDir = f.slice(-1) === "/";
      if (f.length > this.maxLength)
        return cb();
      if (!this.stat && ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (Array.isArray(c))
          c = "DIR";
        if (!needDir || c === "DIR")
          return cb(null, c);
        if (needDir && c === "FILE")
          return cb();
      }
      var exists;
      var stat = this.statCache[abs];
      if (stat !== void 0) {
        if (stat === false)
          return cb(null, stat);
        else {
          var type = stat.isDirectory() ? "DIR" : "FILE";
          if (needDir && type === "FILE")
            return cb();
          else
            return cb(null, type, stat);
        }
      }
      var self = this;
      var statcb = inflight("stat\0" + abs, lstatcb_);
      if (statcb)
        self.fs.lstat(abs, statcb);
      function lstatcb_(er, lstat) {
        if (lstat && lstat.isSymbolicLink()) {
          return self.fs.stat(abs, function(er2, stat2) {
            if (er2)
              self._stat2(f, abs, null, lstat, cb);
            else
              self._stat2(f, abs, er2, stat2, cb);
          });
        } else {
          self._stat2(f, abs, er, lstat, cb);
        }
      }
      __name(lstatcb_, "lstatcb_");
    };
    Glob.prototype._stat2 = function(f, abs, er, stat, cb) {
      if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
        this.statCache[abs] = false;
        return cb();
      }
      var needDir = f.slice(-1) === "/";
      this.statCache[abs] = stat;
      if (abs.slice(-1) === "/" && stat && !stat.isDirectory())
        return cb(null, false, stat);
      var c = true;
      if (stat)
        c = stat.isDirectory() ? "DIR" : "FILE";
      this.cache[abs] = this.cache[abs] || c;
      if (needDir && c === "FILE")
        return cb();
      return cb(null, c, stat);
    };
  }
});

// node_modules/.pnpm/rimraf@3.0.2/node_modules/rimraf/rimraf.js
var require_rimraf = __commonJS({
  "node_modules/.pnpm/rimraf@3.0.2/node_modules/rimraf/rimraf.js"(exports, module) {
    var assert2 = __require("assert");
    var path3 = __require("path");
    var fs = __require("fs");
    var glob = void 0;
    try {
      glob = require_glob();
    } catch (_err) {
    }
    var defaultGlobOpts = {
      nosort: true,
      silent: true
    };
    var timeout = 0;
    var isWindows = process.platform === "win32";
    var defaults = /* @__PURE__ */ __name((options) => {
      const methods = [
        "unlink",
        "chmod",
        "stat",
        "lstat",
        "rmdir",
        "readdir"
      ];
      methods.forEach((m) => {
        options[m] = options[m] || fs[m];
        m = m + "Sync";
        options[m] = options[m] || fs[m];
      });
      options.maxBusyTries = options.maxBusyTries || 3;
      options.emfileWait = options.emfileWait || 1e3;
      if (options.glob === false) {
        options.disableGlob = true;
      }
      if (options.disableGlob !== true && glob === void 0) {
        throw Error("glob dependency not found, set `options.disableGlob = true` if intentional");
      }
      options.disableGlob = options.disableGlob || false;
      options.glob = options.glob || defaultGlobOpts;
    }, "defaults");
    var rimraf = /* @__PURE__ */ __name((p, options, cb) => {
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      assert2(p, "rimraf: missing path");
      assert2.equal(typeof p, "string", "rimraf: path should be a string");
      assert2.equal(typeof cb, "function", "rimraf: callback function required");
      assert2(options, "rimraf: invalid options argument provided");
      assert2.equal(typeof options, "object", "rimraf: options should be object");
      defaults(options);
      let busyTries = 0;
      let errState = null;
      let n = 0;
      const next = /* @__PURE__ */ __name((er) => {
        errState = errState || er;
        if (--n === 0)
          cb(errState);
      }, "next");
      const afterGlob = /* @__PURE__ */ __name((er, results) => {
        if (er)
          return cb(er);
        n = results.length;
        if (n === 0)
          return cb();
        results.forEach((p2) => {
          const CB = /* @__PURE__ */ __name((er2) => {
            if (er2) {
              if ((er2.code === "EBUSY" || er2.code === "ENOTEMPTY" || er2.code === "EPERM") && busyTries < options.maxBusyTries) {
                busyTries++;
                return setTimeout(() => rimraf_(p2, options, CB), busyTries * 100);
              }
              if (er2.code === "EMFILE" && timeout < options.emfileWait) {
                return setTimeout(() => rimraf_(p2, options, CB), timeout++);
              }
              if (er2.code === "ENOENT")
                er2 = null;
            }
            timeout = 0;
            next(er2);
          }, "CB");
          rimraf_(p2, options, CB);
        });
      }, "afterGlob");
      if (options.disableGlob || !glob.hasMagic(p))
        return afterGlob(null, [p]);
      options.lstat(p, (er, stat) => {
        if (!er)
          return afterGlob(null, [p]);
        glob(p, options.glob, afterGlob);
      });
    }, "rimraf");
    var rimraf_ = /* @__PURE__ */ __name((p, options, cb) => {
      assert2(p);
      assert2(options);
      assert2(typeof cb === "function");
      options.lstat(p, (er, st) => {
        if (er && er.code === "ENOENT")
          return cb(null);
        if (er && er.code === "EPERM" && isWindows)
          fixWinEPERM(p, options, er, cb);
        if (st && st.isDirectory())
          return rmdir(p, options, er, cb);
        options.unlink(p, (er2) => {
          if (er2) {
            if (er2.code === "ENOENT")
              return cb(null);
            if (er2.code === "EPERM")
              return isWindows ? fixWinEPERM(p, options, er2, cb) : rmdir(p, options, er2, cb);
            if (er2.code === "EISDIR")
              return rmdir(p, options, er2, cb);
          }
          return cb(er2);
        });
      });
    }, "rimraf_");
    var fixWinEPERM = /* @__PURE__ */ __name((p, options, er, cb) => {
      assert2(p);
      assert2(options);
      assert2(typeof cb === "function");
      options.chmod(p, 438, (er2) => {
        if (er2)
          cb(er2.code === "ENOENT" ? null : er);
        else
          options.stat(p, (er3, stats) => {
            if (er3)
              cb(er3.code === "ENOENT" ? null : er);
            else if (stats.isDirectory())
              rmdir(p, options, er, cb);
            else
              options.unlink(p, cb);
          });
      });
    }, "fixWinEPERM");
    var fixWinEPERMSync = /* @__PURE__ */ __name((p, options, er) => {
      assert2(p);
      assert2(options);
      try {
        options.chmodSync(p, 438);
      } catch (er2) {
        if (er2.code === "ENOENT")
          return;
        else
          throw er;
      }
      let stats;
      try {
        stats = options.statSync(p);
      } catch (er3) {
        if (er3.code === "ENOENT")
          return;
        else
          throw er;
      }
      if (stats.isDirectory())
        rmdirSync(p, options, er);
      else
        options.unlinkSync(p);
    }, "fixWinEPERMSync");
    var rmdir = /* @__PURE__ */ __name((p, options, originalEr, cb) => {
      assert2(p);
      assert2(options);
      assert2(typeof cb === "function");
      options.rmdir(p, (er) => {
        if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
          rmkids(p, options, cb);
        else if (er && er.code === "ENOTDIR")
          cb(originalEr);
        else
          cb(er);
      });
    }, "rmdir");
    var rmkids = /* @__PURE__ */ __name((p, options, cb) => {
      assert2(p);
      assert2(options);
      assert2(typeof cb === "function");
      options.readdir(p, (er, files) => {
        if (er)
          return cb(er);
        let n = files.length;
        if (n === 0)
          return options.rmdir(p, cb);
        let errState;
        files.forEach((f) => {
          rimraf(path3.join(p, f), options, (er2) => {
            if (errState)
              return;
            if (er2)
              return cb(errState = er2);
            if (--n === 0)
              options.rmdir(p, cb);
          });
        });
      });
    }, "rmkids");
    var rimrafSync = /* @__PURE__ */ __name((p, options) => {
      options = options || {};
      defaults(options);
      assert2(p, "rimraf: missing path");
      assert2.equal(typeof p, "string", "rimraf: path should be a string");
      assert2(options, "rimraf: missing options");
      assert2.equal(typeof options, "object", "rimraf: options should be object");
      let results;
      if (options.disableGlob || !glob.hasMagic(p)) {
        results = [p];
      } else {
        try {
          options.lstatSync(p);
          results = [p];
        } catch (er) {
          results = glob.sync(p, options.glob);
        }
      }
      if (!results.length)
        return;
      for (let i = 0; i < results.length; i++) {
        const p2 = results[i];
        let st;
        try {
          st = options.lstatSync(p2);
        } catch (er) {
          if (er.code === "ENOENT")
            return;
          if (er.code === "EPERM" && isWindows)
            fixWinEPERMSync(p2, options, er);
        }
        try {
          if (st && st.isDirectory())
            rmdirSync(p2, options, null);
          else
            options.unlinkSync(p2);
        } catch (er) {
          if (er.code === "ENOENT")
            return;
          if (er.code === "EPERM")
            return isWindows ? fixWinEPERMSync(p2, options, er) : rmdirSync(p2, options, er);
          if (er.code !== "EISDIR")
            throw er;
          rmdirSync(p2, options, er);
        }
      }
    }, "rimrafSync");
    var rmdirSync = /* @__PURE__ */ __name((p, options, originalEr) => {
      assert2(p);
      assert2(options);
      try {
        options.rmdirSync(p);
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        if (er.code === "ENOTDIR")
          throw originalEr;
        if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
          rmkidsSync(p, options);
      }
    }, "rmdirSync");
    var rmkidsSync = /* @__PURE__ */ __name((p, options) => {
      assert2(p);
      assert2(options);
      options.readdirSync(p).forEach((f) => rimrafSync(path3.join(p, f), options));
      const retries = isWindows ? 100 : 1;
      let i = 0;
      do {
        let threw = true;
        try {
          const ret = options.rmdirSync(p, options);
          threw = false;
          return ret;
        } finally {
          if (++i < retries && threw)
            continue;
        }
      } while (true);
    }, "rmkidsSync");
    module.exports = rimraf;
    rimraf.sync = rimrafSync;
  }
});

// node_modules/.pnpm/tmp@0.2.1/node_modules/tmp/lib/tmp.js
var require_tmp = __commonJS({
  "node_modules/.pnpm/tmp@0.2.1/node_modules/tmp/lib/tmp.js"(exports, module) {
    var fs = __require("fs");
    var os2 = __require("os");
    var path3 = __require("path");
    var crypto4 = __require("crypto");
    var _c = { fs: fs.constants, os: os2.constants };
    var rimraf = require_rimraf();
    var RANDOM_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var TEMPLATE_PATTERN = /XXXXXX/;
    var DEFAULT_TRIES = 3;
    var CREATE_FLAGS = (_c.O_CREAT || _c.fs.O_CREAT) | (_c.O_EXCL || _c.fs.O_EXCL) | (_c.O_RDWR || _c.fs.O_RDWR);
    var IS_WIN32 = os2.platform() === "win32";
    var EBADF = _c.EBADF || _c.os.errno.EBADF;
    var ENOENT = _c.ENOENT || _c.os.errno.ENOENT;
    var DIR_MODE = 448;
    var FILE_MODE = 384;
    var EXIT = "exit";
    var _removeObjects = [];
    var FN_RMDIR_SYNC = fs.rmdirSync.bind(fs);
    var FN_RIMRAF_SYNC = rimraf.sync;
    var _gracefulCleanup = false;
    function tmpName(options, callback) {
      const args = _parseArguments(options, callback), opts = args[0], cb = args[1];
      try {
        _assertAndSanitizeOptions(opts);
      } catch (err) {
        return cb(err);
      }
      let tries = opts.tries;
      (/* @__PURE__ */ __name(function _getUniqueName() {
        try {
          const name = _generateTmpName(opts);
          fs.stat(name, function(err) {
            if (!err) {
              if (tries-- > 0)
                return _getUniqueName();
              return cb(new Error("Could not get a unique tmp filename, max tries reached " + name));
            }
            cb(null, name);
          });
        } catch (err) {
          cb(err);
        }
      }, "_getUniqueName"))();
    }
    __name(tmpName, "tmpName");
    function tmpNameSync(options) {
      const args = _parseArguments(options), opts = args[0];
      _assertAndSanitizeOptions(opts);
      let tries = opts.tries;
      do {
        const name = _generateTmpName(opts);
        try {
          fs.statSync(name);
        } catch (e) {
          return name;
        }
      } while (tries-- > 0);
      throw new Error("Could not get a unique tmp filename, max tries reached");
    }
    __name(tmpNameSync, "tmpNameSync");
    function file(options, callback) {
      const args = _parseArguments(options, callback), opts = args[0], cb = args[1];
      tmpName(opts, /* @__PURE__ */ __name(function _tmpNameCreated(err, name) {
        if (err)
          return cb(err);
        fs.open(name, CREATE_FLAGS, opts.mode || FILE_MODE, /* @__PURE__ */ __name(function _fileCreated(err2, fd) {
          if (err2)
            return cb(err2);
          if (opts.discardDescriptor) {
            return fs.close(fd, /* @__PURE__ */ __name(function _discardCallback(possibleErr) {
              return cb(possibleErr, name, void 0, _prepareTmpFileRemoveCallback(name, -1, opts, false));
            }, "_discardCallback"));
          } else {
            const discardOrDetachDescriptor = opts.discardDescriptor || opts.detachDescriptor;
            cb(null, name, fd, _prepareTmpFileRemoveCallback(name, discardOrDetachDescriptor ? -1 : fd, opts, false));
          }
        }, "_fileCreated"));
      }, "_tmpNameCreated"));
    }
    __name(file, "file");
    function fileSync(options) {
      const args = _parseArguments(options), opts = args[0];
      const discardOrDetachDescriptor = opts.discardDescriptor || opts.detachDescriptor;
      const name = tmpNameSync(opts);
      var fd = fs.openSync(name, CREATE_FLAGS, opts.mode || FILE_MODE);
      if (opts.discardDescriptor) {
        fs.closeSync(fd);
        fd = void 0;
      }
      return {
        name,
        fd,
        removeCallback: _prepareTmpFileRemoveCallback(name, discardOrDetachDescriptor ? -1 : fd, opts, true)
      };
    }
    __name(fileSync, "fileSync");
    function dir(options, callback) {
      const args = _parseArguments(options, callback), opts = args[0], cb = args[1];
      tmpName(opts, /* @__PURE__ */ __name(function _tmpNameCreated(err, name) {
        if (err)
          return cb(err);
        fs.mkdir(name, opts.mode || DIR_MODE, /* @__PURE__ */ __name(function _dirCreated(err2) {
          if (err2)
            return cb(err2);
          cb(null, name, _prepareTmpDirRemoveCallback(name, opts, false));
        }, "_dirCreated"));
      }, "_tmpNameCreated"));
    }
    __name(dir, "dir");
    function dirSync(options) {
      const args = _parseArguments(options), opts = args[0];
      const name = tmpNameSync(opts);
      fs.mkdirSync(name, opts.mode || DIR_MODE);
      return {
        name,
        removeCallback: _prepareTmpDirRemoveCallback(name, opts, true)
      };
    }
    __name(dirSync, "dirSync");
    function _removeFileAsync(fdPath, next) {
      const _handler = /* @__PURE__ */ __name(function(err) {
        if (err && !_isENOENT(err)) {
          return next(err);
        }
        next();
      }, "_handler");
      if (0 <= fdPath[0])
        fs.close(fdPath[0], function() {
          fs.unlink(fdPath[1], _handler);
        });
      else
        fs.unlink(fdPath[1], _handler);
    }
    __name(_removeFileAsync, "_removeFileAsync");
    function _removeFileSync(fdPath) {
      let rethrownException = null;
      try {
        if (0 <= fdPath[0])
          fs.closeSync(fdPath[0]);
      } catch (e) {
        if (!_isEBADF(e) && !_isENOENT(e))
          throw e;
      } finally {
        try {
          fs.unlinkSync(fdPath[1]);
        } catch (e) {
          if (!_isENOENT(e))
            rethrownException = e;
        }
      }
      if (rethrownException !== null) {
        throw rethrownException;
      }
    }
    __name(_removeFileSync, "_removeFileSync");
    function _prepareTmpFileRemoveCallback(name, fd, opts, sync) {
      const removeCallbackSync = _prepareRemoveCallback(_removeFileSync, [fd, name], sync);
      const removeCallback = _prepareRemoveCallback(_removeFileAsync, [fd, name], sync, removeCallbackSync);
      if (!opts.keep)
        _removeObjects.unshift(removeCallbackSync);
      return sync ? removeCallbackSync : removeCallback;
    }
    __name(_prepareTmpFileRemoveCallback, "_prepareTmpFileRemoveCallback");
    function _prepareTmpDirRemoveCallback(name, opts, sync) {
      const removeFunction = opts.unsafeCleanup ? rimraf : fs.rmdir.bind(fs);
      const removeFunctionSync = opts.unsafeCleanup ? FN_RIMRAF_SYNC : FN_RMDIR_SYNC;
      const removeCallbackSync = _prepareRemoveCallback(removeFunctionSync, name, sync);
      const removeCallback = _prepareRemoveCallback(removeFunction, name, sync, removeCallbackSync);
      if (!opts.keep)
        _removeObjects.unshift(removeCallbackSync);
      return sync ? removeCallbackSync : removeCallback;
    }
    __name(_prepareTmpDirRemoveCallback, "_prepareTmpDirRemoveCallback");
    function _prepareRemoveCallback(removeFunction, fileOrDirName, sync, cleanupCallbackSync) {
      let called = false;
      return /* @__PURE__ */ __name(function _cleanupCallback(next) {
        if (!called) {
          const toRemove = cleanupCallbackSync || _cleanupCallback;
          const index = _removeObjects.indexOf(toRemove);
          if (index >= 0)
            _removeObjects.splice(index, 1);
          called = true;
          if (sync || removeFunction === FN_RMDIR_SYNC || removeFunction === FN_RIMRAF_SYNC) {
            return removeFunction(fileOrDirName);
          } else {
            return removeFunction(fileOrDirName, next || function() {
            });
          }
        }
      }, "_cleanupCallback");
    }
    __name(_prepareRemoveCallback, "_prepareRemoveCallback");
    function _garbageCollector() {
      if (!_gracefulCleanup)
        return;
      while (_removeObjects.length) {
        try {
          _removeObjects[0]();
        } catch (e) {
        }
      }
    }
    __name(_garbageCollector, "_garbageCollector");
    function _randomChars(howMany) {
      let value = [], rnd = null;
      try {
        rnd = crypto4.randomBytes(howMany);
      } catch (e) {
        rnd = crypto4.pseudoRandomBytes(howMany);
      }
      for (var i = 0; i < howMany; i++) {
        value.push(RANDOM_CHARS[rnd[i] % RANDOM_CHARS.length]);
      }
      return value.join("");
    }
    __name(_randomChars, "_randomChars");
    function _isBlank(s) {
      return s === null || _isUndefined(s) || !s.trim();
    }
    __name(_isBlank, "_isBlank");
    function _isUndefined(obj) {
      return typeof obj === "undefined";
    }
    __name(_isUndefined, "_isUndefined");
    function _parseArguments(options, callback) {
      if (typeof options === "function") {
        return [{}, options];
      }
      if (_isUndefined(options)) {
        return [{}, callback];
      }
      const actualOptions = {};
      for (const key of Object.getOwnPropertyNames(options)) {
        actualOptions[key] = options[key];
      }
      return [actualOptions, callback];
    }
    __name(_parseArguments, "_parseArguments");
    function _generateTmpName(opts) {
      const tmpDir = opts.tmpdir;
      if (!_isUndefined(opts.name))
        return path3.join(tmpDir, opts.dir, opts.name);
      if (!_isUndefined(opts.template))
        return path3.join(tmpDir, opts.dir, opts.template).replace(TEMPLATE_PATTERN, _randomChars(6));
      const name = [
        opts.prefix ? opts.prefix : "tmp",
        "-",
        process.pid,
        "-",
        _randomChars(12),
        opts.postfix ? "-" + opts.postfix : ""
      ].join("");
      return path3.join(tmpDir, opts.dir, name);
    }
    __name(_generateTmpName, "_generateTmpName");
    function _assertAndSanitizeOptions(options) {
      options.tmpdir = _getTmpDir(options);
      const tmpDir = options.tmpdir;
      if (!_isUndefined(options.name))
        _assertIsRelative(options.name, "name", tmpDir);
      if (!_isUndefined(options.dir))
        _assertIsRelative(options.dir, "dir", tmpDir);
      if (!_isUndefined(options.template)) {
        _assertIsRelative(options.template, "template", tmpDir);
        if (!options.template.match(TEMPLATE_PATTERN))
          throw new Error(`Invalid template, found "${options.template}".`);
      }
      if (!_isUndefined(options.tries) && isNaN(options.tries) || options.tries < 0)
        throw new Error(`Invalid tries, found "${options.tries}".`);
      options.tries = _isUndefined(options.name) ? options.tries || DEFAULT_TRIES : 1;
      options.keep = !!options.keep;
      options.detachDescriptor = !!options.detachDescriptor;
      options.discardDescriptor = !!options.discardDescriptor;
      options.unsafeCleanup = !!options.unsafeCleanup;
      options.dir = _isUndefined(options.dir) ? "" : path3.relative(tmpDir, _resolvePath(options.dir, tmpDir));
      options.template = _isUndefined(options.template) ? void 0 : path3.relative(tmpDir, _resolvePath(options.template, tmpDir));
      options.template = _isBlank(options.template) ? void 0 : path3.relative(options.dir, options.template);
      options.name = _isUndefined(options.name) ? void 0 : _sanitizeName(options.name);
      options.prefix = _isUndefined(options.prefix) ? "" : options.prefix;
      options.postfix = _isUndefined(options.postfix) ? "" : options.postfix;
    }
    __name(_assertAndSanitizeOptions, "_assertAndSanitizeOptions");
    function _resolvePath(name, tmpDir) {
      const sanitizedName = _sanitizeName(name);
      if (sanitizedName.startsWith(tmpDir)) {
        return path3.resolve(sanitizedName);
      } else {
        return path3.resolve(path3.join(tmpDir, sanitizedName));
      }
    }
    __name(_resolvePath, "_resolvePath");
    function _sanitizeName(name) {
      if (_isBlank(name)) {
        return name;
      }
      return name.replace(/["']/g, "");
    }
    __name(_sanitizeName, "_sanitizeName");
    function _assertIsRelative(name, option, tmpDir) {
      if (option === "name") {
        if (path3.isAbsolute(name))
          throw new Error(`${option} option must not contain an absolute path, found "${name}".`);
        let basename = path3.basename(name);
        if (basename === ".." || basename === "." || basename !== name)
          throw new Error(`${option} option must not contain a path, found "${name}".`);
      } else {
        if (path3.isAbsolute(name) && !name.startsWith(tmpDir)) {
          throw new Error(`${option} option must be relative to "${tmpDir}", found "${name}".`);
        }
        let resolvedPath = _resolvePath(name, tmpDir);
        if (!resolvedPath.startsWith(tmpDir))
          throw new Error(`${option} option must be relative to "${tmpDir}", found "${resolvedPath}".`);
      }
    }
    __name(_assertIsRelative, "_assertIsRelative");
    function _isEBADF(error2) {
      return _isExpectedError(error2, -EBADF, "EBADF");
    }
    __name(_isEBADF, "_isEBADF");
    function _isENOENT(error2) {
      return _isExpectedError(error2, -ENOENT, "ENOENT");
    }
    __name(_isENOENT, "_isENOENT");
    function _isExpectedError(error2, errno, code) {
      return IS_WIN32 ? error2.code === code : error2.code === code && error2.errno === errno;
    }
    __name(_isExpectedError, "_isExpectedError");
    function setGracefulCleanup() {
      _gracefulCleanup = true;
    }
    __name(setGracefulCleanup, "setGracefulCleanup");
    function _getTmpDir(options) {
      return path3.resolve(_sanitizeName(options && options.tmpdir || os2.tmpdir()));
    }
    __name(_getTmpDir, "_getTmpDir");
    process.addListener(EXIT, _garbageCollector);
    Object.defineProperty(module.exports, "tmpdir", {
      enumerable: true,
      configurable: false,
      get: function() {
        return _getTmpDir();
      }
    });
    module.exports.dir = dir;
    module.exports.dirSync = dirSync;
    module.exports.file = file;
    module.exports.fileSync = fileSync;
    module.exports.tmpName = tmpName;
    module.exports.tmpNameSync = tmpNameSync;
    module.exports.setGracefulCleanup = setGracefulCleanup;
  }
});

// node_modules/.pnpm/tmp-promise@3.0.3/node_modules/tmp-promise/index.js
var require_tmp_promise = __commonJS({
  "node_modules/.pnpm/tmp-promise@3.0.3/node_modules/tmp-promise/index.js"(exports, module) {
    "use strict";
    var { promisify } = __require("util");
    var tmp = require_tmp();
    module.exports.fileSync = tmp.fileSync;
    var fileWithOptions = promisify(
      (options, cb) => tmp.file(
        options,
        (err, path3, fd, cleanup) => err ? cb(err) : cb(void 0, { path: path3, fd, cleanup: promisify(cleanup) })
      )
    );
    module.exports.file = async (options) => fileWithOptions(options);
    module.exports.withFile = /* @__PURE__ */ __name(async function withFile(fn, options) {
      const { path: path3, fd, cleanup } = await module.exports.file(options);
      try {
        return await fn({ path: path3, fd });
      } finally {
        await cleanup();
      }
    }, "withFile");
    module.exports.dirSync = tmp.dirSync;
    var dirWithOptions = promisify(
      (options, cb) => tmp.dir(
        options,
        (err, path3, cleanup) => err ? cb(err) : cb(void 0, { path: path3, cleanup: promisify(cleanup) })
      )
    );
    module.exports.dir = async (options) => dirWithOptions(options);
    module.exports.withDir = /* @__PURE__ */ __name(async function withDir(fn, options) {
      const { path: path3, cleanup } = await module.exports.dir(options);
      try {
        return await fn({ path: path3 });
      } finally {
        await cleanup();
      }
    }, "withDir");
    module.exports.tmpNameSync = tmp.tmpNameSync;
    module.exports.tmpName = promisify(tmp.tmpName);
    module.exports.tmpdir = tmp.tmpdir;
    module.exports.setGracefulCleanup = tmp.setGracefulCleanup;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/config-variables.js
var require_config_variables = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/config-variables.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRetentionDays = exports.getWorkSpaceDirectory = exports.getWorkFlowRunId = exports.getRuntimeUrl = exports.getRuntimeToken = exports.getDownloadFileConcurrency = exports.getInitialRetryIntervalInMilliseconds = exports.getRetryMultiplier = exports.getRetryLimit = exports.getUploadChunkSize = exports.getUploadFileConcurrency = void 0;
    function getUploadFileConcurrency() {
      return 2;
    }
    __name(getUploadFileConcurrency, "getUploadFileConcurrency");
    exports.getUploadFileConcurrency = getUploadFileConcurrency;
    function getUploadChunkSize() {
      return 8 * 1024 * 1024;
    }
    __name(getUploadChunkSize, "getUploadChunkSize");
    exports.getUploadChunkSize = getUploadChunkSize;
    function getRetryLimit() {
      return 5;
    }
    __name(getRetryLimit, "getRetryLimit");
    exports.getRetryLimit = getRetryLimit;
    function getRetryMultiplier() {
      return 1.5;
    }
    __name(getRetryMultiplier, "getRetryMultiplier");
    exports.getRetryMultiplier = getRetryMultiplier;
    function getInitialRetryIntervalInMilliseconds() {
      return 3e3;
    }
    __name(getInitialRetryIntervalInMilliseconds, "getInitialRetryIntervalInMilliseconds");
    exports.getInitialRetryIntervalInMilliseconds = getInitialRetryIntervalInMilliseconds;
    function getDownloadFileConcurrency() {
      return 2;
    }
    __name(getDownloadFileConcurrency, "getDownloadFileConcurrency");
    exports.getDownloadFileConcurrency = getDownloadFileConcurrency;
    function getRuntimeToken() {
      const token = process.env["ACTIONS_RUNTIME_TOKEN"];
      if (!token) {
        throw new Error("Unable to get ACTIONS_RUNTIME_TOKEN env variable");
      }
      return token;
    }
    __name(getRuntimeToken, "getRuntimeToken");
    exports.getRuntimeToken = getRuntimeToken;
    function getRuntimeUrl() {
      const runtimeUrl = process.env["ACTIONS_RUNTIME_URL"];
      if (!runtimeUrl) {
        throw new Error("Unable to get ACTIONS_RUNTIME_URL env variable");
      }
      return runtimeUrl;
    }
    __name(getRuntimeUrl, "getRuntimeUrl");
    exports.getRuntimeUrl = getRuntimeUrl;
    function getWorkFlowRunId() {
      const workFlowRunId = process.env["GITHUB_RUN_ID"];
      if (!workFlowRunId) {
        throw new Error("Unable to get GITHUB_RUN_ID env variable");
      }
      return workFlowRunId;
    }
    __name(getWorkFlowRunId, "getWorkFlowRunId");
    exports.getWorkFlowRunId = getWorkFlowRunId;
    function getWorkSpaceDirectory() {
      const workspaceDirectory = process.env["GITHUB_WORKSPACE"];
      if (!workspaceDirectory) {
        throw new Error("Unable to get GITHUB_WORKSPACE env variable");
      }
      return workspaceDirectory;
    }
    __name(getWorkSpaceDirectory, "getWorkSpaceDirectory");
    exports.getWorkSpaceDirectory = getWorkSpaceDirectory;
    function getRetentionDays() {
      return process.env["GITHUB_RETENTION_DAYS"];
    }
    __name(getRetentionDays, "getRetentionDays");
    exports.getRetentionDays = getRetentionDays;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/crc64.js
var require_crc64 = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/crc64.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PREGEN_POLY_TABLE = [
      BigInt("0x0000000000000000"),
      BigInt("0x7F6EF0C830358979"),
      BigInt("0xFEDDE190606B12F2"),
      BigInt("0x81B31158505E9B8B"),
      BigInt("0xC962E5739841B68F"),
      BigInt("0xB60C15BBA8743FF6"),
      BigInt("0x37BF04E3F82AA47D"),
      BigInt("0x48D1F42BC81F2D04"),
      BigInt("0xA61CECB46814FE75"),
      BigInt("0xD9721C7C5821770C"),
      BigInt("0x58C10D24087FEC87"),
      BigInt("0x27AFFDEC384A65FE"),
      BigInt("0x6F7E09C7F05548FA"),
      BigInt("0x1010F90FC060C183"),
      BigInt("0x91A3E857903E5A08"),
      BigInt("0xEECD189FA00BD371"),
      BigInt("0x78E0FF3B88BE6F81"),
      BigInt("0x078E0FF3B88BE6F8"),
      BigInt("0x863D1EABE8D57D73"),
      BigInt("0xF953EE63D8E0F40A"),
      BigInt("0xB1821A4810FFD90E"),
      BigInt("0xCEECEA8020CA5077"),
      BigInt("0x4F5FFBD87094CBFC"),
      BigInt("0x30310B1040A14285"),
      BigInt("0xDEFC138FE0AA91F4"),
      BigInt("0xA192E347D09F188D"),
      BigInt("0x2021F21F80C18306"),
      BigInt("0x5F4F02D7B0F40A7F"),
      BigInt("0x179EF6FC78EB277B"),
      BigInt("0x68F0063448DEAE02"),
      BigInt("0xE943176C18803589"),
      BigInt("0x962DE7A428B5BCF0"),
      BigInt("0xF1C1FE77117CDF02"),
      BigInt("0x8EAF0EBF2149567B"),
      BigInt("0x0F1C1FE77117CDF0"),
      BigInt("0x7072EF2F41224489"),
      BigInt("0x38A31B04893D698D"),
      BigInt("0x47CDEBCCB908E0F4"),
      BigInt("0xC67EFA94E9567B7F"),
      BigInt("0xB9100A5CD963F206"),
      BigInt("0x57DD12C379682177"),
      BigInt("0x28B3E20B495DA80E"),
      BigInt("0xA900F35319033385"),
      BigInt("0xD66E039B2936BAFC"),
      BigInt("0x9EBFF7B0E12997F8"),
      BigInt("0xE1D10778D11C1E81"),
      BigInt("0x606216208142850A"),
      BigInt("0x1F0CE6E8B1770C73"),
      BigInt("0x8921014C99C2B083"),
      BigInt("0xF64FF184A9F739FA"),
      BigInt("0x77FCE0DCF9A9A271"),
      BigInt("0x08921014C99C2B08"),
      BigInt("0x4043E43F0183060C"),
      BigInt("0x3F2D14F731B68F75"),
      BigInt("0xBE9E05AF61E814FE"),
      BigInt("0xC1F0F56751DD9D87"),
      BigInt("0x2F3DEDF8F1D64EF6"),
      BigInt("0x50531D30C1E3C78F"),
      BigInt("0xD1E00C6891BD5C04"),
      BigInt("0xAE8EFCA0A188D57D"),
      BigInt("0xE65F088B6997F879"),
      BigInt("0x9931F84359A27100"),
      BigInt("0x1882E91B09FCEA8B"),
      BigInt("0x67EC19D339C963F2"),
      BigInt("0xD75ADABD7A6E2D6F"),
      BigInt("0xA8342A754A5BA416"),
      BigInt("0x29873B2D1A053F9D"),
      BigInt("0x56E9CBE52A30B6E4"),
      BigInt("0x1E383FCEE22F9BE0"),
      BigInt("0x6156CF06D21A1299"),
      BigInt("0xE0E5DE5E82448912"),
      BigInt("0x9F8B2E96B271006B"),
      BigInt("0x71463609127AD31A"),
      BigInt("0x0E28C6C1224F5A63"),
      BigInt("0x8F9BD7997211C1E8"),
      BigInt("0xF0F5275142244891"),
      BigInt("0xB824D37A8A3B6595"),
      BigInt("0xC74A23B2BA0EECEC"),
      BigInt("0x46F932EAEA507767"),
      BigInt("0x3997C222DA65FE1E"),
      BigInt("0xAFBA2586F2D042EE"),
      BigInt("0xD0D4D54EC2E5CB97"),
      BigInt("0x5167C41692BB501C"),
      BigInt("0x2E0934DEA28ED965"),
      BigInt("0x66D8C0F56A91F461"),
      BigInt("0x19B6303D5AA47D18"),
      BigInt("0x980521650AFAE693"),
      BigInt("0xE76BD1AD3ACF6FEA"),
      BigInt("0x09A6C9329AC4BC9B"),
      BigInt("0x76C839FAAAF135E2"),
      BigInt("0xF77B28A2FAAFAE69"),
      BigInt("0x8815D86ACA9A2710"),
      BigInt("0xC0C42C4102850A14"),
      BigInt("0xBFAADC8932B0836D"),
      BigInt("0x3E19CDD162EE18E6"),
      BigInt("0x41773D1952DB919F"),
      BigInt("0x269B24CA6B12F26D"),
      BigInt("0x59F5D4025B277B14"),
      BigInt("0xD846C55A0B79E09F"),
      BigInt("0xA72835923B4C69E6"),
      BigInt("0xEFF9C1B9F35344E2"),
      BigInt("0x90973171C366CD9B"),
      BigInt("0x1124202993385610"),
      BigInt("0x6E4AD0E1A30DDF69"),
      BigInt("0x8087C87E03060C18"),
      BigInt("0xFFE938B633338561"),
      BigInt("0x7E5A29EE636D1EEA"),
      BigInt("0x0134D92653589793"),
      BigInt("0x49E52D0D9B47BA97"),
      BigInt("0x368BDDC5AB7233EE"),
      BigInt("0xB738CC9DFB2CA865"),
      BigInt("0xC8563C55CB19211C"),
      BigInt("0x5E7BDBF1E3AC9DEC"),
      BigInt("0x21152B39D3991495"),
      BigInt("0xA0A63A6183C78F1E"),
      BigInt("0xDFC8CAA9B3F20667"),
      BigInt("0x97193E827BED2B63"),
      BigInt("0xE877CE4A4BD8A21A"),
      BigInt("0x69C4DF121B863991"),
      BigInt("0x16AA2FDA2BB3B0E8"),
      BigInt("0xF86737458BB86399"),
      BigInt("0x8709C78DBB8DEAE0"),
      BigInt("0x06BAD6D5EBD3716B"),
      BigInt("0x79D4261DDBE6F812"),
      BigInt("0x3105D23613F9D516"),
      BigInt("0x4E6B22FE23CC5C6F"),
      BigInt("0xCFD833A67392C7E4"),
      BigInt("0xB0B6C36E43A74E9D"),
      BigInt("0x9A6C9329AC4BC9B5"),
      BigInt("0xE50263E19C7E40CC"),
      BigInt("0x64B172B9CC20DB47"),
      BigInt("0x1BDF8271FC15523E"),
      BigInt("0x530E765A340A7F3A"),
      BigInt("0x2C608692043FF643"),
      BigInt("0xADD397CA54616DC8"),
      BigInt("0xD2BD67026454E4B1"),
      BigInt("0x3C707F9DC45F37C0"),
      BigInt("0x431E8F55F46ABEB9"),
      BigInt("0xC2AD9E0DA4342532"),
      BigInt("0xBDC36EC59401AC4B"),
      BigInt("0xF5129AEE5C1E814F"),
      BigInt("0x8A7C6A266C2B0836"),
      BigInt("0x0BCF7B7E3C7593BD"),
      BigInt("0x74A18BB60C401AC4"),
      BigInt("0xE28C6C1224F5A634"),
      BigInt("0x9DE29CDA14C02F4D"),
      BigInt("0x1C518D82449EB4C6"),
      BigInt("0x633F7D4A74AB3DBF"),
      BigInt("0x2BEE8961BCB410BB"),
      BigInt("0x548079A98C8199C2"),
      BigInt("0xD53368F1DCDF0249"),
      BigInt("0xAA5D9839ECEA8B30"),
      BigInt("0x449080A64CE15841"),
      BigInt("0x3BFE706E7CD4D138"),
      BigInt("0xBA4D61362C8A4AB3"),
      BigInt("0xC52391FE1CBFC3CA"),
      BigInt("0x8DF265D5D4A0EECE"),
      BigInt("0xF29C951DE49567B7"),
      BigInt("0x732F8445B4CBFC3C"),
      BigInt("0x0C41748D84FE7545"),
      BigInt("0x6BAD6D5EBD3716B7"),
      BigInt("0x14C39D968D029FCE"),
      BigInt("0x95708CCEDD5C0445"),
      BigInt("0xEA1E7C06ED698D3C"),
      BigInt("0xA2CF882D2576A038"),
      BigInt("0xDDA178E515432941"),
      BigInt("0x5C1269BD451DB2CA"),
      BigInt("0x237C997575283BB3"),
      BigInt("0xCDB181EAD523E8C2"),
      BigInt("0xB2DF7122E51661BB"),
      BigInt("0x336C607AB548FA30"),
      BigInt("0x4C0290B2857D7349"),
      BigInt("0x04D364994D625E4D"),
      BigInt("0x7BBD94517D57D734"),
      BigInt("0xFA0E85092D094CBF"),
      BigInt("0x856075C11D3CC5C6"),
      BigInt("0x134D926535897936"),
      BigInt("0x6C2362AD05BCF04F"),
      BigInt("0xED9073F555E26BC4"),
      BigInt("0x92FE833D65D7E2BD"),
      BigInt("0xDA2F7716ADC8CFB9"),
      BigInt("0xA54187DE9DFD46C0"),
      BigInt("0x24F29686CDA3DD4B"),
      BigInt("0x5B9C664EFD965432"),
      BigInt("0xB5517ED15D9D8743"),
      BigInt("0xCA3F8E196DA80E3A"),
      BigInt("0x4B8C9F413DF695B1"),
      BigInt("0x34E26F890DC31CC8"),
      BigInt("0x7C339BA2C5DC31CC"),
      BigInt("0x035D6B6AF5E9B8B5"),
      BigInt("0x82EE7A32A5B7233E"),
      BigInt("0xFD808AFA9582AA47"),
      BigInt("0x4D364994D625E4DA"),
      BigInt("0x3258B95CE6106DA3"),
      BigInt("0xB3EBA804B64EF628"),
      BigInt("0xCC8558CC867B7F51"),
      BigInt("0x8454ACE74E645255"),
      BigInt("0xFB3A5C2F7E51DB2C"),
      BigInt("0x7A894D772E0F40A7"),
      BigInt("0x05E7BDBF1E3AC9DE"),
      BigInt("0xEB2AA520BE311AAF"),
      BigInt("0x944455E88E0493D6"),
      BigInt("0x15F744B0DE5A085D"),
      BigInt("0x6A99B478EE6F8124"),
      BigInt("0x224840532670AC20"),
      BigInt("0x5D26B09B16452559"),
      BigInt("0xDC95A1C3461BBED2"),
      BigInt("0xA3FB510B762E37AB"),
      BigInt("0x35D6B6AF5E9B8B5B"),
      BigInt("0x4AB846676EAE0222"),
      BigInt("0xCB0B573F3EF099A9"),
      BigInt("0xB465A7F70EC510D0"),
      BigInt("0xFCB453DCC6DA3DD4"),
      BigInt("0x83DAA314F6EFB4AD"),
      BigInt("0x0269B24CA6B12F26"),
      BigInt("0x7D0742849684A65F"),
      BigInt("0x93CA5A1B368F752E"),
      BigInt("0xECA4AAD306BAFC57"),
      BigInt("0x6D17BB8B56E467DC"),
      BigInt("0x12794B4366D1EEA5"),
      BigInt("0x5AA8BF68AECEC3A1"),
      BigInt("0x25C64FA09EFB4AD8"),
      BigInt("0xA4755EF8CEA5D153"),
      BigInt("0xDB1BAE30FE90582A"),
      BigInt("0xBCF7B7E3C7593BD8"),
      BigInt("0xC399472BF76CB2A1"),
      BigInt("0x422A5673A732292A"),
      BigInt("0x3D44A6BB9707A053"),
      BigInt("0x759552905F188D57"),
      BigInt("0x0AFBA2586F2D042E"),
      BigInt("0x8B48B3003F739FA5"),
      BigInt("0xF42643C80F4616DC"),
      BigInt("0x1AEB5B57AF4DC5AD"),
      BigInt("0x6585AB9F9F784CD4"),
      BigInt("0xE436BAC7CF26D75F"),
      BigInt("0x9B584A0FFF135E26"),
      BigInt("0xD389BE24370C7322"),
      BigInt("0xACE74EEC0739FA5B"),
      BigInt("0x2D545FB4576761D0"),
      BigInt("0x523AAF7C6752E8A9"),
      BigInt("0xC41748D84FE75459"),
      BigInt("0xBB79B8107FD2DD20"),
      BigInt("0x3ACAA9482F8C46AB"),
      BigInt("0x45A459801FB9CFD2"),
      BigInt("0x0D75ADABD7A6E2D6"),
      BigInt("0x721B5D63E7936BAF"),
      BigInt("0xF3A84C3BB7CDF024"),
      BigInt("0x8CC6BCF387F8795D"),
      BigInt("0x620BA46C27F3AA2C"),
      BigInt("0x1D6554A417C62355"),
      BigInt("0x9CD645FC4798B8DE"),
      BigInt("0xE3B8B53477AD31A7"),
      BigInt("0xAB69411FBFB21CA3"),
      BigInt("0xD407B1D78F8795DA"),
      BigInt("0x55B4A08FDFD90E51"),
      BigInt("0x2ADA5047EFEC8728")
    ];
    var CRC64 = class _CRC64 {
      static {
        __name(this, "CRC64");
      }
      constructor() {
        this._crc = BigInt(0);
      }
      update(data) {
        const buffer = typeof data === "string" ? Buffer.from(data) : data;
        let crc = _CRC64.flip64Bits(this._crc);
        for (const dataByte of buffer) {
          const crcByte = Number(crc & BigInt(255));
          crc = PREGEN_POLY_TABLE[crcByte ^ dataByte] ^ crc >> BigInt(8);
        }
        this._crc = _CRC64.flip64Bits(crc);
      }
      digest(encoding) {
        switch (encoding) {
          case "hex":
            return this._crc.toString(16).toUpperCase();
          case "base64":
            return this.toBuffer().toString("base64");
          default:
            return this.toBuffer();
        }
      }
      toBuffer() {
        return Buffer.from([0, 8, 16, 24, 32, 40, 48, 56].map((s) => Number(this._crc >> BigInt(s) & BigInt(255))));
      }
      static flip64Bits(n) {
        return (BigInt(1) << BigInt(64)) - BigInt(1) - n;
      }
    };
    exports.default = CRC64;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/utils.js
var require_utils2 = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/utils.js"(exports) {
    "use strict";
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.digestForStream = exports.sleep = exports.getProperRetention = exports.rmFile = exports.getFileSize = exports.createEmptyFilesForArtifact = exports.createDirectoriesForArtifact = exports.displayHttpDiagnostics = exports.getArtifactUrl = exports.createHttpClient = exports.getUploadHeaders = exports.getDownloadHeaders = exports.getContentRange = exports.tryGetRetryAfterValueTimeInMilliseconds = exports.isThrottledStatusCode = exports.isRetryableStatusCode = exports.isForbiddenStatusCode = exports.isSuccessStatusCode = exports.getApiVersion = exports.parseEnvNumber = exports.getExponentialRetryTimeInMilliseconds = void 0;
    var crypto_1 = __importDefault(__require("crypto"));
    var fs_1 = __require("fs");
    var core_1 = require_core();
    var http_client_1 = require_lib();
    var auth_1 = require_auth();
    var config_variables_1 = require_config_variables();
    var crc64_1 = __importDefault(require_crc64());
    function getExponentialRetryTimeInMilliseconds(retryCount) {
      if (retryCount < 0) {
        throw new Error("RetryCount should not be negative");
      } else if (retryCount === 0) {
        return config_variables_1.getInitialRetryIntervalInMilliseconds();
      }
      const minTime = config_variables_1.getInitialRetryIntervalInMilliseconds() * config_variables_1.getRetryMultiplier() * retryCount;
      const maxTime = minTime * config_variables_1.getRetryMultiplier();
      return Math.trunc(Math.random() * (maxTime - minTime) + minTime);
    }
    __name(getExponentialRetryTimeInMilliseconds, "getExponentialRetryTimeInMilliseconds");
    exports.getExponentialRetryTimeInMilliseconds = getExponentialRetryTimeInMilliseconds;
    function parseEnvNumber(key) {
      const value = Number(process.env[key]);
      if (Number.isNaN(value) || value < 0) {
        return void 0;
      }
      return value;
    }
    __name(parseEnvNumber, "parseEnvNumber");
    exports.parseEnvNumber = parseEnvNumber;
    function getApiVersion() {
      return "6.0-preview";
    }
    __name(getApiVersion, "getApiVersion");
    exports.getApiVersion = getApiVersion;
    function isSuccessStatusCode(statusCode) {
      if (!statusCode) {
        return false;
      }
      return statusCode >= 200 && statusCode < 300;
    }
    __name(isSuccessStatusCode, "isSuccessStatusCode");
    exports.isSuccessStatusCode = isSuccessStatusCode;
    function isForbiddenStatusCode(statusCode) {
      if (!statusCode) {
        return false;
      }
      return statusCode === http_client_1.HttpCodes.Forbidden;
    }
    __name(isForbiddenStatusCode, "isForbiddenStatusCode");
    exports.isForbiddenStatusCode = isForbiddenStatusCode;
    function isRetryableStatusCode(statusCode) {
      if (!statusCode) {
        return false;
      }
      const retryableStatusCodes = [
        http_client_1.HttpCodes.BadGateway,
        http_client_1.HttpCodes.GatewayTimeout,
        http_client_1.HttpCodes.InternalServerError,
        http_client_1.HttpCodes.ServiceUnavailable,
        http_client_1.HttpCodes.TooManyRequests,
        413
        // Payload Too Large
      ];
      return retryableStatusCodes.includes(statusCode);
    }
    __name(isRetryableStatusCode, "isRetryableStatusCode");
    exports.isRetryableStatusCode = isRetryableStatusCode;
    function isThrottledStatusCode(statusCode) {
      if (!statusCode) {
        return false;
      }
      return statusCode === http_client_1.HttpCodes.TooManyRequests;
    }
    __name(isThrottledStatusCode, "isThrottledStatusCode");
    exports.isThrottledStatusCode = isThrottledStatusCode;
    function tryGetRetryAfterValueTimeInMilliseconds(headers) {
      if (headers["retry-after"]) {
        const retryTime = Number(headers["retry-after"]);
        if (!isNaN(retryTime)) {
          core_1.info(`Retry-After header is present with a value of ${retryTime}`);
          return retryTime * 1e3;
        }
        core_1.info(`Returned retry-after header value: ${retryTime} is non-numeric and cannot be used`);
        return void 0;
      }
      core_1.info(`No retry-after header was found. Dumping all headers for diagnostic purposes`);
      console.log(headers);
      return void 0;
    }
    __name(tryGetRetryAfterValueTimeInMilliseconds, "tryGetRetryAfterValueTimeInMilliseconds");
    exports.tryGetRetryAfterValueTimeInMilliseconds = tryGetRetryAfterValueTimeInMilliseconds;
    function getContentRange(start, end, total) {
      return `bytes ${start}-${end}/${total}`;
    }
    __name(getContentRange, "getContentRange");
    exports.getContentRange = getContentRange;
    function getDownloadHeaders(contentType, isKeepAlive, acceptGzip) {
      const requestOptions = {};
      if (contentType) {
        requestOptions["Content-Type"] = contentType;
      }
      if (isKeepAlive) {
        requestOptions["Connection"] = "Keep-Alive";
        requestOptions["Keep-Alive"] = "10";
      }
      if (acceptGzip) {
        requestOptions["Accept-Encoding"] = "gzip";
        requestOptions["Accept"] = `application/octet-stream;api-version=${getApiVersion()}`;
      } else {
        requestOptions["Accept"] = `application/json;api-version=${getApiVersion()}`;
      }
      return requestOptions;
    }
    __name(getDownloadHeaders, "getDownloadHeaders");
    exports.getDownloadHeaders = getDownloadHeaders;
    function getUploadHeaders(contentType, isKeepAlive, isGzip, uncompressedLength, contentLength, contentRange, digest) {
      const requestOptions = {};
      requestOptions["Accept"] = `application/json;api-version=${getApiVersion()}`;
      if (contentType) {
        requestOptions["Content-Type"] = contentType;
      }
      if (isKeepAlive) {
        requestOptions["Connection"] = "Keep-Alive";
        requestOptions["Keep-Alive"] = "10";
      }
      if (isGzip) {
        requestOptions["Content-Encoding"] = "gzip";
        requestOptions["x-tfs-filelength"] = uncompressedLength;
      }
      if (contentLength) {
        requestOptions["Content-Length"] = contentLength;
      }
      if (contentRange) {
        requestOptions["Content-Range"] = contentRange;
      }
      if (digest) {
        requestOptions["x-actions-results-crc64"] = digest.crc64;
        requestOptions["x-actions-results-md5"] = digest.md5;
      }
      return requestOptions;
    }
    __name(getUploadHeaders, "getUploadHeaders");
    exports.getUploadHeaders = getUploadHeaders;
    function createHttpClient(userAgent) {
      return new http_client_1.HttpClient(userAgent, [
        new auth_1.BearerCredentialHandler(config_variables_1.getRuntimeToken())
      ]);
    }
    __name(createHttpClient, "createHttpClient");
    exports.createHttpClient = createHttpClient;
    function getArtifactUrl() {
      const artifactUrl = `${config_variables_1.getRuntimeUrl()}_apis/pipelines/workflows/${config_variables_1.getWorkFlowRunId()}/artifacts?api-version=${getApiVersion()}`;
      core_1.debug(`Artifact Url: ${artifactUrl}`);
      return artifactUrl;
    }
    __name(getArtifactUrl, "getArtifactUrl");
    exports.getArtifactUrl = getArtifactUrl;
    function displayHttpDiagnostics(response) {
      core_1.info(`##### Begin Diagnostic HTTP information #####
Status Code: ${response.message.statusCode}
Status Message: ${response.message.statusMessage}
Header Information: ${JSON.stringify(response.message.headers, void 0, 2)}
###### End Diagnostic HTTP information ######`);
    }
    __name(displayHttpDiagnostics, "displayHttpDiagnostics");
    exports.displayHttpDiagnostics = displayHttpDiagnostics;
    function createDirectoriesForArtifact(directories) {
      return __awaiter(this, void 0, void 0, function* () {
        for (const directory of directories) {
          yield fs_1.promises.mkdir(directory, {
            recursive: true
          });
        }
      });
    }
    __name(createDirectoriesForArtifact, "createDirectoriesForArtifact");
    exports.createDirectoriesForArtifact = createDirectoriesForArtifact;
    function createEmptyFilesForArtifact(emptyFilesToCreate) {
      return __awaiter(this, void 0, void 0, function* () {
        for (const filePath of emptyFilesToCreate) {
          yield (yield fs_1.promises.open(filePath, "w")).close();
        }
      });
    }
    __name(createEmptyFilesForArtifact, "createEmptyFilesForArtifact");
    exports.createEmptyFilesForArtifact = createEmptyFilesForArtifact;
    function getFileSize(filePath) {
      return __awaiter(this, void 0, void 0, function* () {
        const stats = yield fs_1.promises.stat(filePath);
        core_1.debug(`${filePath} size:(${stats.size}) blksize:(${stats.blksize}) blocks:(${stats.blocks})`);
        return stats.size;
      });
    }
    __name(getFileSize, "getFileSize");
    exports.getFileSize = getFileSize;
    function rmFile(filePath) {
      return __awaiter(this, void 0, void 0, function* () {
        yield fs_1.promises.unlink(filePath);
      });
    }
    __name(rmFile, "rmFile");
    exports.rmFile = rmFile;
    function getProperRetention(retentionInput, retentionSetting) {
      if (retentionInput < 0) {
        throw new Error("Invalid retention, minimum value is 1.");
      }
      let retention = retentionInput;
      if (retentionSetting) {
        const maxRetention = parseInt(retentionSetting);
        if (!isNaN(maxRetention) && maxRetention < retention) {
          core_1.warning(`Retention days is greater than the max value allowed by the repository setting, reduce retention to ${maxRetention} days`);
          retention = maxRetention;
        }
      }
      return retention;
    }
    __name(getProperRetention, "getProperRetention");
    exports.getProperRetention = getProperRetention;
    function sleep(milliseconds) {
      return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
      });
    }
    __name(sleep, "sleep");
    exports.sleep = sleep;
    function digestForStream(stream) {
      return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
          const crc64 = new crc64_1.default();
          const md52 = crypto_1.default.createHash("md5");
          stream.on("data", (data) => {
            crc64.update(data);
            md52.update(data);
          }).on("end", () => resolve({
            crc64: crc64.digest("base64"),
            md5: md52.digest("base64")
          })).on("error", reject);
        });
      });
    }
    __name(digestForStream, "digestForStream");
    exports.digestForStream = digestForStream;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/status-reporter.js
var require_status_reporter = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/status-reporter.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatusReporter = void 0;
    var core_1 = require_core();
    var StatusReporter = class {
      static {
        __name(this, "StatusReporter");
      }
      constructor(displayFrequencyInMilliseconds) {
        this.totalNumberOfFilesToProcess = 0;
        this.processedCount = 0;
        this.largeFiles = /* @__PURE__ */ new Map();
        this.totalFileStatus = void 0;
        this.displayFrequencyInMilliseconds = displayFrequencyInMilliseconds;
      }
      setTotalNumberOfFilesToProcess(fileTotal) {
        this.totalNumberOfFilesToProcess = fileTotal;
        this.processedCount = 0;
      }
      start() {
        this.totalFileStatus = setInterval(() => {
          const percentage = this.formatPercentage(this.processedCount, this.totalNumberOfFilesToProcess);
          core_1.info(`Total file count: ${this.totalNumberOfFilesToProcess} ---- Processed file #${this.processedCount} (${percentage.slice(0, percentage.indexOf(".") + 2)}%)`);
        }, this.displayFrequencyInMilliseconds);
      }
      // if there is a large file that is being uploaded in chunks, this is used to display extra information about the status of the upload
      updateLargeFileStatus(fileName, chunkStartIndex, chunkEndIndex, totalUploadFileSize) {
        const percentage = this.formatPercentage(chunkEndIndex, totalUploadFileSize);
        core_1.info(`Uploaded ${fileName} (${percentage.slice(0, percentage.indexOf(".") + 2)}%) bytes ${chunkStartIndex}:${chunkEndIndex}`);
      }
      stop() {
        if (this.totalFileStatus) {
          clearInterval(this.totalFileStatus);
        }
      }
      incrementProcessedCount() {
        this.processedCount++;
      }
      formatPercentage(numerator, denominator) {
        return (numerator / denominator * 100).toFixed(4).toString();
      }
    };
    exports.StatusReporter = StatusReporter;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/http-manager.js
var require_http_manager = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/http-manager.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HttpManager = void 0;
    var utils_1 = require_utils2();
    var HttpManager = class {
      static {
        __name(this, "HttpManager");
      }
      constructor(clientCount, userAgent) {
        if (clientCount < 1) {
          throw new Error("There must be at least one client");
        }
        this.userAgent = userAgent;
        this.clients = new Array(clientCount).fill(utils_1.createHttpClient(userAgent));
      }
      getClient(index) {
        return this.clients[index];
      }
      // client disposal is necessary if a keep-alive connection is used to properly close the connection
      // for more information see: https://github.com/actions/http-client/blob/04e5ad73cd3fd1f5610a32116b0759eddf6570d2/index.ts#L292
      disposeAndReplaceClient(index) {
        this.clients[index].dispose();
        this.clients[index] = utils_1.createHttpClient(this.userAgent);
      }
      disposeAndReplaceAllClients() {
        for (const [index] of this.clients.entries()) {
          this.disposeAndReplaceClient(index);
        }
      }
    };
    exports.HttpManager = HttpManager;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/upload-gzip.js
var require_upload_gzip = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/upload-gzip.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __asyncValues = exports && exports.__asyncValues || function(o) {
      if (!Symbol.asyncIterator)
        throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      __name(verb, "verb");
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
      __name(settle, "settle");
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createGZipFileInBuffer = exports.createGZipFileOnDisk = void 0;
    var fs = __importStar(__require("fs"));
    var zlib = __importStar(__require("zlib"));
    var util_1 = __require("util");
    var stat = util_1.promisify(fs.stat);
    var gzipExemptFileExtensions = [
      ".gzip",
      ".zip",
      ".tar.lz",
      ".tar.gz",
      ".tar.bz2",
      ".7z"
    ];
    function createGZipFileOnDisk(originalFilePath, tempFilePath) {
      return __awaiter(this, void 0, void 0, function* () {
        for (const gzipExemptExtension of gzipExemptFileExtensions) {
          if (originalFilePath.endsWith(gzipExemptExtension)) {
            return Number.MAX_SAFE_INTEGER;
          }
        }
        return new Promise((resolve, reject) => {
          const inputStream = fs.createReadStream(originalFilePath);
          const gzip = zlib.createGzip();
          const outputStream = fs.createWriteStream(tempFilePath);
          inputStream.pipe(gzip).pipe(outputStream);
          outputStream.on("finish", () => __awaiter(this, void 0, void 0, function* () {
            const size = (yield stat(tempFilePath)).size;
            resolve(size);
          }));
          outputStream.on("error", (error2) => {
            console.log(error2);
            reject;
          });
        });
      });
    }
    __name(createGZipFileOnDisk, "createGZipFileOnDisk");
    exports.createGZipFileOnDisk = createGZipFileOnDisk;
    function createGZipFileInBuffer(originalFilePath) {
      return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
          var e_1, _a;
          const inputStream = fs.createReadStream(originalFilePath);
          const gzip = zlib.createGzip();
          inputStream.pipe(gzip);
          const chunks = [];
          try {
            for (var gzip_1 = __asyncValues(gzip), gzip_1_1; gzip_1_1 = yield gzip_1.next(), !gzip_1_1.done; ) {
              const chunk = gzip_1_1.value;
              chunks.push(chunk);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (gzip_1_1 && !gzip_1_1.done && (_a = gzip_1.return))
                yield _a.call(gzip_1);
            } finally {
              if (e_1)
                throw e_1.error;
            }
          }
          resolve(Buffer.concat(chunks));
        }));
      });
    }
    __name(createGZipFileInBuffer, "createGZipFileInBuffer");
    exports.createGZipFileInBuffer = createGZipFileInBuffer;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/requestUtils.js
var require_requestUtils = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/requestUtils.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.retryHttpClientRequest = exports.retry = void 0;
    var utils_1 = require_utils2();
    var core = __importStar(require_core());
    var config_variables_1 = require_config_variables();
    function retry(name, operation, customErrorMessages, maxAttempts) {
      return __awaiter(this, void 0, void 0, function* () {
        let response = void 0;
        let statusCode = void 0;
        let isRetryable = false;
        let errorMessage = "";
        let customErrorInformation = void 0;
        let attempt = 1;
        while (attempt <= maxAttempts) {
          try {
            response = yield operation();
            statusCode = response.message.statusCode;
            if (utils_1.isSuccessStatusCode(statusCode)) {
              return response;
            }
            if (statusCode) {
              customErrorInformation = customErrorMessages.get(statusCode);
            }
            isRetryable = utils_1.isRetryableStatusCode(statusCode);
            errorMessage = `Artifact service responded with ${statusCode}`;
          } catch (error2) {
            isRetryable = true;
            errorMessage = error2.message;
          }
          if (!isRetryable) {
            core.info(`${name} - Error is not retryable`);
            if (response) {
              utils_1.displayHttpDiagnostics(response);
            }
            break;
          }
          core.info(`${name} - Attempt ${attempt} of ${maxAttempts} failed with error: ${errorMessage}`);
          yield utils_1.sleep(utils_1.getExponentialRetryTimeInMilliseconds(attempt));
          attempt++;
        }
        if (response) {
          utils_1.displayHttpDiagnostics(response);
        }
        if (customErrorInformation) {
          throw Error(`${name} failed: ${customErrorInformation}`);
        }
        throw Error(`${name} failed: ${errorMessage}`);
      });
    }
    __name(retry, "retry");
    exports.retry = retry;
    function retryHttpClientRequest(name, method, customErrorMessages = /* @__PURE__ */ new Map(), maxAttempts = config_variables_1.getRetryLimit()) {
      return __awaiter(this, void 0, void 0, function* () {
        return yield retry(name, method, customErrorMessages, maxAttempts);
      });
    }
    __name(retryHttpClientRequest, "retryHttpClientRequest");
    exports.retryHttpClientRequest = retryHttpClientRequest;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/upload-http-client.js
var require_upload_http_client = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/upload-http-client.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UploadHttpClient = void 0;
    var fs = __importStar(__require("fs"));
    var core = __importStar(require_core());
    var tmp = __importStar(require_tmp_promise());
    var stream = __importStar(__require("stream"));
    var utils_1 = require_utils2();
    var config_variables_1 = require_config_variables();
    var util_1 = __require("util");
    var url_1 = __require("url");
    var perf_hooks_1 = __require("perf_hooks");
    var status_reporter_1 = require_status_reporter();
    var http_client_1 = require_lib();
    var http_manager_1 = require_http_manager();
    var upload_gzip_1 = require_upload_gzip();
    var requestUtils_1 = require_requestUtils();
    var stat = util_1.promisify(fs.stat);
    var UploadHttpClient = class {
      static {
        __name(this, "UploadHttpClient");
      }
      constructor() {
        this.uploadHttpManager = new http_manager_1.HttpManager(config_variables_1.getUploadFileConcurrency(), "@actions/artifact-upload");
        this.statusReporter = new status_reporter_1.StatusReporter(1e4);
      }
      /**
       * Creates a file container for the new artifact in the remote blob storage/file service
       * @param {string} artifactName Name of the artifact being created
       * @returns The response from the Artifact Service if the file container was successfully created
       */
      createArtifactInFileContainer(artifactName, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const parameters = {
            Type: "actions_storage",
            Name: artifactName
          };
          if (options && options.retentionDays) {
            const maxRetentionStr = config_variables_1.getRetentionDays();
            parameters.RetentionDays = utils_1.getProperRetention(options.retentionDays, maxRetentionStr);
          }
          const data = JSON.stringify(parameters, null, 2);
          const artifactUrl = utils_1.getArtifactUrl();
          const client = this.uploadHttpManager.getClient(0);
          const headers = utils_1.getUploadHeaders("application/json", false);
          const customErrorMessages = /* @__PURE__ */ new Map([
            [
              http_client_1.HttpCodes.Forbidden,
              "Artifact storage quota has been hit. Unable to upload any new artifacts"
            ],
            [
              http_client_1.HttpCodes.BadRequest,
              `The artifact name ${artifactName} is not valid. Request URL ${artifactUrl}`
            ]
          ]);
          const response = yield requestUtils_1.retryHttpClientRequest("Create Artifact Container", () => __awaiter(this, void 0, void 0, function* () {
            return client.post(artifactUrl, data, headers);
          }), customErrorMessages);
          const body = yield response.readBody();
          return JSON.parse(body);
        });
      }
      /**
       * Concurrently upload all of the files in chunks
       * @param {string} uploadUrl Base Url for the artifact that was created
       * @param {SearchResult[]} filesToUpload A list of information about the files being uploaded
       * @returns The size of all the files uploaded in bytes
       */
      uploadArtifactToFileContainer(uploadUrl, filesToUpload, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const FILE_CONCURRENCY = config_variables_1.getUploadFileConcurrency();
          const MAX_CHUNK_SIZE = config_variables_1.getUploadChunkSize();
          core.debug(`File Concurrency: ${FILE_CONCURRENCY}, and Chunk Size: ${MAX_CHUNK_SIZE}`);
          const parameters = [];
          let continueOnError = true;
          if (options) {
            if (options.continueOnError === false) {
              continueOnError = false;
            }
          }
          for (const file of filesToUpload) {
            const resourceUrl = new url_1.URL(uploadUrl);
            resourceUrl.searchParams.append("itemPath", file.uploadFilePath);
            parameters.push({
              file: file.absoluteFilePath,
              resourceUrl: resourceUrl.toString(),
              maxChunkSize: MAX_CHUNK_SIZE,
              continueOnError
            });
          }
          const parallelUploads = [...new Array(FILE_CONCURRENCY).keys()];
          const failedItemsToReport = [];
          let currentFile = 0;
          let completedFiles = 0;
          let uploadFileSize = 0;
          let totalFileSize = 0;
          let abortPendingFileUploads = false;
          this.statusReporter.setTotalNumberOfFilesToProcess(filesToUpload.length);
          this.statusReporter.start();
          yield Promise.all(parallelUploads.map((index) => __awaiter(this, void 0, void 0, function* () {
            while (currentFile < filesToUpload.length) {
              const currentFileParameters = parameters[currentFile];
              currentFile += 1;
              if (abortPendingFileUploads) {
                failedItemsToReport.push(currentFileParameters.file);
                continue;
              }
              const startTime = perf_hooks_1.performance.now();
              const uploadFileResult = yield this.uploadFileAsync(index, currentFileParameters);
              if (core.isDebug()) {
                core.debug(`File: ${++completedFiles}/${filesToUpload.length}. ${currentFileParameters.file} took ${(perf_hooks_1.performance.now() - startTime).toFixed(3)} milliseconds to finish upload`);
              }
              uploadFileSize += uploadFileResult.successfulUploadSize;
              totalFileSize += uploadFileResult.totalSize;
              if (uploadFileResult.isSuccess === false) {
                failedItemsToReport.push(currentFileParameters.file);
                if (!continueOnError) {
                  core.error(`aborting artifact upload`);
                  abortPendingFileUploads = true;
                }
              }
              this.statusReporter.incrementProcessedCount();
            }
          })));
          this.statusReporter.stop();
          this.uploadHttpManager.disposeAndReplaceAllClients();
          core.info(`Total size of all the files uploaded is ${uploadFileSize} bytes`);
          return {
            uploadSize: uploadFileSize,
            totalSize: totalFileSize,
            failedItems: failedItemsToReport
          };
        });
      }
      /**
       * Asynchronously uploads a file. The file is compressed and uploaded using GZip if it is determined to save space.
       * If the upload file is bigger than the max chunk size it will be uploaded via multiple calls
       * @param {number} httpClientIndex The index of the httpClient that is being used to make all of the calls
       * @param {UploadFileParameters} parameters Information about the file that needs to be uploaded
       * @returns The size of the file that was uploaded in bytes along with any failed uploads
       */
      uploadFileAsync(httpClientIndex, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
          const fileStat = yield stat(parameters.file);
          const totalFileSize = fileStat.size;
          const isFIFO = fileStat.isFIFO();
          let offset = 0;
          let isUploadSuccessful = true;
          let failedChunkSizes = 0;
          let uploadFileSize = 0;
          let isGzip = true;
          if (!isFIFO && totalFileSize < 65536) {
            core.debug(`${parameters.file} is less than 64k in size. Creating a gzip file in-memory to potentially reduce the upload size`);
            const buffer = yield upload_gzip_1.createGZipFileInBuffer(parameters.file);
            let openUploadStream;
            if (totalFileSize < buffer.byteLength) {
              core.debug(`The gzip file created for ${parameters.file} did not help with reducing the size of the file. The original file will be uploaded as-is`);
              openUploadStream = /* @__PURE__ */ __name(() => fs.createReadStream(parameters.file), "openUploadStream");
              isGzip = false;
              uploadFileSize = totalFileSize;
            } else {
              core.debug(`A gzip file created for ${parameters.file} helped with reducing the size of the original file. The file will be uploaded using gzip.`);
              openUploadStream = /* @__PURE__ */ __name(() => {
                const passThrough = new stream.PassThrough();
                passThrough.end(buffer);
                return passThrough;
              }, "openUploadStream");
              uploadFileSize = buffer.byteLength;
            }
            const result = yield this.uploadChunk(httpClientIndex, parameters.resourceUrl, openUploadStream, 0, uploadFileSize - 1, uploadFileSize, isGzip, totalFileSize);
            if (!result) {
              isUploadSuccessful = false;
              failedChunkSizes += uploadFileSize;
              core.warning(`Aborting upload for ${parameters.file} due to failure`);
            }
            return {
              isSuccess: isUploadSuccessful,
              successfulUploadSize: uploadFileSize - failedChunkSizes,
              totalSize: totalFileSize
            };
          } else {
            const tempFile = yield tmp.file();
            core.debug(`${parameters.file} is greater than 64k in size. Creating a gzip file on-disk ${tempFile.path} to potentially reduce the upload size`);
            uploadFileSize = yield upload_gzip_1.createGZipFileOnDisk(parameters.file, tempFile.path);
            let uploadFilePath = tempFile.path;
            if (!isFIFO && totalFileSize < uploadFileSize) {
              core.debug(`The gzip file created for ${parameters.file} did not help with reducing the size of the file. The original file will be uploaded as-is`);
              uploadFileSize = totalFileSize;
              uploadFilePath = parameters.file;
              isGzip = false;
            } else {
              core.debug(`The gzip file created for ${parameters.file} is smaller than the original file. The file will be uploaded using gzip.`);
            }
            let abortFileUpload = false;
            while (offset < uploadFileSize) {
              const chunkSize = Math.min(uploadFileSize - offset, parameters.maxChunkSize);
              const startChunkIndex = offset;
              const endChunkIndex = offset + chunkSize - 1;
              offset += parameters.maxChunkSize;
              if (abortFileUpload) {
                failedChunkSizes += chunkSize;
                continue;
              }
              const result = yield this.uploadChunk(httpClientIndex, parameters.resourceUrl, () => fs.createReadStream(uploadFilePath, {
                start: startChunkIndex,
                end: endChunkIndex,
                autoClose: false
              }), startChunkIndex, endChunkIndex, uploadFileSize, isGzip, totalFileSize);
              if (!result) {
                isUploadSuccessful = false;
                failedChunkSizes += chunkSize;
                core.warning(`Aborting upload for ${parameters.file} due to failure`);
                abortFileUpload = true;
              } else {
                if (uploadFileSize > 8388608) {
                  this.statusReporter.updateLargeFileStatus(parameters.file, startChunkIndex, endChunkIndex, uploadFileSize);
                }
              }
            }
            core.debug(`deleting temporary gzip file ${tempFile.path}`);
            yield tempFile.cleanup();
            return {
              isSuccess: isUploadSuccessful,
              successfulUploadSize: uploadFileSize - failedChunkSizes,
              totalSize: totalFileSize
            };
          }
        });
      }
      /**
       * Uploads a chunk of an individual file to the specified resourceUrl. If the upload fails and the status code
       * indicates a retryable status, we try to upload the chunk as well
       * @param {number} httpClientIndex The index of the httpClient being used to make all the necessary calls
       * @param {string} resourceUrl Url of the resource that the chunk will be uploaded to
       * @param {NodeJS.ReadableStream} openStream Stream of the file that will be uploaded
       * @param {number} start Starting byte index of file that the chunk belongs to
       * @param {number} end Ending byte index of file that the chunk belongs to
       * @param {number} uploadFileSize Total size of the file in bytes that is being uploaded
       * @param {boolean} isGzip Denotes if we are uploading a Gzip compressed stream
       * @param {number} totalFileSize Original total size of the file that is being uploaded
       * @returns if the chunk was successfully uploaded
       */
      uploadChunk(httpClientIndex, resourceUrl, openStream, start, end, uploadFileSize, isGzip, totalFileSize) {
        return __awaiter(this, void 0, void 0, function* () {
          const digest = yield utils_1.digestForStream(openStream());
          const headers = utils_1.getUploadHeaders("application/octet-stream", true, isGzip, totalFileSize, end - start + 1, utils_1.getContentRange(start, end, uploadFileSize), digest);
          const uploadChunkRequest = /* @__PURE__ */ __name(() => __awaiter(this, void 0, void 0, function* () {
            const client = this.uploadHttpManager.getClient(httpClientIndex);
            return yield client.sendStream("PUT", resourceUrl, openStream(), headers);
          }), "uploadChunkRequest");
          let retryCount = 0;
          const retryLimit = config_variables_1.getRetryLimit();
          const incrementAndCheckRetryLimit = /* @__PURE__ */ __name((response) => {
            retryCount++;
            if (retryCount > retryLimit) {
              if (response) {
                utils_1.displayHttpDiagnostics(response);
              }
              core.info(`Retry limit has been reached for chunk at offset ${start} to ${resourceUrl}`);
              return true;
            }
            return false;
          }, "incrementAndCheckRetryLimit");
          const backOff = /* @__PURE__ */ __name((retryAfterValue) => __awaiter(this, void 0, void 0, function* () {
            this.uploadHttpManager.disposeAndReplaceClient(httpClientIndex);
            if (retryAfterValue) {
              core.info(`Backoff due to too many requests, retry #${retryCount}. Waiting for ${retryAfterValue} milliseconds before continuing the upload`);
              yield utils_1.sleep(retryAfterValue);
            } else {
              const backoffTime = utils_1.getExponentialRetryTimeInMilliseconds(retryCount);
              core.info(`Exponential backoff for retry #${retryCount}. Waiting for ${backoffTime} milliseconds before continuing the upload at offset ${start}`);
              yield utils_1.sleep(backoffTime);
            }
            core.info(`Finished backoff for retry #${retryCount}, continuing with upload`);
            return;
          }), "backOff");
          while (retryCount <= retryLimit) {
            let response;
            try {
              response = yield uploadChunkRequest();
            } catch (error2) {
              core.info(`An error has been caught http-client index ${httpClientIndex}, retrying the upload`);
              console.log(error2);
              if (incrementAndCheckRetryLimit()) {
                return false;
              }
              yield backOff();
              continue;
            }
            yield response.readBody();
            if (utils_1.isSuccessStatusCode(response.message.statusCode)) {
              return true;
            } else if (utils_1.isRetryableStatusCode(response.message.statusCode)) {
              core.info(`A ${response.message.statusCode} status code has been received, will attempt to retry the upload`);
              if (incrementAndCheckRetryLimit(response)) {
                return false;
              }
              utils_1.isThrottledStatusCode(response.message.statusCode) ? yield backOff(utils_1.tryGetRetryAfterValueTimeInMilliseconds(response.message.headers)) : yield backOff();
            } else {
              core.error(`Unexpected response. Unable to upload chunk to ${resourceUrl}`);
              utils_1.displayHttpDiagnostics(response);
              return false;
            }
          }
          return false;
        });
      }
      /**
       * Updates the size of the artifact from -1 which was initially set when the container was first created for the artifact.
       * Updating the size indicates that we are done uploading all the contents of the artifact
       */
      patchArtifactSize(size, artifactName) {
        return __awaiter(this, void 0, void 0, function* () {
          const resourceUrl = new url_1.URL(utils_1.getArtifactUrl());
          resourceUrl.searchParams.append("artifactName", artifactName);
          const parameters = { Size: size };
          const data = JSON.stringify(parameters, null, 2);
          core.debug(`URL is ${resourceUrl.toString()}`);
          const client = this.uploadHttpManager.getClient(0);
          const headers = utils_1.getUploadHeaders("application/json", false);
          const customErrorMessages = /* @__PURE__ */ new Map([
            [
              http_client_1.HttpCodes.NotFound,
              `An Artifact with the name ${artifactName} was not found`
            ]
          ]);
          const response = yield requestUtils_1.retryHttpClientRequest("Finalize artifact upload", () => __awaiter(this, void 0, void 0, function* () {
            return client.patch(resourceUrl.toString(), data, headers);
          }), customErrorMessages);
          yield response.readBody();
          core.debug(`Artifact ${artifactName} has been successfully uploaded, total size in bytes: ${size}`);
        });
      }
    };
    exports.UploadHttpClient = UploadHttpClient;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/download-http-client.js
var require_download_http_client = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/download-http-client.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DownloadHttpClient = void 0;
    var fs = __importStar(__require("fs"));
    var core = __importStar(require_core());
    var zlib = __importStar(__require("zlib"));
    var utils_1 = require_utils2();
    var url_1 = __require("url");
    var status_reporter_1 = require_status_reporter();
    var perf_hooks_1 = __require("perf_hooks");
    var http_manager_1 = require_http_manager();
    var config_variables_1 = require_config_variables();
    var requestUtils_1 = require_requestUtils();
    var DownloadHttpClient = class {
      static {
        __name(this, "DownloadHttpClient");
      }
      constructor() {
        this.downloadHttpManager = new http_manager_1.HttpManager(config_variables_1.getDownloadFileConcurrency(), "@actions/artifact-download");
        this.statusReporter = new status_reporter_1.StatusReporter(1e3);
      }
      /**
       * Gets a list of all artifacts that are in a specific container
       */
      listArtifacts() {
        return __awaiter(this, void 0, void 0, function* () {
          const artifactUrl = utils_1.getArtifactUrl();
          const client = this.downloadHttpManager.getClient(0);
          const headers = utils_1.getDownloadHeaders("application/json");
          const response = yield requestUtils_1.retryHttpClientRequest("List Artifacts", () => __awaiter(this, void 0, void 0, function* () {
            return client.get(artifactUrl, headers);
          }));
          const body = yield response.readBody();
          return JSON.parse(body);
        });
      }
      /**
       * Fetches a set of container items that describe the contents of an artifact
       * @param artifactName the name of the artifact
       * @param containerUrl the artifact container URL for the run
       */
      getContainerItems(artifactName, containerUrl) {
        return __awaiter(this, void 0, void 0, function* () {
          const resourceUrl = new url_1.URL(containerUrl);
          resourceUrl.searchParams.append("itemPath", artifactName);
          const client = this.downloadHttpManager.getClient(0);
          const headers = utils_1.getDownloadHeaders("application/json");
          const response = yield requestUtils_1.retryHttpClientRequest("Get Container Items", () => __awaiter(this, void 0, void 0, function* () {
            return client.get(resourceUrl.toString(), headers);
          }));
          const body = yield response.readBody();
          return JSON.parse(body);
        });
      }
      /**
       * Concurrently downloads all the files that are part of an artifact
       * @param downloadItems information about what items to download and where to save them
       */
      downloadSingleArtifact(downloadItems) {
        return __awaiter(this, void 0, void 0, function* () {
          const DOWNLOAD_CONCURRENCY = config_variables_1.getDownloadFileConcurrency();
          core.debug(`Download file concurrency is set to ${DOWNLOAD_CONCURRENCY}`);
          const parallelDownloads = [...new Array(DOWNLOAD_CONCURRENCY).keys()];
          let currentFile = 0;
          let downloadedFiles = 0;
          core.info(`Total number of files that will be downloaded: ${downloadItems.length}`);
          this.statusReporter.setTotalNumberOfFilesToProcess(downloadItems.length);
          this.statusReporter.start();
          yield Promise.all(parallelDownloads.map((index) => __awaiter(this, void 0, void 0, function* () {
            while (currentFile < downloadItems.length) {
              const currentFileToDownload = downloadItems[currentFile];
              currentFile += 1;
              const startTime = perf_hooks_1.performance.now();
              yield this.downloadIndividualFile(index, currentFileToDownload.sourceLocation, currentFileToDownload.targetPath);
              if (core.isDebug()) {
                core.debug(`File: ${++downloadedFiles}/${downloadItems.length}. ${currentFileToDownload.targetPath} took ${(perf_hooks_1.performance.now() - startTime).toFixed(3)} milliseconds to finish downloading`);
              }
              this.statusReporter.incrementProcessedCount();
            }
          }))).catch((error2) => {
            throw new Error(`Unable to download the artifact: ${error2}`);
          }).finally(() => {
            this.statusReporter.stop();
            this.downloadHttpManager.disposeAndReplaceAllClients();
          });
        });
      }
      /**
       * Downloads an individual file
       * @param httpClientIndex the index of the http client that is used to make all of the calls
       * @param artifactLocation origin location where a file will be downloaded from
       * @param downloadPath destination location for the file being downloaded
       */
      downloadIndividualFile(httpClientIndex, artifactLocation, downloadPath) {
        return __awaiter(this, void 0, void 0, function* () {
          let retryCount = 0;
          const retryLimit = config_variables_1.getRetryLimit();
          let destinationStream = fs.createWriteStream(downloadPath);
          const headers = utils_1.getDownloadHeaders("application/json", true, true);
          const makeDownloadRequest = /* @__PURE__ */ __name(() => __awaiter(this, void 0, void 0, function* () {
            const client = this.downloadHttpManager.getClient(httpClientIndex);
            return yield client.get(artifactLocation, headers);
          }), "makeDownloadRequest");
          const isGzip = /* @__PURE__ */ __name((incomingHeaders) => {
            return "content-encoding" in incomingHeaders && incomingHeaders["content-encoding"] === "gzip";
          }, "isGzip");
          const backOff = /* @__PURE__ */ __name((retryAfterValue) => __awaiter(this, void 0, void 0, function* () {
            retryCount++;
            if (retryCount > retryLimit) {
              return Promise.reject(new Error(`Retry limit has been reached. Unable to download ${artifactLocation}`));
            } else {
              this.downloadHttpManager.disposeAndReplaceClient(httpClientIndex);
              if (retryAfterValue) {
                core.info(`Backoff due to too many requests, retry #${retryCount}. Waiting for ${retryAfterValue} milliseconds before continuing the download`);
                yield utils_1.sleep(retryAfterValue);
              } else {
                const backoffTime = utils_1.getExponentialRetryTimeInMilliseconds(retryCount);
                core.info(`Exponential backoff for retry #${retryCount}. Waiting for ${backoffTime} milliseconds before continuing the download`);
                yield utils_1.sleep(backoffTime);
              }
              core.info(`Finished backoff for retry #${retryCount}, continuing with download`);
            }
          }), "backOff");
          const isAllBytesReceived = /* @__PURE__ */ __name((expected, received) => {
            if (!expected || !received || process.env["ACTIONS_ARTIFACT_SKIP_DOWNLOAD_VALIDATION"]) {
              core.info("Skipping download validation.");
              return true;
            }
            return parseInt(expected) === received;
          }, "isAllBytesReceived");
          const resetDestinationStream = /* @__PURE__ */ __name((fileDownloadPath) => __awaiter(this, void 0, void 0, function* () {
            destinationStream.close();
            yield new Promise((resolve) => {
              destinationStream.on("close", resolve);
              if (destinationStream.writableFinished) {
                resolve();
              }
            });
            yield utils_1.rmFile(fileDownloadPath);
            destinationStream = fs.createWriteStream(fileDownloadPath);
          }), "resetDestinationStream");
          while (retryCount <= retryLimit) {
            let response;
            try {
              response = yield makeDownloadRequest();
            } catch (error2) {
              core.info("An error occurred while attempting to download a file");
              console.log(error2);
              yield backOff();
              continue;
            }
            let forceRetry = false;
            if (utils_1.isSuccessStatusCode(response.message.statusCode)) {
              try {
                const isGzipped = isGzip(response.message.headers);
                yield this.pipeResponseToFile(response, destinationStream, isGzipped);
                if (isGzipped || isAllBytesReceived(response.message.headers["content-length"], yield utils_1.getFileSize(downloadPath))) {
                  return;
                } else {
                  forceRetry = true;
                }
              } catch (error2) {
                forceRetry = true;
              }
            }
            if (forceRetry || utils_1.isRetryableStatusCode(response.message.statusCode)) {
              core.info(`A ${response.message.statusCode} response code has been received while attempting to download an artifact`);
              resetDestinationStream(downloadPath);
              utils_1.isThrottledStatusCode(response.message.statusCode) ? yield backOff(utils_1.tryGetRetryAfterValueTimeInMilliseconds(response.message.headers)) : yield backOff();
            } else {
              utils_1.displayHttpDiagnostics(response);
              return Promise.reject(new Error(`Unexpected http ${response.message.statusCode} during download for ${artifactLocation}`));
            }
          }
        });
      }
      /**
       * Pipes the response from downloading an individual file to the appropriate destination stream while decoding gzip content if necessary
       * @param response the http response received when downloading a file
       * @param destinationStream the stream where the file should be written to
       * @param isGzip a boolean denoting if the content is compressed using gzip and if we need to decode it
       */
      pipeResponseToFile(response, destinationStream, isGzip) {
        return __awaiter(this, void 0, void 0, function* () {
          yield new Promise((resolve, reject) => {
            if (isGzip) {
              const gunzip = zlib.createGunzip();
              response.message.on("error", (error2) => {
                core.error(`An error occurred while attempting to read the response stream`);
                gunzip.close();
                destinationStream.close();
                reject(error2);
              }).pipe(gunzip).on("error", (error2) => {
                core.error(`An error occurred while attempting to decompress the response stream`);
                destinationStream.close();
                reject(error2);
              }).pipe(destinationStream).on("close", () => {
                resolve();
              }).on("error", (error2) => {
                core.error(`An error occurred while writing a downloaded file to ${destinationStream.path}`);
                reject(error2);
              });
            } else {
              response.message.on("error", (error2) => {
                core.error(`An error occurred while attempting to read the response stream`);
                destinationStream.close();
                reject(error2);
              }).pipe(destinationStream).on("close", () => {
                resolve();
              }).on("error", (error2) => {
                core.error(`An error occurred while writing a downloaded file to ${destinationStream.path}`);
                reject(error2);
              });
            }
          });
          return;
        });
      }
    };
    exports.DownloadHttpClient = DownloadHttpClient;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/download-specification.js
var require_download_specification = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/download-specification.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDownloadSpecification = void 0;
    var path3 = __importStar(__require("path"));
    function getDownloadSpecification(artifactName, artifactEntries, downloadPath, includeRootDirectory) {
      const directories = /* @__PURE__ */ new Set();
      const specifications = {
        rootDownloadLocation: includeRootDirectory ? path3.join(downloadPath, artifactName) : downloadPath,
        directoryStructure: [],
        emptyFilesToCreate: [],
        filesToDownload: []
      };
      for (const entry of artifactEntries) {
        if (entry.path.startsWith(`${artifactName}/`) || entry.path.startsWith(`${artifactName}\\`)) {
          const normalizedPathEntry = path3.normalize(entry.path);
          const filePath = path3.join(downloadPath, includeRootDirectory ? normalizedPathEntry : normalizedPathEntry.replace(artifactName, ""));
          if (entry.itemType === "file") {
            directories.add(path3.dirname(filePath));
            if (entry.fileLength === 0) {
              specifications.emptyFilesToCreate.push(filePath);
            } else {
              specifications.filesToDownload.push({
                sourceLocation: entry.contentLocation,
                targetPath: filePath
              });
            }
          }
        }
      }
      specifications.directoryStructure = Array.from(directories);
      return specifications;
    }
    __name(getDownloadSpecification, "getDownloadSpecification");
    exports.getDownloadSpecification = getDownloadSpecification;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/artifact-client.js
var require_artifact_client = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/internal/artifact-client.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      __name(adopt, "adopt");
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        __name(fulfilled, "fulfilled");
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        __name(rejected, "rejected");
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        __name(step, "step");
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultArtifactClient = void 0;
    var core = __importStar(require_core());
    var upload_specification_1 = require_upload_specification();
    var upload_http_client_1 = require_upload_http_client();
    var utils_1 = require_utils2();
    var path_and_artifact_name_validation_1 = require_path_and_artifact_name_validation();
    var download_http_client_1 = require_download_http_client();
    var download_specification_1 = require_download_specification();
    var config_variables_1 = require_config_variables();
    var path_1 = __require("path");
    var DefaultArtifactClient = class _DefaultArtifactClient {
      static {
        __name(this, "DefaultArtifactClient");
      }
      /**
       * Constructs a DefaultArtifactClient
       */
      static create() {
        return new _DefaultArtifactClient();
      }
      /**
       * Uploads an artifact
       */
      uploadArtifact(name, files, rootDirectory, options) {
        return __awaiter(this, void 0, void 0, function* () {
          core.info(`Starting artifact upload
For more detailed logs during the artifact upload process, enable step-debugging: https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/enabling-debug-logging#enabling-step-debug-logging`);
          path_and_artifact_name_validation_1.checkArtifactName(name);
          const uploadSpecification = upload_specification_1.getUploadSpecification(name, rootDirectory, files);
          const uploadResponse = {
            artifactName: name,
            artifactItems: [],
            size: 0,
            failedItems: []
          };
          const uploadHttpClient = new upload_http_client_1.UploadHttpClient();
          if (uploadSpecification.length === 0) {
            core.warning(`No files found that can be uploaded`);
          } else {
            const response = yield uploadHttpClient.createArtifactInFileContainer(name, options);
            if (!response.fileContainerResourceUrl) {
              core.debug(response.toString());
              throw new Error("No URL provided by the Artifact Service to upload an artifact to");
            }
            core.debug(`Upload Resource URL: ${response.fileContainerResourceUrl}`);
            core.info(`Container for artifact "${name}" successfully created. Starting upload of file(s)`);
            const uploadResult = yield uploadHttpClient.uploadArtifactToFileContainer(response.fileContainerResourceUrl, uploadSpecification, options);
            core.info(`File upload process has finished. Finalizing the artifact upload`);
            yield uploadHttpClient.patchArtifactSize(uploadResult.totalSize, name);
            if (uploadResult.failedItems.length > 0) {
              core.info(`Upload finished. There were ${uploadResult.failedItems.length} items that failed to upload`);
            } else {
              core.info(`Artifact has been finalized. All files have been successfully uploaded!`);
            }
            core.info(`
The raw size of all the files that were specified for upload is ${uploadResult.totalSize} bytes
The size of all the files that were uploaded is ${uploadResult.uploadSize} bytes. This takes into account any gzip compression used to reduce the upload size, time and storage

Note: The size of downloaded zips can differ significantly from the reported size. For more information see: https://github.com/actions/upload-artifact#zipped-artifact-downloads \r
`);
            uploadResponse.artifactItems = uploadSpecification.map((item) => item.absoluteFilePath);
            uploadResponse.size = uploadResult.uploadSize;
            uploadResponse.failedItems = uploadResult.failedItems;
          }
          return uploadResponse;
        });
      }
      downloadArtifact(name, path3, options) {
        return __awaiter(this, void 0, void 0, function* () {
          const downloadHttpClient = new download_http_client_1.DownloadHttpClient();
          const artifacts = yield downloadHttpClient.listArtifacts();
          if (artifacts.count === 0) {
            throw new Error(`Unable to find any artifacts for the associated workflow`);
          }
          const artifactToDownload = artifacts.value.find((artifact) => {
            return artifact.name === name;
          });
          if (!artifactToDownload) {
            throw new Error(`Unable to find an artifact with the name: ${name}`);
          }
          const items = yield downloadHttpClient.getContainerItems(artifactToDownload.name, artifactToDownload.fileContainerResourceUrl);
          if (!path3) {
            path3 = config_variables_1.getWorkSpaceDirectory();
          }
          path3 = path_1.normalize(path3);
          path3 = path_1.resolve(path3);
          const downloadSpecification = download_specification_1.getDownloadSpecification(name, items.value, path3, (options === null || options === void 0 ? void 0 : options.createArtifactFolder) || false);
          if (downloadSpecification.filesToDownload.length === 0) {
            core.info(`No downloadable files were found for the artifact: ${artifactToDownload.name}`);
          } else {
            yield utils_1.createDirectoriesForArtifact(downloadSpecification.directoryStructure);
            core.info("Directory structure has been setup for the artifact");
            yield utils_1.createEmptyFilesForArtifact(downloadSpecification.emptyFilesToCreate);
            yield downloadHttpClient.downloadSingleArtifact(downloadSpecification.filesToDownload);
          }
          return {
            artifactName: name,
            downloadPath: downloadSpecification.rootDownloadLocation
          };
        });
      }
      downloadAllArtifacts(path3) {
        return __awaiter(this, void 0, void 0, function* () {
          const downloadHttpClient = new download_http_client_1.DownloadHttpClient();
          const response = [];
          const artifacts = yield downloadHttpClient.listArtifacts();
          if (artifacts.count === 0) {
            core.info("Unable to find any artifacts for the associated workflow");
            return response;
          }
          if (!path3) {
            path3 = config_variables_1.getWorkSpaceDirectory();
          }
          path3 = path_1.normalize(path3);
          path3 = path_1.resolve(path3);
          let downloadedArtifacts = 0;
          while (downloadedArtifacts < artifacts.count) {
            const currentArtifactToDownload = artifacts.value[downloadedArtifacts];
            downloadedArtifacts += 1;
            core.info(`starting download of artifact ${currentArtifactToDownload.name} : ${downloadedArtifacts}/${artifacts.count}`);
            const items = yield downloadHttpClient.getContainerItems(currentArtifactToDownload.name, currentArtifactToDownload.fileContainerResourceUrl);
            const downloadSpecification = download_specification_1.getDownloadSpecification(currentArtifactToDownload.name, items.value, path3, true);
            if (downloadSpecification.filesToDownload.length === 0) {
              core.info(`No downloadable files were found for any artifact ${currentArtifactToDownload.name}`);
            } else {
              yield utils_1.createDirectoriesForArtifact(downloadSpecification.directoryStructure);
              yield utils_1.createEmptyFilesForArtifact(downloadSpecification.emptyFilesToCreate);
              yield downloadHttpClient.downloadSingleArtifact(downloadSpecification.filesToDownload);
            }
            response.push({
              artifactName: currentArtifactToDownload.name,
              downloadPath: downloadSpecification.rootDownloadLocation
            });
          }
          return response;
        });
      }
    };
    exports.DefaultArtifactClient = DefaultArtifactClient;
  }
});

// node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/artifact-client.js
var require_artifact_client2 = __commonJS({
  "node_modules/.pnpm/@actions+artifact@1.1.1/node_modules/@actions/artifact/lib/artifact-client.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = void 0;
    var artifact_client_1 = require_artifact_client();
    function create2() {
      return artifact_client_1.DefaultArtifactClient.create();
    }
    __name(create2, "create");
    exports.create = create2;
  }
});

// node_modules/.pnpm/@unlike+github-actions-core@0.1.0/node_modules/@unlike/github-actions-core/dist/variables.js
import { EOL as EOL3 } from "node:os";

// node_modules/.pnpm/@unlike+github-actions-core@0.1.0/node_modules/@unlike/github-actions-core/dist/lib/command.js
import { EOL } from "node:os";

// node_modules/.pnpm/@unlike+github-actions-core@0.1.0/node_modules/@unlike/github-actions-core/dist/lib/utils.js
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

// node_modules/.pnpm/@unlike+github-actions-core@0.1.0/node_modules/@unlike/github-actions-core/dist/lib/command.js
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

// node_modules/.pnpm/@unlike+github-actions-core@0.1.0/node_modules/@unlike/github-actions-core/dist/lib/file-command.js
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

// node_modules/.pnpm/@unlike+github-actions-core@0.1.0/node_modules/@unlike/github-actions-core/dist/variables.js
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

// node_modules/.pnpm/@unlike+github-actions-core@0.1.0/node_modules/@unlike/github-actions-core/dist/types.js
var ExitCode = /* @__PURE__ */ ((ExitCode2) => {
  ExitCode2[ExitCode2["Success"] = 0] = "Success";
  ExitCode2[ExitCode2["Failure"] = 1] = "Failure";
  return ExitCode2;
})(ExitCode || {});

// node_modules/.pnpm/@unlike+github-actions-core@0.1.0/node_modules/@unlike/github-actions-core/dist/errors.js
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

// node_modules/.pnpm/@unlike+github-actions-core@0.1.0/node_modules/@unlike/github-actions-core/dist/logging.js
var __defProp7 = Object.defineProperty;
var __name7 = /* @__PURE__ */ __name((target, value) => __defProp7(target, "name", { value, configurable: true }), "__name");
var notice = /* @__PURE__ */ __name7((message, properties = {}) => {
  issueCommand(
    "notice",
    toCommandProperties(properties),
    message instanceof Error ? message.toString() : message
  );
}, "notice");

// node_modules/.pnpm/@unlike+github-actions-core@0.1.0/node_modules/@unlike/github-actions-core/dist/lib/summary.js
import { constants, promises } from "node:fs";
import { EOL as EOL4 } from "node:os";
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
    return this.addRaw(EOL4);
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

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/index.js
var import_cross_spawn = __toESM(require_cross_spawn(), 1);
import { Buffer as Buffer3 } from "node:buffer";
import path2 from "node:path";
import childProcess from "node:child_process";
import process4 from "node:process";

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

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/error.js
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
  parsed: { options: { timeout } }
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

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/stdio.js
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

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/kill.js
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

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/pipe.js
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

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/pipe.js
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

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/stream.js
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

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/promise.js
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

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/command.js
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

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/lib/verbose.js
import { debuglog } from "node:util";
import process3 from "node:process";
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
  process3.stderr.write(`[${getTimestamp()}] ${escapedCommand}
`);
}, "logCommand");

// node_modules/.pnpm/execa@7.1.1/node_modules/execa/index.js
var DEFAULT_MAX_BUFFER = 1e3 * 1e3 * 100;
var getEnv = /* @__PURE__ */ __name(({ env: envOption, extendEnv, preferLocal, localDir, execPath }) => {
  const env = extendEnv ? { ...process4.env, ...envOption } : envOption;
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
    localDir: options.cwd || process4.cwd(),
    execPath: process4.execPath,
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
  if (process4.platform === "win32" && path2.basename(file, ".exe") === "cmd") {
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

// src/constants.ts
var ACTION_INPUT_ACCOUNT_ID = "accountId";
var ACTION_INPUT_PROJECT_NAME = "projectName";
var ACTION_INPUT_API_TOKEN = "apiToken";
var ACTION_INPUT_DIRECTORY = "directory";
var ACTION_INPUT_GITHUB_TOKEN = "githubToken";
var ACTION_INPUT_GITHUB_ENVIRONMENT = "github environment";
var CLOUDFLARE_API_TOKEN = "CLOUDFLARE_API_TOKEN";
var CLOUDFLARE_ACCOUNT_ID = "CLOUDFLARE_ACCOUNT_ID";

// src/utils.ts
var raise = /* @__PURE__ */ __name((message) => {
  throw new Error(message);
}, "raise");

// src/github/workflow-event/workflow-event.ts
import { strict as assert } from "node:assert";
import { existsSync as existsSync2, readFileSync as readFileSync2 } from "node:fs";
import { EOL as EOL5 } from "node:os";

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
      process.stdout.write(`GITHUB_EVENT_PATH ${path3} does not exist${EOL5}`);
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
  return {
    event,
    repo,
    branch,
    sha,
    graphqlEndpoint,
    ref
  };
}, "getGitHubContext");
var _context;
var useContext = /* @__PURE__ */ __name(() => {
  return _context ?? (_context = getGitHubContext());
}, "useContext");
var useContextEvent = /* @__PURE__ */ __name(() => useContext().event, "useContextEvent");

// src/cloudflare/api/endpoints.ts
var API_ENDPOINT = `https://api.cloudflare.com`;
var getCloudflareApiEndpoint = /* @__PURE__ */ __name((path3) => {
  const accountIdentifier = getInput(ACTION_INPUT_ACCOUNT_ID, {
    required: true
  });
  const projectName = getInput(ACTION_INPUT_PROJECT_NAME, { required: true });
  const input = [
    `/client/v4/accounts/${accountIdentifier}/pages/projects/${projectName}`,
    path3
  ].filter(Boolean).join("/");
  return new URL(input, API_ENDPOINT).toString();
}, "getCloudflareApiEndpoint");
var getCloudflareLogEndpoint = /* @__PURE__ */ __name((id) => {
  const accountIdentifier = getInput(ACTION_INPUT_ACCOUNT_ID, {
    required: true
  });
  const projectName = getInput(ACTION_INPUT_PROJECT_NAME, { required: true });
  return `https://dash.cloudflare.com/${accountIdentifier}/pages/view/${projectName}/${id}`;
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
function throwFetchError(resource, response) {
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
}
__name(throwFetchError, "throwFetchError");
function renderError(err, level = 0) {
  const chainedMessages = err.error_chain?.map(
    (chainedError) => `
${"  ".repeat(level)}- ${renderError(chainedError, level + 1)}`
  ).join("\n") ?? "";
  return (err.code ? `${err.message} [code: ${err.code}]` : err.message) + chainedMessages;
}
__name(renderError, "renderError");

// src/cloudflare/api/fetch-result.ts
async function fetchResult(resource, init = {}, queryParams, abortSignal) {
  const method = init.method ?? "GET";
  const apiToken = getInput(ACTION_INPUT_API_TOKEN, { required: true });
  const initFetch = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${apiToken}`
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
  } else {
    throwFetchError(resource, response);
  }
}
__name(fetchResult, "fetchResult");

// src/cloudflare/deployments.ts
var ERROR_KEY = `Create Deployment:`;
var getDeployments = /* @__PURE__ */ __name(async () => {
  const url2 = getCloudflareApiEndpoint("deployments");
  const result = await fetchResult(url2);
  return result;
}, "getDeployments");
var getDeploymentAlias = /* @__PURE__ */ __name((deployment) => {
  return deployment.aliases && deployment.aliases.length > 0 ? deployment.aliases[0] : deployment.url;
}, "getDeploymentAlias");
var createDeployment = /* @__PURE__ */ __name(async () => {
  const accountId = getInput(ACTION_INPUT_ACCOUNT_ID, {
    required: true
  });
  const projectName = getInput(ACTION_INPUT_PROJECT_NAME, {
    required: true
  });
  const directory = getInput(ACTION_INPUT_DIRECTORY, {
    required: true
  });
  const apiToken = getInput(ACTION_INPUT_API_TOKEN, {
    required: true
  });
  process.env[CLOUDFLARE_API_TOKEN] = apiToken;
  process.env[CLOUDFLARE_ACCOUNT_ID] = accountId;
  const { repo, branch, sha: commitHash } = useContext();
  if (branch === void 0) {
    throw new Error(`${ERROR_KEY} branch is undefined`);
  }
  try {
    await $`npx wrangler@3.1.1 pages deploy ${directory} --project-name=${projectName} --branch=${branch} --commit-dirty=true --commit-hash=${commitHash}`;
    const deployments = await getDeployments();
    const deployment = deployments.find(
      (deployment2) => deployment2.deployment_trigger.metadata.commit_hash === commitHash
    );
    if (deployment === void 0) {
      throw new Error(
        `${ERROR_KEY} could not find deployment with commitHash: ${commitHash}`
      );
    }
    setOutput("id", deployment.id);
    setOutput("url", deployment.url);
    setOutput("environment", deployment.environment);
    const alias = getDeploymentAlias(deployment);
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
}, "createDeployment");

// src/cloudflare/project/get-project.ts
var getProject = /* @__PURE__ */ __name(async () => {
  const url2 = getCloudflareApiEndpoint();
  const result = await fetchResult(url2);
  return result;
}, "getProject");

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
  "\n  fragment EnvironmentFragment on Environment {\n    name\n    id\n  }\n": EnvironmentFragmentFragmentDoc,
  "\n  mutation CreateEnvironment($repositoryId: ID!, $name: String!) {\n    createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {\n      environment {\n        ...EnvironmentFragment\n      }\n    }\n  }\n": CreateEnvironmentDocument,
  "\n  query GetEnvironment(\n    $owner: String!\n    $repo: String!\n    $environment_name: String!\n    $qualifiedName: String!\n  ) {\n    repository(owner: $owner, name: $repo) {\n      environment(name: $environment_name) {\n        ...EnvironmentFragment\n      }\n      ref(qualifiedName: $qualifiedName) {\n        id\n        name\n        prefix\n      }\n    }\n  }\n": GetEnvironmentDocument
};
function graphql(source) {
  return documents[source] ?? {};
}
__name(graphql, "graphql");

// src/github/api/client.ts
var request = /* @__PURE__ */ __name(async (params) => {
  const { query, variables, options } = params;
  const { errorThrows } = options || { errorThrows: true };
  const token = getInput(ACTION_INPUT_GITHUB_TOKEN, { required: true });
  const { graphqlEndpoint } = useContext();
  return fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      authorization: `bearer ${token}`,
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

// src/github/comment.ts
var MutationAddComment = graphql(
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
  if (eventName === "pull_request") {
    const prNodeId = payload.pull_request.node_id ?? raise("No pull request node id");
    const { sha } = useContext();
    const rawBody = `## Cloudflare Pages Deployment
 **Environment:** ${deployment.environment} 
 **Project:** ${deployment.project_name} 
 **Built with commit:** ${sha}
 **Preview URL:** ${deployment.url} 
 **Branch Preview URL:** ${getDeploymentAlias(
      deployment
    )} 
 **Deployment Id:** ${deployment.id} 
 **Run Id:** ${process.env.GITHUB_RUN_ID}`;
    await request({
      query: MutationAddComment,
      variables: {
        subjectId: prNodeId,
        body: rawBody
      }
    });
    return;
  }
  throw new Error("Not a pull request");
}, "addComment");

// src/github/environment.ts
var EnvironmentFragment = graphql(
  /* GraphQL */
  `
  fragment EnvironmentFragment on Environment {
    name
    id
  }
`
);
var MutationCreateEnvironment = graphql(
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
var QueryGetEnvironment = graphql(
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
  const environmentName = getInput(ACTION_INPUT_GITHUB_ENVIRONMENT, {
    required: true
  });
  const { repo, ref } = useContext();
  const environment = await request({
    query: QueryGetEnvironment,
    variables: {
      owner: repo.owner,
      repo: repo.repo,
      environment_name: environmentName,
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
    throw new Error(`GitHub Environment: Not created for ${environmentName}`);
  }
  if (!environment.data.repository?.ref?.id) {
    throw new Error(`GitHub Environment: No ref id ${environmentName}`);
  }
  return {
    ...environment.data.repository.environment,
    refId: environment.data.repository?.ref?.id
  };
}, "checkEnvironment");

// src/github/deployment.ts
var MutationCreateDeployment = `
mutation CreateDeployment($repositoryId: ID!, $environmentName: String!, $refId: ID!) {
    createDeployment(input: {
        autoMerge: false,
        description: "Deployed from GitHub Actions",
        environment: $environmentName,
        refId: $refId,
        repositoryId: $repositoryId
        requiredContexts: []
    }) {
      deployment {
        id
        environment
        state
      }
    }
  }
`;
var MutationCreateDeploymentStatus = `
  mutation CreateDeploymentStatus(
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
        createdAt
        deployment {
          id
          environment
          state
        }
        state
        environmentUrl
      }
    }
  }
`;
var createGitHubDeployment = /* @__PURE__ */ __name(async ({
  id,
  url: url2
}) => {
  const { name, refId } = await checkEnvironment() ?? raise("GitHub Deployment: GitHub Environment is required");
  const { repo } = useContext();
  const deployment = await request({
    query: MutationCreateDeployment,
    variables: {
      repositoryId: repo.node_id,
      environmentName: name,
      refId
    }
  });
  const gitHubDeploymentId = deployment.data.createDeployment?.deployment?.id ?? raise("GitHub Deployment: GitHub deployment id is required");
  await request({
    query: MutationCreateDeploymentStatus,
    variables: {
      environment: name,
      deploymentId: gitHubDeploymentId,
      environmentUrl: url2,
      logUrl: getCloudflareLogEndpoint(id),
      state: "SUCCESS" /* Success */
    }
  });
  return deployment.data.createDeployment?.deployment;
}, "createGitHubDeployment");

// src/github/logs.ts
var import_artifact = __toESM(require_artifact_client2(), 1);
import { writeFile as writeFile2 } from "node:fs/promises";
var artifactClient = (0, import_artifact.create)();
var writeLogFile = /* @__PURE__ */ __name(async (artifactName, data) => writeFile2(artifactName, JSON.stringify(data)), "writeLogFile");
var uploadLogFile = /* @__PURE__ */ __name(async (filename) => {
  const artifactName = filename;
  const files = [filename];
  const rootDirectory = ".";
  return await artifactClient.uploadArtifact(artifactName, files, rootDirectory);
}, "uploadLogFile");
var saveLogs = /* @__PURE__ */ __name(async (deployment) => {
  const { eventName, payload } = useContextEvent();
  if (eventName === "pull_request") {
    if (payload.action === "closed") {
      return;
    }
    const artifactName = payload.pull_request.node_id ?? raise("No pull request node id");
    const filename = `${artifactName}.json`;
    const logData = { deployment_identifier: deployment.id };
    const data = [logData];
    await writeLogFile(filename, data);
    const response = await uploadLogFile(filename);
    notice(`Artifact: - ${JSON.stringify(response)}`);
  }
}, "saveLogs");

// src/main.ts
async function run() {
  const { eventName, payload } = useContextEvent();
  if (eventName === "pull_request") {
    if (payload.action === "closed") {
      console.dir(payload);
      return;
    }
    const { name, subdomain } = await getProject();
    const cloudflareDeployment = await createDeployment();
    const deployment = await createGitHubDeployment(cloudflareDeployment);
    await saveLogs(cloudflareDeployment);
    await addComment(cloudflareDeployment);
    return { name, subdomain, url: cloudflareDeployment.url };
  }
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
