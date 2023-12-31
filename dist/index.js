import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
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

// node_modules/.pnpm/@octokit+plugin-paginate-rest@9.1.5_@octokit+core@5.0.2/node_modules/@octokit/plugin-paginate-rest/dist-node/index.js
var require_dist_node = __commonJS({
  "node_modules/.pnpm/@octokit+plugin-paginate-rest@9.1.5_@octokit+core@5.0.2/node_modules/@octokit/plugin-paginate-rest/dist-node/index.js"(exports, module) {
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
    var VERSION5 = "9.1.5";
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
      let url = options.url;
      return {
        [Symbol.asyncIterator]: () => ({
          async next() {
            if (!url)
              return { done: true };
            try {
              const response = await requestMethod({ method, url, headers });
              const normalizedResponse = normalizePaginatedListResponse(response);
              url = ((normalizedResponse.headers.link || "").match(
                /<([^>]+)>;\s*rel="next"/
              ) || [])[1];
              return { value: normalizedResponse };
            } catch (error2) {
              if (error2.status !== 409)
                throw error2;
              url = "";
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
      "GET /advisories",
      "GET /app/hook/deliveries",
      "GET /app/installation-requests",
      "GET /app/installations",
      "GET /assignments/{assignment_id}/accepted_assignments",
      "GET /classrooms",
      "GET /classrooms/{classroom_id}/assignments",
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
      "GET /orgs/{org}/actions/cache/usage-by-repository",
      "GET /orgs/{org}/actions/permissions/repositories",
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
      "GET /orgs/{org}/copilot/billing/seats",
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
      "GET /orgs/{org}/personal-access-token-requests",
      "GET /orgs/{org}/personal-access-token-requests/{pat_request_id}/repositories",
      "GET /orgs/{org}/personal-access-tokens",
      "GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories",
      "GET /orgs/{org}/projects",
      "GET /orgs/{org}/properties/values",
      "GET /orgs/{org}/public_members",
      "GET /orgs/{org}/repos",
      "GET /orgs/{org}/rulesets",
      "GET /orgs/{org}/rulesets/rule-suites",
      "GET /orgs/{org}/secret-scanning/alerts",
      "GET /orgs/{org}/security-advisories",
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
      "GET /repos/{owner}/{repo}/actions/artifacts",
      "GET /repos/{owner}/{repo}/actions/caches",
      "GET /repos/{owner}/{repo}/actions/organization-secrets",
      "GET /repos/{owner}/{repo}/actions/organization-variables",
      "GET /repos/{owner}/{repo}/actions/runners",
      "GET /repos/{owner}/{repo}/actions/runs",
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts",
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs",
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs",
      "GET /repos/{owner}/{repo}/actions/secrets",
      "GET /repos/{owner}/{repo}/actions/variables",
      "GET /repos/{owner}/{repo}/actions/workflows",
      "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
      "GET /repos/{owner}/{repo}/activity",
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
      "GET /repos/{owner}/{repo}/rulesets/rule-suites",
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

// src/inputs.ts
var INPUT_KEY_CLOUDFLARE_ACCOUNT_ID = "cloudflare-account-id";
var INPUT_KEY_CLOUDFLARE_API_TOKEN = "cloudflare-api-token";
var INPUT_KEY_CLOUDFLARE_PROJECT_NAME = "cloudflare-project-name";
var INPUT_KEY_DIRECTORY = "directory";
var INPUT_KEY_GITHUB_ENVIRONMENT = "github-environment";
var INPUT_KEY_GITHUB_TOKEN = "github-token";
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
import { exec } from "node:child_process";
import { promisify } from "node:util";
var raise = /* @__PURE__ */ __name((message) => {
  throw new Error(message);
}, "raise");
var execAsync = promisify(exec);

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
    if (existsSync2(process.env.GITHUB_EVENT_PATH)) {
      return JSON.parse(
        readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" })
      );
    } else {
      const path = process.env.GITHUB_EVENT_PATH;
      process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${EOL6}`);
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
    let [method, url] = route.split(" ");
    options = Object.assign(url ? { method, url } : { url: method }, options);
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
function addQueryParameters(url, parameters) {
  const separator = /\?/.test(url) ? "&" : "?";
  const names = Object.keys(parameters);
  if (names.length === 0) {
    return url;
  }
  const query = names.map((name) => {
    if (name === "q") {
      return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
    }
    return `${name}=${encodeURIComponent(parameters[name])}`;
  }).join("&");
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
  const matches = url.match(urlVariableRegex);
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
  let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
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
  const urlVariableNames = extractUrlVariableNames(url);
  url = parseUrl(url).expand(parameters);
  if (!/^http/.test(url)) {
    url = options.baseUrl + url;
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
    url = addQueryParameters(url, remainingParameters);
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
    { method, url, headers },
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

// node_modules/.pnpm/universal-user-agent@7.0.2/node_modules/universal-user-agent/index.js
function getUserAgent() {
  if (typeof navigator === "object" && "userAgent" in navigator) {
    return navigator.userAgent;
  }
  if (typeof process === "object" && process.version !== void 0) {
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
  let url;
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
    url = response.url;
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
          url,
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
          url,
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
          url,
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
      url,
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
var getCloudflareApiEndpoint = /* @__PURE__ */ __name((path) => {
  const { cloudflareAccountId, cloudflareProjectName } = useInputs();
  const input = [
    `/client/v4/accounts/${cloudflareAccountId}/pages/projects/${cloudflareProjectName}`,
    path
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
  const url = getCloudflareApiEndpoint("deployments");
  const result = await fetchResult(url);
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
var createGitHubDeployment = /* @__PURE__ */ __name(async ({ id, url }, commentId) => {
  const { name, refId } = await checkEnvironment() ?? raise("GitHub Deployment: GitHub Environment is required");
  const { repo } = useContext();
  const payload = { cloudflareId: id, url, commentId };
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
      environmentUrl: url,
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
    const WRANGLER_VERSION = "3.22.1";
    strict(WRANGLER_VERSION, "wrangler version should exist");
    await execAsync(
      `npx wrangler@${WRANGLER_VERSION} pages deploy ${directory} --project-name=${cloudflareProjectName} --branch=${branch} --commit-dirty=true --commit-hash=${commitHash}`,
      {
        env: process.env
      }
    );
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
  const url = getCloudflareApiEndpoint();
  const result = await fetchResult(url);
  return result;
}, "getCloudflareProject");

// src/cloudflare/deployment/delete.ts
var deleteCloudflareDeployment = /* @__PURE__ */ __name(async (deploymentIdentifier) => {
  const url = getCloudflareApiEndpoint(
    `deployments/${deploymentIdentifier}?force=true`
  );
  try {
    const success = await fetchSuccess(url, {
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
    const { cloudflareId, commentId, url } = payload;
    const deletedCloudflareDeployment = await deleteCloudflareDeployment(cloudflareId);
    if (!deletedCloudflareDeployment)
      continue;
    const updateStatusGitHubDeployment = await request({
      query: MutationCreateGitHubDeploymentStatus,
      variables: {
        environment: deployment.environment,
        deploymentId: deployment.node_id,
        environmentUrl: url,
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
