import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });

// node_modules/.pnpm/@unlike+github-actions-core@1.0.0/node_modules/@unlike/github-actions-core/dist/variables.js
import { EOL as EOL3 } from "node:os";

// node_modules/.pnpm/@unlike+github-actions-core@1.0.0/node_modules/@unlike/github-actions-core/dist/lib/command.js
import { EOL } from "node:os";

// node_modules/.pnpm/@unlike+github-actions-core@1.0.0/node_modules/@unlike/github-actions-core/dist/lib/utils.js
var __defProp2 = Object.defineProperty, __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: !0 }), "__name"), toCommandValue = /* @__PURE__ */ __name2((input) => input == null ? "" : typeof input == "string" || input instanceof String ? input : JSON.stringify(input), "toCommandValue"), toCommandProperties = /* @__PURE__ */ __name2((annotationProperties) => !annotationProperties || Object.keys(annotationProperties).length === 0 ? {} : {
  title: annotationProperties.title,
  file: annotationProperties.file,
  line: annotationProperties.startLine,
  endLine: annotationProperties.endLine,
  col: annotationProperties.startColumn,
  endColumn: annotationProperties.endColumn
}, "toCommandProperties");

// node_modules/.pnpm/@unlike+github-actions-core@1.0.0/node_modules/@unlike/github-actions-core/dist/lib/command.js
var __defProp3 = Object.defineProperty, __name3 = /* @__PURE__ */ __name((target, value) => __defProp3(target, "name", { value, configurable: !0 }), "__name"), issueCommand = /* @__PURE__ */ __name3((command, properties, message) => {
  let cmd = new Command(command, properties, message);
  process.stdout.write(cmd.toString() + EOL);
}, "issueCommand");
var CMD_STRING = "::", Command = class {
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
    command || (command = "missing.command"), this.#command = command, this.#properties = properties, this.#message = message;
  }
  toString() {
    let cmdStr = CMD_STRING + this.#command;
    if (this.#properties && Object.keys(this.#properties).length > 0) {
      cmdStr += " ";
      let first = !0;
      for (let key in this.#properties)
        if (this.#properties.hasOwnProperty(key)) {
          let val = this.#properties[key];
          val && (first ? first = !1 : cmdStr += ",", cmdStr += `${key}=${escapeProperty(val)}`);
        }
    }
    return cmdStr += `${CMD_STRING}${escapeData(this.#message)}`, cmdStr;
  }
};
function escapeData(s) {
  return toCommandValue(s).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll(`
`, "%0A");
}
__name(escapeData, "escapeData");
__name3(escapeData, "escapeData");
function escapeProperty(s) {
  return toCommandValue(s).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll(`
`, "%0A").replaceAll(":", "%3A").replaceAll(",", "%2C");
}
__name(escapeProperty, "escapeProperty");
__name3(escapeProperty, "escapeProperty");

// node_modules/.pnpm/@unlike+github-actions-core@1.0.0/node_modules/@unlike/github-actions-core/dist/lib/file-command.js
import { randomUUID as uuidv4 } from "node:crypto";
import { appendFileSync, existsSync } from "node:fs";
import { EOL as EOL2 } from "node:os";
var __defProp4 = Object.defineProperty, __name4 = /* @__PURE__ */ __name((target, value) => __defProp4(target, "name", { value, configurable: !0 }), "__name"), issueFileCommand = /* @__PURE__ */ __name4((command, message) => {
  let filePath = process.env[`GITHUB_${command}`];
  if (!filePath)
    throw new Error(
      `Unable to find environment variable for file command ${command}`
    );
  if (!existsSync(filePath))
    throw new Error(`Missing file at path: ${filePath}`);
  appendFileSync(filePath, `${toCommandValue(message)}${EOL2}`, {
    encoding: "utf8"
  });
}, "issueFileCommand"), prepareKeyValueMessage = /* @__PURE__ */ __name4((key, value) => {
  let delimiter = `ghadelimiter_${uuidv4()}`, convertedValue = toCommandValue(value);
  if (key.includes(delimiter))
    throw new Error(
      `Unexpected input: name should not contain the delimiter "${delimiter}"`
    );
  if (convertedValue.includes(delimiter))
    throw new Error(
      `Unexpected input: value should not contain the delimiter "${delimiter}"`
    );
  return `${key}<<${delimiter}${EOL2}${convertedValue}${EOL2}${delimiter}`;
}, "prepareKeyValueMessage");

// node_modules/.pnpm/@unlike+github-actions-core@1.0.0/node_modules/@unlike/github-actions-core/dist/variables.js
var __defProp5 = Object.defineProperty, __name5 = /* @__PURE__ */ __name((target, value) => __defProp5(target, "name", { value, configurable: !0 }), "__name");
var getInput = /* @__PURE__ */ __name5((name, options) => {
  let val = process.env[`INPUT_${name.replaceAll(" ", "_").toUpperCase()}`] || "";
  if (options && options.required && !val)
    throw new Error(`Input required and not supplied: ${name}`);
  return options && options.trimWhitespace === !1 ? val : val.trim();
}, "getInput");
var setOutput = /* @__PURE__ */ __name5((name, value) => {
  if (process.env.GITHUB_OUTPUT || "")
    return issueFileCommand("OUTPUT", prepareKeyValueMessage(name, value));
  process.stdout.write(EOL3), issueCommand("set-output", { name }, toCommandValue(value));
}, "setOutput");

// node_modules/.pnpm/@unlike+github-actions-core@1.0.0/node_modules/@unlike/github-actions-core/dist/types.js
var ExitCode = /* @__PURE__ */ ((ExitCode2) => (ExitCode2[ExitCode2.Success = 0] = "Success", ExitCode2[ExitCode2.Failure = 1] = "Failure", ExitCode2))(ExitCode || {});

// node_modules/.pnpm/@unlike+github-actions-core@1.0.0/node_modules/@unlike/github-actions-core/dist/errors.js
var __defProp6 = Object.defineProperty, __name6 = /* @__PURE__ */ __name((target, value) => __defProp6(target, "name", { value, configurable: !0 }), "__name"), error = /* @__PURE__ */ __name6((message, properties = {}) => {
  issueCommand(
    "error",
    toCommandProperties(properties),
    message instanceof Error ? message.toString() : message
  );
}, "error"), setFailed = /* @__PURE__ */ __name6((message) => {
  process.exitCode = ExitCode.Failure, error(message);
}, "setFailed");

// node_modules/.pnpm/@unlike+github-actions-core@1.0.0/node_modules/@unlike/github-actions-core/dist/logging.js
import { EOL as EOL4 } from "node:os";
var __defProp7 = Object.defineProperty, __name7 = /* @__PURE__ */ __name((target, value) => __defProp7(target, "name", { value, configurable: !0 }), "__name"), isDebug = /* @__PURE__ */ __name7(() => process.env.RUNNER_DEBUG === "1", "isDebug"), debug = /* @__PURE__ */ __name7((message) => {
  issueCommand("debug", {}, message);
}, "debug"), warning = /* @__PURE__ */ __name7((message, properties = {}) => {
  issueCommand(
    "warning",
    toCommandProperties(properties),
    message instanceof Error ? message.toString() : message
  );
}, "warning");
var info = /* @__PURE__ */ __name7((message) => {
  process.stdout.write(message + EOL4);
}, "info");

// node_modules/.pnpm/@unlike+github-actions-core@1.0.0/node_modules/@unlike/github-actions-core/dist/lib/summary.js
import { constants, promises } from "node:fs";
import { EOL as EOL5 } from "node:os";
var __defProp8 = Object.defineProperty, __name8 = /* @__PURE__ */ __name((target, value) => __defProp8(target, "name", { value, configurable: !0 }), "__name"), { access, appendFile, writeFile } = promises, SUMMARY_ENV_VAR = "GITHUB_STEP_SUMMARY";
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
    if (this.#filePath)
      return this.#filePath;
    let pathFromEnv = process.env[SUMMARY_ENV_VAR];
    if (!pathFromEnv)
      throw new Error(
        `Unable to find environment variable for $${SUMMARY_ENV_VAR}. Check if your runtime environment supports job summaries.`
      );
    try {
      await access(pathFromEnv, constants.R_OK | constants.W_OK);
    } catch {
      throw new Error(
        `Unable to access summary file: '${pathFromEnv}'. Check if the file has correct read/write permissions.`
      );
    }
    return this.#filePath = pathFromEnv, this.#filePath;
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
    let htmlAttrs = Object.entries(attrs).map(([key, value]) => ` ${key}="${value}"`).join("");
    return content ? `<${tag}${htmlAttrs}>${content}</${tag}>` : `<${tag}${htmlAttrs}>`;
  }
  /**
   * Writes text in the buffer to the summary buffer file and empties buffer. Will append by default.
   *
   * @param {SummaryWriteOptions} [options] (optional) options for write operation
   *
   * @returns {Promise<Summary>} summary instance
   */
  async write(options) {
    let overwrite = !!options?.overwrite, filePath = await this.#fileSummaryPath();
    return await (overwrite ? writeFile : appendFile)(filePath, this.#buffer, { encoding: "utf8" }), this.emptyBuffer();
  }
  /**
   * Clears the summary buffer and wipes the summary file
   *
   * @returns {Summary} summary instance
   */
  async clear() {
    return this.emptyBuffer().write({ overwrite: !0 });
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
    return this.#buffer = "", this;
  }
  /**
   * Adds raw text to the summary buffer
   *
   * @param {string} text content to add
   * @param {boolean} [addEOL=false] (optional) append an EOL to the raw text (default: false)
   *
   * @returns {Summary} summary instance
   */
  addRaw(text, addEOL = !1) {
    return this.#buffer += text, addEOL ? this.addEOL() : this;
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
    let attrs = {
      ...lang && { lang }
    }, element = this.#wrap("pre", this.#wrap("code", code), attrs);
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
  addList(items, ordered = !1) {
    let tag = ordered ? "ol" : "ul", listItems = items.map((item) => this.#wrap("li", item)).join(""), element = this.#wrap(tag, listItems);
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
    let tableBody = rows.map((row) => {
      let cells = row.map((cell) => {
        if (typeof cell == "string")
          return this.#wrap("td", cell);
        let { header, data, colspan, rowspan } = cell, tag = header ? "th" : "td", attrs = {
          ...colspan && { colspan },
          ...rowspan && { rowspan }
        };
        return this.#wrap(tag, data, attrs);
      }).join("");
      return this.#wrap("tr", cells);
    }).join(""), element = this.#wrap("table", tableBody);
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
    let element = this.#wrap(
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
    let { width, height } = options || {}, attrs = {
      ...width && { width },
      ...height && { height }
    }, element = this.#wrap("img", null, { src, alt, ...attrs });
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
    let tag = `h${level}`, allowedTag = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag) ? tag : "h1", element = this.#wrap(allowedTag, text);
    return this.addRaw(element).addEOL();
  }
  /**
   * Adds an HTML thematic break (<hr>) to the summary buffer
   *
   * @returns {Summary} summary instance
   */
  addSeparator() {
    let element = this.#wrap("hr", null);
    return this.addRaw(element).addEOL();
  }
  /**
   * Adds an HTML line break (<br>) to the summary buffer
   *
   * @returns {Summary} summary instance
   */
  addBreak() {
    let element = this.#wrap("br", null);
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
    let attrs = {
      ...cite && { cite }
    }, element = this.#wrap("blockquote", text, attrs);
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
    let element = this.#wrap("a", text, { href });
    return this.addRaw(element).addEOL();
  }
}, _summary = new Summary(), summary = _summary;

// src/cloudflare/deployment/create.ts
import { strict } from "node:assert";

// src/utils.ts
import { exec } from "node:child_process";
import { promisify } from "node:util";
var raise = /* @__PURE__ */ __name((message) => {
  throw new Error(message);
}, "raise"), raiseFail = /* @__PURE__ */ __name((message) => {
  throw setFailed(message), new Error(message);
}, "raiseFail"), execAsync = promisify(exec);

// src/github/workflow-event/workflow-event.ts
import { strict as assert } from "node:assert";
import { existsSync as existsSync2, readFileSync } from "node:fs";
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
  "deployment_review",
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
    if (existsSync2(process.env.GITHUB_EVENT_PATH))
      return JSON.parse(
        readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" })
      );
    {
      let path = process.env.GITHUB_EVENT_PATH;
      process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${EOL6}`);
    }
  }
}, "getPayload"), getWorkflowEvent = /* @__PURE__ */ __name(() => {
  let eventName = process.env.GITHUB_EVENT_NAME;
  assert(
    EVENT_NAMES.includes(eventName),
    `eventName ${eventName} is not supported`
  );
  let payload = getPayload();
  return isDebug() && (debug(`eventName: ${eventName}`), debug(`payload: ${JSON.stringify(payload)}`)), {
    eventName,
    payload
  };
}, "getWorkflowEvent");

// src/github/context.ts
var getGitHubContext = /* @__PURE__ */ __name(() => {
  let event = getWorkflowEvent(), repo = (() => {
    let [owner, repo2] = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split("/") : raise(
      "context.repo: requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
    ), node_id = "repository" in event.payload ? event.payload.repository?.node_id || raise("context.repo: no repo node_id in payload") : raise("context.repo: no repo node_id in payload");
    return { owner, repo: repo2, node_id };
  })(), branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME, sha = process.env.GITHUB_SHA, graphqlEndpoint = process.env.GITHUB_GRAPHQL_URL, ref = (() => {
    let ref2 = process.env.GITHUB_HEAD_REF;
    return !ref2 && ("ref" in event.payload ? ref2 = event.payload.ref : event.eventName === "pull_request" && (ref2 = event.payload.pull_request.head.ref), !ref2) ? raise("context: no ref") : ref2;
  })(), context = {
    event,
    repo,
    branch,
    sha,
    graphqlEndpoint,
    ref
  };
  if (isDebug()) {
    let debugContext = {
      ...context,
      event: "will debug itself as output is large"
    };
    debug(`context: ${JSON.stringify(debugContext)}`);
  }
  return context;
}, "getGitHubContext"), _context, useContext = /* @__PURE__ */ __name(() => _context ?? (_context = getGitHubContext()), "useContext"), useContextEvent = /* @__PURE__ */ __name(() => useContext().event, "useContextEvent");

// input-keys.ts
var INPUT_KEY_CLOUDFLARE_ACCOUNT_ID = "cloudflare-account-id", INPUT_KEY_CLOUDFLARE_API_TOKEN = "cloudflare-api-token", INPUT_KEY_CLOUDFLARE_PROJECT_NAME = "cloudflare-project-name", INPUT_KEY_DIRECTORY = "directory", INPUT_KEY_GITHUB_ENVIRONMENT = "github-environment", INPUT_KEY_GITHUB_TOKEN = "github-token";

// src/inputs.ts
var OPTIONS = {
  required: !0
}, getInputs = /* @__PURE__ */ __name(() => ({
  cloudflareAccountId: getInput(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID, OPTIONS),
  cloudflareApiToken: getInput(INPUT_KEY_CLOUDFLARE_API_TOKEN, OPTIONS),
  cloudflareProjectName: getInput(INPUT_KEY_CLOUDFLARE_PROJECT_NAME, OPTIONS),
  directory: getInput(INPUT_KEY_DIRECTORY, OPTIONS),
  gitHubApiToken: getInput(INPUT_KEY_GITHUB_TOKEN, OPTIONS),
  gitHubEnvironment: getInput(INPUT_KEY_GITHUB_ENVIRONMENT, OPTIONS)
}), "getInputs"), _inputs, useInputs = /* @__PURE__ */ __name(() => _inputs ?? (_inputs = getInputs()), "useInputs");

// src/cloudflare/api/endpoints.ts
var API_ENDPOINT = "https://api.cloudflare.com", getCloudflareApiEndpoint = /* @__PURE__ */ __name((path) => {
  let { cloudflareAccountId, cloudflareProjectName } = useInputs(), input = [
    `/client/v4/accounts/${cloudflareAccountId}/pages/projects/${cloudflareProjectName}`,
    path
  ].filter(Boolean).join("/");
  return new URL(input, API_ENDPOINT).toString();
}, "getCloudflareApiEndpoint"), getCloudflareLogEndpoint = /* @__PURE__ */ __name((id) => {
  let { cloudflareAccountId, cloudflareProjectName } = useInputs();
  return new URL(
    `${cloudflareAccountId}/pages/view/${cloudflareProjectName}/${id}`,
    "https://dash.cloudflare.com"
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
    super(text), this.name = this.constructor.name, this.text = text, this.notes = notes ?? [], this.location = location, this.kind = kind ?? "error";
  }
};

// src/cloudflare/api/fetch-error.ts
var throwFetchError = /* @__PURE__ */ __name((resource, response) => {
  let error2 = new ParseError({
    text: `A request to the Cloudflare API (${resource}) failed.`,
    notes: response.errors.map((err) => ({
      text: renderError(err)
    }))
  }), code = response.errors[0]?.code;
  throw code && (error2.code = code), error2.notes?.length > 0 && error2.notes.map((note) => {
    error(`Cloudflare API: ${note.text}`);
  }), error2;
}, "throwFetchError"), renderError = /* @__PURE__ */ __name((err, level = 0) => {
  let chainedMessages = err.error_chain?.map(
    (chainedError) => `
${"  ".repeat(level)}- ${renderError(chainedError, level + 1)}`
  ).join(`
`) ?? "";
  return (err.code ? `${err.message} [code: ${err.code}]` : err.message) + chainedMessages;
}, "renderError");

// src/cloudflare/api/fetch-result.ts
var fetchResult = /* @__PURE__ */ __name(async (resource, init = {}, queryParams, abortSignal) => {
  let method = init.method ?? "GET", { cloudflareApiToken } = useInputs(), initFetch = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${cloudflareApiToken}`
    }
  }, response = await fetch(resource, {
    method,
    ...initFetch,
    signal: abortSignal
  }).then((response2) => response2.json());
  if (response.success) {
    if (response.result === null || response.result === void 0)
      throw new Error("Cloudflare API: response missing 'result'");
    return response.result;
  }
  return throwFetchError(resource, response);
}, "fetchResult"), fetchSuccess = /* @__PURE__ */ __name(async (resource, init = {}) => {
  let method = init.method ?? "GET", { cloudflareApiToken } = useInputs(), initFetch = {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${cloudflareApiToken}`
    }
  }, response = await fetch(resource, {
    method,
    ...initFetch
  }).then((response2) => response2.json());
  return !response.success && response.errors.length > 0 && throwFetchError(resource, response), response.success;
}, "fetchSuccess");

// src/cloudflare/deployment/get.ts
var getCloudflareDeployments = /* @__PURE__ */ __name(async () => {
  let url = getCloudflareApiEndpoint("deployments");
  return await fetchResult(url);
}, "getCloudflareDeployments"), getCloudflareDeploymentAlias = /* @__PURE__ */ __name((deployment) => deployment.aliases && deployment.aliases.length > 0 ? deployment.aliases[0] : deployment.url, "getCloudflareDeploymentAlias"), getCloudflareLatestDeployment = /* @__PURE__ */ __name(async () => {
  let { sha: commitHash } = useContext(), deployment = (await getCloudflareDeployments())?.find(
    (deployment2) => deployment2.deployment_trigger.metadata.commit_hash === commitHash
  );
  if (deployment === void 0)
    throw new Error(
      `Cloudflare: could not find deployment with commitHash: ${commitHash}`
    );
  return deployment;
}, "getCloudflareLatestDeployment");

// src/cloudflare/deployment/status.ts
var ERROR_KEY = "Status Of Deployment:", statusCloudflareDeployment = /* @__PURE__ */ __name(async () => {
  let deploymentStatus = "unknown", deployment;
  do
    try {
      deployment = await getCloudflareLatestDeployment();
      let deployStage = deployment.stages.find(
        (stage) => stage.name === "deploy"
      );
      switch (debug(JSON.stringify(deployStage)), deployStage?.status) {
        case "active":
        case "success":
        case "failure":
        case "skipped":
        case "canceled": {
          deploymentStatus = deployStage.status;
          break;
        }
        default:
          await new Promise(
            (resolve) => setTimeout(resolve, 1e3)
          );
      }
    } catch (error2) {
      throw error2 instanceof Error ? error2 : error2 && typeof error2 == "object" && "stderr" in error2 && typeof error2.stderr == "string" ? new Error(error2.stderr) : new Error(`${ERROR_KEY} unknown error`);
    }
  while (deploymentStatus === "unknown");
  return { deployment, status: deploymentStatus };
}, "statusCloudflareDeployment");

// src/cloudflare/deployment/create.ts
var CLOUDFLARE_API_TOKEN = "CLOUDFLARE_API_TOKEN", CLOUDFLARE_ACCOUNT_ID = "CLOUDFLARE_ACCOUNT_ID", ERROR_KEY2 = "Create Deployment:", createCloudflareDeployment = /* @__PURE__ */ __name(async () => {
  let {
    cloudflareAccountId,
    cloudflareProjectName,
    directory,
    cloudflareApiToken
  } = useInputs();
  process.env[CLOUDFLARE_API_TOKEN] = cloudflareApiToken, process.env[CLOUDFLARE_ACCOUNT_ID] = cloudflareAccountId;
  let { repo, branch, sha: commitHash } = useContext();
  if (branch === void 0)
    throw new Error(`${ERROR_KEY2} branch is undefined`);
  try {
    let WRANGLER_VERSION = "3.28.1";
    strict(WRANGLER_VERSION, "wrangler version should exist"), await execAsync(
      `npx wrangler@${WRANGLER_VERSION} pages deploy ${directory} --project-name=${cloudflareProjectName} --branch=${branch} --commit-dirty=true --commit-hash=${commitHash}`,
      {
        env: process.env
      }
    );
    let { deployment, status } = await statusCloudflareDeployment();
    setOutput("id", deployment.id), setOutput("url", deployment.url), setOutput("environment", deployment.environment);
    let alias = getCloudflareDeploymentAlias(deployment);
    return setOutput("alias", alias), await summary.addHeading("Cloudflare Pages Deployment").write(), await summary.addBreak().write(), await summary.addTable([
      [
        {
          data: "Name",
          header: !0
        },
        {
          data: "Result",
          header: !0
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
      ["Status:", `<strong>${status.toUpperCase() || "UNKNOWN"}</strong>`],
      ["Preview URL:", `<a href='${deployment.url}'>${deployment.url}</a>`],
      ["Branch Preview URL:", `<a href='${alias}'>${alias}</a>`]
    ]).write(), deployment;
  } catch (error2) {
    throw error2 instanceof Error ? error2 : error2 && typeof error2 == "object" && "stderr" in error2 && typeof error2.stderr == "string" ? new Error(error2.stderr) : new Error(`${ERROR_KEY2} unknown error`);
  }
}, "createCloudflareDeployment");

// src/cloudflare/project/get.ts
var getCloudflareProject = /* @__PURE__ */ __name(async () => {
  let url = getCloudflareApiEndpoint();
  return await fetchResult(url);
}, "getCloudflareProject");

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
}, DeploymentFragmentFragmentDoc = new TypedDocumentString(`
    fragment DeploymentFragment on Deployment {
  id
  environment
  state
}
    `, { fragmentName: "DeploymentFragment" }), EnvironmentFragmentFragmentDoc = new TypedDocumentString(`
    fragment EnvironmentFragment on Environment {
  name
  id
}
    `, { fragmentName: "EnvironmentFragment" }), FilesDocument = new TypedDocumentString(`
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
    `), AddCommentDocument = new TypedDocumentString(`
    mutation AddComment($subjectId: ID!, $body: String!) {
  addComment(input: {subjectId: $subjectId, body: $body}) {
    commentEdge {
      node {
        id
      }
    }
  }
}
    `), CreateGitHubDeploymentDocument = new TypedDocumentString(`
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
}`), DeleteGitHubDeploymentDocument = new TypedDocumentString(`
    mutation DeleteGitHubDeployment($deploymentId: ID!) {
  deleteDeployment(input: {id: $deploymentId}) {
    clientMutationId
  }
}
    `), DeleteGitHubDeploymentAndCommentDocument = new TypedDocumentString(`
    mutation DeleteGitHubDeploymentAndComment($deploymentId: ID!, $commentId: ID!) {
  deleteDeployment(input: {id: $deploymentId}) {
    clientMutationId
  }
  deleteIssueComment(input: {id: $commentId}) {
    clientMutationId
  }
}
    `), CreateGitHubDeploymentStatusDocument = new TypedDocumentString(`
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
}`), CreateEnvironmentDocument = new TypedDocumentString(`
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
}`), GetEnvironmentDocument = new TypedDocumentString(`
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

// src/cloudflare/deployment/delete.ts
var deleteCloudflareDeployment = /* @__PURE__ */ __name(async (deploymentIdentifier) => {
  let url = getCloudflareApiEndpoint(
    `deployments/${deploymentIdentifier}?force=true`
  );
  try {
    if (await fetchSuccess(url, {
      method: "DELETE"
    }) === !0)
      return info(`Cloudflare Deployment Deleted: ${deploymentIdentifier}`), !0;
    throw new Error("Cloudflare Delete Deployment: fail");
  } catch (successError) {
    return successError instanceof ParseError && successError.code === 8000009 ? (warning(
      `Cloudflare Deployment might have been deleted already: ${deploymentIdentifier}`
    ), !0) : (error(`Cloudflare Error deleting deployment: ${deploymentIdentifier}`), !1);
  }
}, "deleteCloudflareDeployment");

// src/github/api/client.ts
var request = /* @__PURE__ */ __name(async (params) => {
  let { query, variables, options } = params, { errorThrows } = options || { errorThrows: !0 }, { gitHubApiToken } = useInputs(), { graphqlEndpoint } = useContext();
  return fetch(graphqlEndpoint, {
    method: "POST",
    headers: {
      authorization: `bearer ${gitHubApiToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.flash-preview+json"
    },
    body: JSON.stringify({ query: query.toString(), variables })
  }).then((res) => res.json()).then((res) => {
    if (res.errors && errorThrows)
      throw new Error(JSON.stringify(res.errors));
    return res;
  });
}, "request");

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
function graphql(source) {
  return documents[source] ?? {};
}
__name(graphql, "graphql");

// src/github/deployment/delete.ts
var MutationDeleteGitHubDeployment = graphql(
  /* GraphQL */
  `
  mutation DeleteGitHubDeployment($deploymentId: ID!) {
    deleteDeployment(input: {id: $deploymentId}) {
      clientMutationId
    }
  }
`
), MutationDeleteGitHubDeploymentAndComment = graphql(
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

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/lowercase-keys.js
function lowercaseKeys(object) {
  return object ? Object.keys(object).reduce((newObj, key) => (newObj[key.toLowerCase()] = object[key], newObj), {}) : {};
}
__name(lowercaseKeys, "lowercaseKeys");

// node_modules/.pnpm/is-plain-obj@4.1.0/node_modules/is-plain-obj/index.js
function isPlainObject(value) {
  if (typeof value != "object" || value === null)
    return !1;
  let prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}
__name(isPlainObject, "isPlainObject");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/merge-deep.js
function mergeDeep(defaults, options) {
  let result = Object.assign({}, defaults);
  return Object.keys(options).forEach((key) => {
    isPlainObject(options[key]) ? key in defaults ? result[key] = mergeDeep(defaults[key], options[key]) : Object.assign(result, { [key]: options[key] }) : Object.assign(result, { [key]: options[key] });
  }), result;
}
__name(mergeDeep, "mergeDeep");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/remove-undefined-properties.js
function removeUndefinedProperties(obj) {
  for (let key in obj)
    obj[key] === void 0 && delete obj[key];
  return obj;
}
__name(removeUndefinedProperties, "removeUndefinedProperties");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/merge.js
function merge(defaults, route, options) {
  if (typeof route == "string") {
    let [method, url] = route.split(" ");
    options = Object.assign(url ? { method, url } : { url: method }, options);
  } else
    options = Object.assign({}, route);
  options.headers = lowercaseKeys(options.headers), removeUndefinedProperties(options), removeUndefinedProperties(options.headers);
  let mergedOptions = mergeDeep(defaults || {}, options);
  return defaults && defaults.mediaType.previews.length && (mergedOptions.mediaType.previews = defaults.mediaType.previews.filter((preview) => !mergedOptions.mediaType.previews.includes(preview)).concat(mergedOptions.mediaType.previews)), mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map(
    (preview) => preview.replace(/-preview/, "")
  ), mergedOptions;
}
__name(merge, "merge");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/add-query-parameters.js
function addQueryParameters(url, parameters) {
  let separator = /\?/.test(url) ? "&" : "?", names = Object.keys(parameters);
  if (names.length === 0)
    return url;
  let query = names.map((name) => name === "q" ? "q=" + parameters.q.split("+").map(encodeURIComponent).join("+") : `${name}=${encodeURIComponent(parameters[name])}`).join("&");
  return url + separator + query;
}
__name(addQueryParameters, "addQueryParameters");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/extract-url-variable-names.js
var urlVariableRegex = /\{[^}]+\}/g;
function removeNonChars(variableName) {
  return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
}
__name(removeNonChars, "removeNonChars");
function extractUrlVariableNames(url) {
  let matches = url.match(urlVariableRegex);
  return matches ? matches.map(removeNonChars).reduce((a, b) => a.concat(b), []) : [];
}
__name(extractUrlVariableNames, "extractUrlVariableNames");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/omit.js
function omit(object, keysToOmit) {
  return Object.keys(object).filter((option) => !keysToOmit.includes(option)).reduce((obj, key) => (obj[key] = object[key], obj), {});
}
__name(omit, "omit");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/util/url-template.js
function encodeReserved(str) {
  return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
    return /%[0-9A-Fa-f]/.test(part) || (part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]")), part;
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
  return value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value), key ? encodeUnreserved(key) + "=" + value : value;
}
__name(encodeValue, "encodeValue");
function isDefined(value) {
  return value != null;
}
__name(isDefined, "isDefined");
function isKeyOperator(operator) {
  return operator === ";" || operator === "&" || operator === "?";
}
__name(isKeyOperator, "isKeyOperator");
function getValues(context, operator, key, modifier) {
  var value = context[key], result = [];
  if (isDefined(value) && value !== "")
    if (typeof value == "string" || typeof value == "number" || typeof value == "boolean")
      value = value.toString(), modifier && modifier !== "*" && (value = value.substring(0, parseInt(modifier, 10))), result.push(
        encodeValue(operator, value, isKeyOperator(operator) ? key : "")
      );
    else if (modifier === "*")
      Array.isArray(value) ? value.filter(isDefined).forEach(function(value2) {
        result.push(
          encodeValue(operator, value2, isKeyOperator(operator) ? key : "")
        );
      }) : Object.keys(value).forEach(function(k) {
        isDefined(value[k]) && result.push(encodeValue(operator, value[k], k));
      });
    else {
      let tmp = [];
      Array.isArray(value) ? value.filter(isDefined).forEach(function(value2) {
        tmp.push(encodeValue(operator, value2));
      }) : Object.keys(value).forEach(function(k) {
        isDefined(value[k]) && (tmp.push(encodeUnreserved(k)), tmp.push(encodeValue(operator, value[k].toString())));
      }), isKeyOperator(operator) ? result.push(encodeUnreserved(key) + "=" + tmp.join(",")) : tmp.length !== 0 && result.push(tmp.join(","));
    }
  else
    operator === ";" ? isDefined(value) && result.push(encodeUnreserved(key)) : value === "" && (operator === "&" || operator === "?") ? result.push(encodeUnreserved(key) + "=") : value === "" && result.push("");
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
        let operator = "", values = [];
        if (operators.indexOf(expression.charAt(0)) !== -1 && (operator = expression.charAt(0), expression = expression.substr(1)), expression.split(/,/g).forEach(function(variable) {
          var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
          values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
        }), operator && operator !== "+") {
          var separator = ",";
          return operator === "?" ? separator = "&" : operator !== "#" && (separator = operator), (values.length !== 0 ? operator : "") + values.join(separator);
        } else
          return values.join(",");
      } else
        return encodeReserved(literal);
    }
  );
}
__name(expand, "expand");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/parse.js
function parse(options) {
  let method = options.method.toUpperCase(), url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}"), headers = Object.assign({}, options.headers), body, parameters = omit(options, [
    "method",
    "baseUrl",
    "url",
    "headers",
    "request",
    "mediaType"
  ]), urlVariableNames = extractUrlVariableNames(url);
  url = parseUrl(url).expand(parameters), /^http/.test(url) || (url = options.baseUrl + url);
  let omittedParameters = Object.keys(options).filter((option) => urlVariableNames.includes(option)).concat("baseUrl"), remainingParameters = omit(parameters, omittedParameters);
  if (!/application\/octet-stream/i.test(headers.accept) && (options.mediaType.format && (headers.accept = headers.accept.split(/,/).map(
    (preview) => preview.replace(
      /application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,
      `application/vnd$1$2.${options.mediaType.format}`
    )
  ).join(",")), options.mediaType.previews.length)) {
    let previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
    headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map((preview) => {
      let format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
      return `application/vnd.github.${preview}-preview${format}`;
    }).join(",");
  }
  return ["GET", "HEAD"].includes(method) ? url = addQueryParameters(url, remainingParameters) : "data" in remainingParameters ? body = remainingParameters.data : Object.keys(remainingParameters).length && (body = remainingParameters), !headers["content-type"] && typeof body < "u" && (headers["content-type"] = "application/json; charset=utf-8"), ["PATCH", "PUT"].includes(method) && typeof body > "u" && (body = ""), Object.assign(
    { method, url, headers },
    typeof body < "u" ? { body } : null,
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
  let DEFAULTS2 = merge(oldDefaults, newDefaults), endpoint2 = endpointWithDefaults.bind(null, DEFAULTS2);
  return Object.assign(endpoint2, {
    DEFAULTS: DEFAULTS2,
    defaults: withDefaults.bind(null, DEFAULTS2),
    merge: merge.bind(null, DEFAULTS2),
    parse
  });
}
__name(withDefaults, "withDefaults");

// node_modules/.pnpm/universal-user-agent@7.0.2/node_modules/universal-user-agent/index.js
function getUserAgent() {
  return typeof navigator == "object" && "userAgent" in navigator ? navigator.userAgent : typeof process == "object" && process.version !== void 0 ? `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})` : "<environment undetectable>";
}
__name(getUserAgent, "getUserAgent");

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/version.js
var VERSION = "2.7.1";

// node_modules/.pnpm/@octokit-next+endpoint@2.7.1/node_modules/@octokit-next/endpoint/lib/defaults.js
var userAgent = `octokit-next-endpoint.js/${VERSION} ${getUserAgent()}`, DEFAULTS = {
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
  return isObject(o) === !1 ? !1 : (ctor = o.constructor, ctor === void 0 ? !0 : (prot = ctor.prototype, !(isObject(prot) === !1 || prot.hasOwnProperty("isPrototypeOf") === !1)));
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
    super(message), Error.captureStackTrace && Error.captureStackTrace(this, this.constructor), this.name = "HttpError", this.status = statusCode, "response" in options && (this.response = options.response);
    let requestCopy = { ...options.request };
    options.request.headers.authorization && (requestCopy.headers = {
      ...options.request.headers,
      authorization: options.request.headers.authorization.replace(
        / .*$/,
        " [REDACTED]"
      )
    }), requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]"), this.request = requestCopy;
  }
};

// node_modules/.pnpm/@octokit-next+request@2.7.1/node_modules/@octokit-next/request/lib/get-buffer-response.js
function getBufferResponse(response) {
  return response.arrayBuffer();
}
__name(getBufferResponse, "getBufferResponse");

// node_modules/.pnpm/@octokit-next+request@2.7.1/node_modules/@octokit-next/request/lib/fetch-wrapper.js
function fetchWrapper(requestOptions) {
  let log = requestOptions.request?.log || console;
  (isPlainObject2(requestOptions.body) || Array.isArray(requestOptions.body)) && (requestOptions.body = JSON.stringify(requestOptions.body));
  let responseHeaders = {}, status, url, { redirect, fetch: fetch2, ...remainingRequestOptions } = requestOptions.request || {}, fetchOptions = {
    method: requestOptions.method,
    body: requestOptions.body,
    headers: requestOptions.headers,
    redirect,
    ...remainingRequestOptions
  };
  return (fetch2 || globalThis.fetch)(requestOptions.url, fetchOptions).then(async (response) => {
    url = response.url, status = response.status;
    for (let keyAndValue of response.headers)
      responseHeaders[keyAndValue[0]] = keyAndValue[1];
    if ("deprecation" in responseHeaders) {
      let matches = responseHeaders.link && responseHeaders.link.match(/<([^>]+)>; rel="deprecation"/), deprecationLink = matches && matches.pop();
      log.warn(
        `[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${responseHeaders.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`
      );
    }
    if (!(status === 204 || status === 205)) {
      if (requestOptions.method === "HEAD") {
        if (status < 400)
          return;
        throw new RequestError(response.statusText, status, {
          response: {
            url,
            status,
            headers: responseHeaders,
            data: void 0
          },
          request: requestOptions
        });
      }
      if (status === 304)
        throw new RequestError("Not modified", status, {
          response: {
            url,
            status,
            headers: responseHeaders,
            data: await getResponseData(response)
          },
          request: requestOptions
        });
      if (status >= 400) {
        let data = await getResponseData(response);
        throw new RequestError(toErrorMessage(data), status, {
          response: {
            url,
            status,
            headers: responseHeaders,
            data
          },
          request: requestOptions
        });
      }
      return getResponseData(response);
    }
  }).then((data) => ({
    status,
    url,
    headers: responseHeaders,
    data
  })).catch((error2) => {
    throw error2 instanceof RequestError || error2.name === "AbortError" ? error2 : new RequestError(error2.message, 500, {
      request: requestOptions
    });
  });
}
__name(fetchWrapper, "fetchWrapper");
async function getResponseData(response) {
  let contentType = response.headers.get("content-type");
  return /application\/json/.test(contentType) ? response.json() : !contentType || /^text\/|charset=utf-8$/.test(contentType) ? response.text() : getBufferResponse(response);
}
__name(getResponseData, "getResponseData");
function toErrorMessage(data) {
  return typeof data == "string" ? data : "message" in data ? Array.isArray(data.errors) ? `${data.message}: ${data.errors.map(JSON.stringify).join(", ")}` : data.message : `Unknown error: ${JSON.stringify(data)}`;
}
__name(toErrorMessage, "toErrorMessage");

// node_modules/.pnpm/@octokit-next+request@2.7.1/node_modules/@octokit-next/request/lib/with-defaults.js
function withDefaults2(oldEndpoint, newDefaults) {
  let endpoint2 = oldEndpoint.defaults(newDefaults);
  return Object.assign(/* @__PURE__ */ __name(function(route, parameters) {
    let endpointOptions = endpoint2.merge(route, parameters);
    if (!endpointOptions.request || !endpointOptions.request.hook)
      return fetchWrapper(endpoint2.parse(endpointOptions));
    let request3 = /* @__PURE__ */ __name((route2, parameters2) => fetchWrapper(endpoint2.parse(endpoint2.merge(route2, parameters2))), "request");
    return Object.assign(request3, {
      endpoint: endpoint2,
      defaults: withDefaults2.bind(null, endpoint2)
    }), endpointOptions.request.hook(request3, endpointOptions);
  }, "newApi"), {
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
var REGEX_IS_INSTALLATION_LEGACY = /^v1\./, REGEX_IS_INSTALLATION = /^ghs_/, REGEX_IS_USER_TO_SERVER = /^ghu_/;
async function auth(token) {
  let isApp = token.split(/\./).length === 3, isInstallation = REGEX_IS_INSTALLATION_LEGACY.test(token) || REGEX_IS_INSTALLATION.test(token), isUserToServer = REGEX_IS_USER_TO_SERVER.test(token);
  return {
    type: "token",
    token,
    tokenType: isApp ? "app" : isInstallation ? "installation" : isUserToServer ? "user-to-server" : "oauth"
  };
}
__name(auth, "auth");

// node_modules/.pnpm/@octokit-next+auth-token@2.7.1/node_modules/@octokit-next/auth-token/lib/with-authorization-prefix.js
function withAuthorizationPrefix(token) {
  return token.split(/\./).length === 3 ? `bearer ${token}` : `token ${token}`;
}
__name(withAuthorizationPrefix, "withAuthorizationPrefix");

// node_modules/.pnpm/@octokit-next+auth-token@2.7.1/node_modules/@octokit-next/auth-token/lib/hook.js
async function hook(token, request3, route, parameters) {
  let endpoint2 = request3.endpoint.merge(route, parameters);
  return endpoint2.headers.authorization = withAuthorizationPrefix(token), request3(endpoint2);
}
__name(hook, "hook");

// node_modules/.pnpm/@octokit-next+auth-token@2.7.1/node_modules/@octokit-next/auth-token/index.js
function createTokenAuth(options) {
  if (!options?.token)
    throw new Error(
      "[@octokit/auth-token] options.token not set for createTokenAuth(options)"
    );
  if (typeof options?.token != "string")
    throw new Error(
      "[@octokit/auth-token] options.token is not a string for createTokenAuth(options)"
    );
  let token = options.token.replace(/^(token|bearer) +/i, "");
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
` + data.errors.map((e) => ` - ${e.message}`).join(`
`);
}
__name(_buildMessageForResponseErrors, "_buildMessageForResponseErrors");
var GraphqlResponseError = class extends Error {
  static {
    __name(this, "GraphqlResponseError");
  }
  constructor(request3, headers, response) {
    super(_buildMessageForResponseErrors(response)), this.request = request3, this.headers = headers, this.response = response, this.name = "GraphqlResponseError", this.errors = response.errors, this.data = response.data, Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
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
], FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"], GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
function graphql2(request3, query, options) {
  if (options) {
    if (typeof query == "string" && "query" in options)
      return Promise.reject(
        new Error('[@octokit/graphql] "query" cannot be used as variable name')
      );
    for (let key in options)
      if (FORBIDDEN_VARIABLE_OPTIONS.includes(key))
        return Promise.reject(
          new Error(`[@octokit/graphql] "${key}" cannot be used as variable name`)
        );
  }
  let parsedOptions = typeof query == "string" ? Object.assign({ query }, options) : query, requestOptions = Object.keys(parsedOptions).reduce((result, key) => NON_VARIABLE_OPTIONS.includes(key) ? (result[key] = parsedOptions[key], result) : (result.variables || (result.variables = {}), result.variables[key] = parsedOptions[key], result), {}), baseUrl = parsedOptions.baseUrl || request3.endpoint.DEFAULTS.baseUrl;
  return GHES_V3_SUFFIX_REGEX.test(baseUrl) && (requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql")), request3(requestOptions).then((response) => {
    if (response.data.errors) {
      let headers = {};
      for (let key of Object.keys(response.headers))
        headers[key] = response.headers[key];
      throw new GraphqlResponseError(requestOptions, headers, response.data);
    }
    return response.data.data;
  });
}
__name(graphql2, "graphql");

// node_modules/.pnpm/@octokit-next+graphql@2.7.1/node_modules/@octokit-next/graphql/lib/with-defaults.js
function withDefaults3(oldRequest, newDefaults) {
  let newRequest = oldRequest.defaults(newDefaults);
  return Object.assign(/* @__PURE__ */ __name((query, options) => graphql2(newRequest, query, options), "newApi"), {
    defaults: withDefaults3.bind(null, newRequest),
    endpoint: newRequest.endpoint
  });
}
__name(withDefaults3, "withDefaults");

// node_modules/.pnpm/@octokit-next+graphql@2.7.1/node_modules/@octokit-next/graphql/index.js
var graphql3 = withDefaults3(request2, {
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
  if (typeof method != "function")
    throw new Error("method for before hook must be a function");
  return options || (options = {}), Array.isArray(name) ? name.reverse().reduce((callback, name2) => register.bind(null, state, name2, callback, options), method)() : Promise.resolve().then(() => state.registry[name] ? state.registry[name].reduce((method2, registered) => registered.hook.bind(null, method2, options), method)() : method(options));
}
__name(register, "register");

// node_modules/.pnpm/before-after-hook@3.0.2/node_modules/before-after-hook/lib/add.js
function addHook(state, kind, name, hook2) {
  let orig = hook2;
  state.registry[name] || (state.registry[name] = []), kind === "before" && (hook2 = /* @__PURE__ */ __name((method, options) => Promise.resolve().then(orig.bind(null, options)).then(method.bind(null, options)), "hook")), kind === "after" && (hook2 = /* @__PURE__ */ __name((method, options) => {
    let result;
    return Promise.resolve().then(method.bind(null, options)).then((result_) => (result = result_, orig(result, options))).then(() => result);
  }, "hook")), kind === "error" && (hook2 = /* @__PURE__ */ __name((method, options) => Promise.resolve().then(method.bind(null, options)).catch((error2) => orig(error2, options)), "hook")), state.registry[name].push({
    hook: hook2,
    orig
  });
}
__name(addHook, "addHook");

// node_modules/.pnpm/before-after-hook@3.0.2/node_modules/before-after-hook/lib/remove.js
function removeHook(state, name, method) {
  if (!state.registry[name])
    return;
  let index = state.registry[name].map((registered) => registered.orig).indexOf(method);
  index !== -1 && state.registry[name].splice(index, 1);
}
__name(removeHook, "removeHook");

// node_modules/.pnpm/before-after-hook@3.0.2/node_modules/before-after-hook/index.js
var bind = Function.bind, bindable = bind.bind(bind);
function bindApi(hook2, state, name) {
  let removeHookRef = bindable(removeHook, null).apply(
    null,
    name ? [state, name] : [state]
  );
  hook2.api = { remove: removeHookRef }, hook2.remove = removeHookRef, ["before", "error", "after", "wrap"].forEach((kind) => {
    let args = name ? [state, kind, name] : [state, kind];
    hook2[kind] = hook2.api[kind] = bindable(addHook, null).apply(null, args);
  });
}
__name(bindApi, "bindApi");
function Singular() {
  let singularHookName = Symbol("Singular"), singularHookState = {
    registry: {}
  }, singularHook = register.bind(null, singularHookState, singularHookName);
  return bindApi(singularHook, singularHookState, singularHookName), singularHook;
}
__name(Singular, "Singular");
function Collection() {
  let state = {
    registry: {}
  }, hook2 = register.bind(null, state);
  return bindApi(hook2, state), hook2;
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
    let currentPlugins = this.PLUGINS;
    return class extends this {
      static PLUGINS = currentPlugins.concat(
        newPlugins.filter((plugin) => !currentPlugins.includes(plugin))
      );
    };
  }
  static withDefaults(defaults) {
    let newDefaultUserAgent = [defaults?.userAgent, this.DEFAULTS.userAgent].filter(Boolean).join(" "), newDefaults = {
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
        if (typeof defaults == "function") {
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
    let hook2 = new before_after_hook_default.Collection(), requestDefaults = {
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
    }, userAgent2 = [options?.userAgent, this.constructor.DEFAULTS.userAgent].filter(Boolean).join(" ");
    if (requestDefaults.headers["user-agent"] = userAgent2, this.options.previews && (requestDefaults.mediaType.previews = this.options.previews), this.options.timeZone && (requestDefaults.headers["time-zone"] = this.options.timeZone), this.constructor.PLUGINS.forEach((plugin) => {
      Object.assign(this, plugin(this, this.options));
    }), this.request = request2.defaults(requestDefaults), this.graphql = withCustomRequest(this.request).defaults(requestDefaults), this.log = Object.assign(
      {
        debug: () => {
        },
        info: () => {
        },
        warn: console.warn.bind(console),
        error: console.error.bind(console)
      },
      this.options.log
    ), this.hook = hook2, this.options.authStrategy) {
      let { authStrategy, ...otherOptions } = this.options, auth2 = authStrategy(
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
      hook2.wrap("request", auth2.hook), this.auth = auth2;
    } else if (!this.options.auth)
      this.auth = async () => ({
        type: "unauthenticated"
      });
    else {
      let auth2 = createTokenAuth({ token: this.options.auth });
      hook2.wrap("request", auth2.hook), this.auth = auth2;
    }
  }
};

// node_modules/.pnpm/@octokit+plugin-paginate-rest@10.0.0_@octokit+core@6.0.1/node_modules/@octokit/plugin-paginate-rest/dist-bundle/index.js
var VERSION5 = "0.0.0-development";
function normalizePaginatedListResponse(response) {
  if (!response.data)
    return {
      ...response,
      data: []
    };
  if (!("total_count" in response.data && !("url" in response.data)))
    return response;
  let incompleteResults = response.data.incomplete_results, repositorySelection = response.data.repository_selection, totalCount = response.data.total_count;
  delete response.data.incomplete_results, delete response.data.repository_selection, delete response.data.total_count;
  let namespaceKey = Object.keys(response.data)[0], data = response.data[namespaceKey];
  return response.data = data, typeof incompleteResults < "u" && (response.data.incomplete_results = incompleteResults), typeof repositorySelection < "u" && (response.data.repository_selection = repositorySelection), response.data.total_count = totalCount, response;
}
__name(normalizePaginatedListResponse, "normalizePaginatedListResponse");
function iterator(octokit, route, parameters) {
  let options = typeof route == "function" ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters), requestMethod = typeof route == "function" ? route : octokit.request, method = options.method, headers = options.headers, url = options.url;
  return {
    [Symbol.asyncIterator]: () => ({
      async next() {
        if (!url)
          return { done: !0 };
        try {
          let response = await requestMethod({ method, url, headers }), normalizedResponse = normalizePaginatedListResponse(response);
          return url = ((normalizedResponse.headers.link || "").match(
            /<([^>]+)>;\s*rel="next"/
          ) || [])[1], { value: normalizedResponse };
        } catch (error2) {
          if (error2.status !== 409)
            throw error2;
          return url = "", {
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
function paginate(octokit, route, parameters, mapFn) {
  return typeof parameters == "function" && (mapFn = parameters, parameters = void 0), gather(
    octokit,
    [],
    iterator(octokit, route, parameters)[Symbol.asyncIterator](),
    mapFn
  );
}
__name(paginate, "paginate");
function gather(octokit, results, iterator2, mapFn) {
  return iterator2.next().then((result) => {
    if (result.done)
      return results;
    let earlyExit = !1;
    function done() {
      earlyExit = !0;
    }
    return __name(done, "done"), results = results.concat(
      mapFn ? mapFn(result.value, done) : result.value.data
    ), earlyExit ? results : gather(octokit, results, iterator2, mapFn);
  });
}
__name(gather, "gather");
var composePaginateRest = Object.assign(paginate, {
  iterator
});
function paginateRest(octokit) {
  return {
    paginate: Object.assign(paginate.bind(null, octokit), {
      iterator: iterator.bind(null, octokit)
    })
  };
}
__name(paginateRest, "paginateRest");
paginateRest.VERSION = VERSION5;

// src/github/api/paginate.ts
var paginate2 = /* @__PURE__ */ __name(async (endpoint2, options) => {
  let { gitHubApiToken } = useInputs();
  return new (Octokit.withPlugins([paginateRest]))({
    auth: gitHubApiToken
  }).paginate(endpoint2, options);
}, "paginate");

// src/github/deployment/get.ts
var getGitHubDeployments = /* @__PURE__ */ __name(async () => {
  let { repo, branch } = useContext();
  return await paginate2("GET /repos/{owner}/{repo}/deployments", {
    owner: repo.owner,
    repo: repo.repo,
    ref: branch,
    per_page: 100
  });
}, "getGitHubDeployments");

// src/github/deployment/status.ts
var MutationCreateGitHubDeploymentStatus = graphql(
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

// src/delete.ts
var idDeploymentPayload = /* @__PURE__ */ __name((payload) => {
  let parsedPayload = typeof payload == "string" ? JSON.parse(payload) : payload;
  return !parsedPayload || typeof parsedPayload != "object" ? !1 : "cloudflareId" in parsedPayload && "url" in parsedPayload;
}, "idDeploymentPayload"), deleteDeployments = /* @__PURE__ */ __name(async (isProduction = !1) => {
  let deployments = await getGitHubDeployments();
  if (isProduction && (deployments = deployments.slice(5)), deployments.length === 0) {
    info("No deployments found to delete");
    return;
  }
  for (let deployment of deployments) {
    let payload = deployment.payload;
    if (!idDeploymentPayload(payload)) {
      info(`Deployment ${deployment.id} has no payload`);
      continue;
    }
    let { cloudflareId, commentId, url } = payload;
    if (!await deleteCloudflareDeployment(cloudflareId))
      continue;
    let updateStatusGitHubDeployment = await request({
      query: MutationCreateGitHubDeploymentStatus,
      variables: {
        environment: deployment.environment,
        deploymentId: deployment.node_id,
        environmentUrl: url,
        logUrl: getCloudflareLogEndpoint(cloudflareId),
        state: "INACTIVE" /* Inactive */
      },
      options: {
        errorThrows: !1
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
    let deletedGitHubDeployment = commentId ? await request({
      query: MutationDeleteGitHubDeploymentAndComment,
      variables: {
        deploymentId: deployment.node_id,
        commentId
      },
      options: {
        errorThrows: !1
      }
    }) : await request({
      query: MutationDeleteGitHubDeployment,
      variables: {
        deploymentId: deployment.node_id
      },
      options: {
        errorThrows: !1
      }
    });
    deletedGitHubDeployment.errors && warning(
      `Error deleting GitHub deployment: ${JSON.stringify(
        deletedGitHubDeployment.errors
      )}`
    ), info(`GitHub Deployment Deleted: ${deployment.node_id}`);
  }
}, "deleteDeployments");

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
), addComment = /* @__PURE__ */ __name(async (deployment) => {
  let { eventName, payload } = useContextEvent();
  if (eventName === "pull_request" && payload.action !== "closed") {
    let prNodeId = payload.pull_request.node_id ?? raise("No pull request node id"), { sha } = useContext(), rawBody = `## Cloudflare Pages Deployment
 **Environment:** ${deployment.environment} 
 **Project:** ${deployment.project_name} 
 **Built with commit:** ${sha}
 **Preview URL:** ${deployment.url} 
 **Branch Preview URL:** ${getCloudflareDeploymentAlias(deployment)}`;
    return (await request({
      query: MutationAddComment,
      variables: {
        subjectId: prNodeId,
        body: rawBody
      }
    })).data.addComment?.commentEdge?.node?.id;
  }
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
), MutationCreateEnvironment = graphql(
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
), checkEnvironment = /* @__PURE__ */ __name(async () => {
  let { gitHubEnvironment } = useInputs(), { repo, ref } = useContext(), environment = await request({
    query: QueryGetEnvironment,
    variables: {
      owner: repo.owner,
      repo: repo.repo,
      environment_name: gitHubEnvironment,
      qualifiedName: ref
    },
    options: {
      errorThrows: !1
    }
  });
  return environment.errors ? raiseFail(
    `GitHub Environment: Errors - ${JSON.stringify(environment.errors)}`
  ) : environment.data.repository?.environment ? environment.data.repository?.ref?.id ? {
    ...environment.data.repository.environment,
    refId: environment.data.repository?.ref?.id
  } : raiseFail(`GitHub Environment: No ref id ${gitHubEnvironment}`) : raiseFail(`GitHub Environment: Not created for ${gitHubEnvironment}`);
}, "checkEnvironment");

// src/github/deployment/create.ts
var MutationCreateGitHubDeployment = graphql(
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
), createGitHubDeployment = /* @__PURE__ */ __name(async ({ id, url }, commentId) => {
  let { name, refId } = await checkEnvironment() ?? raise("GitHub Deployment: GitHub Environment is required"), { repo } = useContext(), payload = { cloudflareId: id, url, commentId }, gitHubDeploymentId = (await request({
    query: MutationCreateGitHubDeployment,
    variables: {
      repositoryId: repo.node_id,
      environmentName: name,
      refId,
      payload: JSON.stringify(payload),
      description: `Cloudflare Pages Deployment: ${id}`
    }
  })).data.createDeployment?.deployment?.id ?? raise("GitHub Deployment: GitHub deployment id is required");
  await request({
    query: MutationCreateGitHubDeploymentStatus,
    variables: {
      environment: name,
      deploymentId: gitHubDeploymentId,
      environmentUrl: url,
      logUrl: getCloudflareLogEndpoint(id),
      state: "SUCCESS" /* Success */
    }
  });
}, "createGitHubDeployment");

// src/main.ts
async function run() {
  let { branch } = useContext(), { eventName, payload } = useContextEvent();
  if (eventName !== "push" && eventName !== "pull_request") {
    setFailed(`GitHub Action event name '${eventName}' not supported.`);
    return;
  }
  let project = await getCloudflareProject();
  if (eventName === "pull_request" && payload.action === "closed") {
    await deleteDeployments();
    return;
  }
  let isProduction = project.production_branch === branch;
  if (eventName === "push" && isProduction)
    try {
      info("Is production branch, deleting old deployments but latest 5"), await deleteDeployments(isProduction);
    } catch {
      info("Error deleting deployments for production branch");
    }
  let cloudflareDeployment = await createCloudflareDeployment(), commentId = await addComment(cloudflareDeployment);
  await createGitHubDeployment(cloudflareDeployment, commentId);
}
__name(run, "run");

// src/index.ts
try {
  run();
} catch (error2) {
  error2 instanceof Error && setFailed(error2.message);
}
//# sourceMappingURL=index.js.map
