/* eslint-disable */
import * as types from './graphql.js';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query ListPayloadExampleFiles($owner: String!, $repo: String!, $path: String!) {\n  repository(owner: $owner, name: $repo) {\n    object(expression: $path) {\n      __typename\n      ... on Tree {\n        entries {\n          name\n          type\n          language {\n            name\n          }\n          object {\n            __typename\n            ... on Blob {\n              text\n            }\n          }\n        }\n      }\n    }\n  }\n}": typeof types.ListPayloadExampleFilesDocument,
    "query GetLatestRelease($owner: String!, $repo: String!) {\n  repository(owner: $owner, name: $repo) {\n    latestRelease {\n      tagName\n      tagCommit {\n        oid\n      }\n    }\n  }\n}": typeof types.GetLatestReleaseDocument,
    "mutation AddPullRequestComment($input: AddCommentInput!) {\n  addComment(input: $input) {\n    commentEdge {\n      node {\n        id\n      }\n    }\n  }\n}\n\nquery GetPullRequestId($owner: String!, $repo: String!, $number: Int!) {\n  repository(owner: $owner, name: $repo) {\n    pullRequest(number: $number) {\n      id\n    }\n  }\n}\n\nquery GetOpenPullRequestByBranch($owner: String!, $repo: String!, $headRefName: String!) {\n  repository(owner: $owner, name: $repo) {\n    pullRequests(first: 1, states: [OPEN], headRefName: $headRefName) {\n      nodes {\n        id\n      }\n    }\n  }\n}": typeof types.AddPullRequestCommentDocument,
    "mutation CreateGitHubDeployment($input: CreateDeploymentInput!) {\n  createDeployment(input: $input) {\n    deployment {\n      id\n    }\n  }\n}\n\nmutation CreateGitHubDeploymentStatus($input: CreateDeploymentStatusInput!) {\n  createDeploymentStatus(input: $input) {\n    clientMutationId\n  }\n}": typeof types.CreateGitHubDeploymentDocument,
    "mutation DeactivateAndDeleteGitHubDeployment($status: CreateDeploymentStatusInput!, $deployment: DeleteDeploymentInput!) {\n  createDeploymentStatus(input: $status) {\n    clientMutationId\n  }\n  deleteDeployment(input: $deployment) {\n    clientMutationId\n  }\n}\n\nmutation DeactivateAndDeleteGitHubDeploymentAndComment($status: CreateDeploymentStatusInput!, $deployment: DeleteDeploymentInput!, $comment: DeleteIssueCommentInput!) {\n  createDeploymentStatus(input: $status) {\n    clientMutationId\n  }\n  deleteDeployment(input: $deployment) {\n    clientMutationId\n  }\n  deleteIssueComment(input: $comment) {\n    clientMutationId\n  }\n}": typeof types.DeactivateAndDeleteGitHubDeploymentDocument,
    "query GetEnvironmentAndRef($owner: String!, $repo: String!, $environmentName: String!, $qualifiedName: String!) {\n  repository(owner: $owner, name: $repo) {\n    environment(name: $environmentName) {\n      id\n      name\n    }\n    ref(qualifiedName: $qualifiedName) {\n      id\n    }\n  }\n}": typeof types.GetEnvironmentAndRefDocument,
};
const documents: Documents = {
    "query ListPayloadExampleFiles($owner: String!, $repo: String!, $path: String!) {\n  repository(owner: $owner, name: $repo) {\n    object(expression: $path) {\n      __typename\n      ... on Tree {\n        entries {\n          name\n          type\n          language {\n            name\n          }\n          object {\n            __typename\n            ... on Blob {\n              text\n            }\n          }\n        }\n      }\n    }\n  }\n}": types.ListPayloadExampleFilesDocument,
    "query GetLatestRelease($owner: String!, $repo: String!) {\n  repository(owner: $owner, name: $repo) {\n    latestRelease {\n      tagName\n      tagCommit {\n        oid\n      }\n    }\n  }\n}": types.GetLatestReleaseDocument,
    "mutation AddPullRequestComment($input: AddCommentInput!) {\n  addComment(input: $input) {\n    commentEdge {\n      node {\n        id\n      }\n    }\n  }\n}\n\nquery GetPullRequestId($owner: String!, $repo: String!, $number: Int!) {\n  repository(owner: $owner, name: $repo) {\n    pullRequest(number: $number) {\n      id\n    }\n  }\n}\n\nquery GetOpenPullRequestByBranch($owner: String!, $repo: String!, $headRefName: String!) {\n  repository(owner: $owner, name: $repo) {\n    pullRequests(first: 1, states: [OPEN], headRefName: $headRefName) {\n      nodes {\n        id\n      }\n    }\n  }\n}": types.AddPullRequestCommentDocument,
    "mutation CreateGitHubDeployment($input: CreateDeploymentInput!) {\n  createDeployment(input: $input) {\n    deployment {\n      id\n    }\n  }\n}\n\nmutation CreateGitHubDeploymentStatus($input: CreateDeploymentStatusInput!) {\n  createDeploymentStatus(input: $input) {\n    clientMutationId\n  }\n}": types.CreateGitHubDeploymentDocument,
    "mutation DeactivateAndDeleteGitHubDeployment($status: CreateDeploymentStatusInput!, $deployment: DeleteDeploymentInput!) {\n  createDeploymentStatus(input: $status) {\n    clientMutationId\n  }\n  deleteDeployment(input: $deployment) {\n    clientMutationId\n  }\n}\n\nmutation DeactivateAndDeleteGitHubDeploymentAndComment($status: CreateDeploymentStatusInput!, $deployment: DeleteDeploymentInput!, $comment: DeleteIssueCommentInput!) {\n  createDeploymentStatus(input: $status) {\n    clientMutationId\n  }\n  deleteDeployment(input: $deployment) {\n    clientMutationId\n  }\n  deleteIssueComment(input: $comment) {\n    clientMutationId\n  }\n}": types.DeactivateAndDeleteGitHubDeploymentDocument,
    "query GetEnvironmentAndRef($owner: String!, $repo: String!, $environmentName: String!, $qualifiedName: String!) {\n  repository(owner: $owner, name: $repo) {\n    environment(name: $environmentName) {\n      id\n      name\n    }\n    ref(qualifiedName: $qualifiedName) {\n      id\n    }\n  }\n}": types.GetEnvironmentAndRefDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ListPayloadExampleFiles($owner: String!, $repo: String!, $path: String!) {\n  repository(owner: $owner, name: $repo) {\n    object(expression: $path) {\n      __typename\n      ... on Tree {\n        entries {\n          name\n          type\n          language {\n            name\n          }\n          object {\n            __typename\n            ... on Blob {\n              text\n            }\n          }\n        }\n      }\n    }\n  }\n}"): typeof import('./graphql.js').ListPayloadExampleFilesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetLatestRelease($owner: String!, $repo: String!) {\n  repository(owner: $owner, name: $repo) {\n    latestRelease {\n      tagName\n      tagCommit {\n        oid\n      }\n    }\n  }\n}"): typeof import('./graphql.js').GetLatestReleaseDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation AddPullRequestComment($input: AddCommentInput!) {\n  addComment(input: $input) {\n    commentEdge {\n      node {\n        id\n      }\n    }\n  }\n}\n\nquery GetPullRequestId($owner: String!, $repo: String!, $number: Int!) {\n  repository(owner: $owner, name: $repo) {\n    pullRequest(number: $number) {\n      id\n    }\n  }\n}\n\nquery GetOpenPullRequestByBranch($owner: String!, $repo: String!, $headRefName: String!) {\n  repository(owner: $owner, name: $repo) {\n    pullRequests(first: 1, states: [OPEN], headRefName: $headRefName) {\n      nodes {\n        id\n      }\n    }\n  }\n}"): typeof import('./graphql.js').AddPullRequestCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateGitHubDeployment($input: CreateDeploymentInput!) {\n  createDeployment(input: $input) {\n    deployment {\n      id\n    }\n  }\n}\n\nmutation CreateGitHubDeploymentStatus($input: CreateDeploymentStatusInput!) {\n  createDeploymentStatus(input: $input) {\n    clientMutationId\n  }\n}"): typeof import('./graphql.js').CreateGitHubDeploymentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeactivateAndDeleteGitHubDeployment($status: CreateDeploymentStatusInput!, $deployment: DeleteDeploymentInput!) {\n  createDeploymentStatus(input: $status) {\n    clientMutationId\n  }\n  deleteDeployment(input: $deployment) {\n    clientMutationId\n  }\n}\n\nmutation DeactivateAndDeleteGitHubDeploymentAndComment($status: CreateDeploymentStatusInput!, $deployment: DeleteDeploymentInput!, $comment: DeleteIssueCommentInput!) {\n  createDeploymentStatus(input: $status) {\n    clientMutationId\n  }\n  deleteDeployment(input: $deployment) {\n    clientMutationId\n  }\n  deleteIssueComment(input: $comment) {\n    clientMutationId\n  }\n}"): typeof import('./graphql.js').DeactivateAndDeleteGitHubDeploymentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetEnvironmentAndRef($owner: String!, $repo: String!, $environmentName: String!, $qualifiedName: String!) {\n  repository(owner: $owner, name: $repo) {\n    environment(name: $environmentName) {\n      id\n      name\n    }\n    ref(qualifiedName: $qualifiedName) {\n      id\n    }\n  }\n}"): typeof import('./graphql.js').GetEnvironmentAndRefDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
