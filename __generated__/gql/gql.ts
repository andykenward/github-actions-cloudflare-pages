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
const documents = {
    "\n      query Files($owner: String!, $repo: String!, $path: String!) {\n        repository(owner: $owner, name: $repo) {\n          object(expression: $path) {\n            __typename\n            ... on Tree {\n              entries {\n                name\n                type\n                language {\n                  name\n                }\n                object {\n                  __typename\n                  ... on Blob {\n                    text\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    ": types.FilesDocument,
    "\n  mutation AddComment($subjectId: ID!, $body: String!) {\n    addComment(input: {subjectId: $subjectId, body: $body}) {\n      commentEdge {\n        node {\n          id\n        }\n      }\n    }\n  }\n": types.AddCommentDocument,
    "\n  mutation CreateGitHubDeployment(\n    $repositoryId: ID!\n    $environmentName: String!\n    $refId: ID!\n    $payload: String!\n    $description: String\n  ) {\n    createDeployment(\n      input: {\n        autoMerge: false\n        description: $description\n        environment: $environmentName\n        refId: $refId\n        repositoryId: $repositoryId\n        requiredContexts: []\n        payload: $payload\n      }\n    ) {\n      deployment {\n        ...DeploymentFragment\n      }\n    }\n  }\n": types.CreateGitHubDeploymentDocument,
    "\n  mutation DeleteGitHubDeployment($deploymentId: ID!) {\n    deleteDeployment(input: {id: $deploymentId}) {\n      clientMutationId\n    }\n  }\n": types.DeleteGitHubDeploymentDocument,
    "\n  mutation DeleteGitHubDeploymentAndComment(\n    $deploymentId: ID!\n    $commentId: ID!\n  ) {\n    deleteDeployment(input: {id: $deploymentId}) {\n      clientMutationId\n    }\n    deleteIssueComment(input: {id: $commentId}) {\n      clientMutationId\n    }\n  }\n": types.DeleteGitHubDeploymentAndCommentDocument,
    "\n  fragment DeploymentFragment on Deployment {\n    id\n    environment\n    state\n  }\n": types.DeploymentFragmentFragmentDoc,
    "\n  mutation CreateGitHubDeploymentStatus(\n    $deploymentId: ID!\n    $environment: String\n    $environmentUrl: String!\n    $logUrl: String!\n    $state: DeploymentStatusState!\n  ) {\n    createDeploymentStatus(\n      input: {\n        autoInactive: false\n        deploymentId: $deploymentId\n        environment: $environment\n        environmentUrl: $environmentUrl\n        logUrl: $logUrl\n        state: $state\n      }\n    ) {\n      deploymentStatus {\n        deployment {\n          ...DeploymentFragment\n        }\n      }\n    }\n  }\n": types.CreateGitHubDeploymentStatusDocument,
    "\n  fragment EnvironmentFragment on Environment {\n    name\n    id\n  }\n": types.EnvironmentFragmentFragmentDoc,
    "\n  mutation CreateEnvironment($repositoryId: ID!, $name: String!) {\n    createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {\n      environment {\n        ...EnvironmentFragment\n      }\n    }\n  }\n": types.CreateEnvironmentDocument,
    "\n  query GetEnvironment(\n    $owner: String!\n    $repo: String!\n    $environment_name: String!\n    $qualifiedName: String!\n  ) {\n    repository(owner: $owner, name: $repo) {\n      environment(name: $environment_name) {\n        ...EnvironmentFragment\n      }\n      ref(qualifiedName: $qualifiedName) {\n        id\n        name\n        prefix\n      }\n    }\n  }\n": types.GetEnvironmentDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n      query Files($owner: String!, $repo: String!, $path: String!) {\n        repository(owner: $owner, name: $repo) {\n          object(expression: $path) {\n            __typename\n            ... on Tree {\n              entries {\n                name\n                type\n                language {\n                  name\n                }\n                object {\n                  __typename\n                  ... on Blob {\n                    text\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    "): typeof import('./graphql.js').FilesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddComment($subjectId: ID!, $body: String!) {\n    addComment(input: {subjectId: $subjectId, body: $body}) {\n      commentEdge {\n        node {\n          id\n        }\n      }\n    }\n  }\n"): typeof import('./graphql.js').AddCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateGitHubDeployment(\n    $repositoryId: ID!\n    $environmentName: String!\n    $refId: ID!\n    $payload: String!\n    $description: String\n  ) {\n    createDeployment(\n      input: {\n        autoMerge: false\n        description: $description\n        environment: $environmentName\n        refId: $refId\n        repositoryId: $repositoryId\n        requiredContexts: []\n        payload: $payload\n      }\n    ) {\n      deployment {\n        ...DeploymentFragment\n      }\n    }\n  }\n"): typeof import('./graphql.js').CreateGitHubDeploymentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteGitHubDeployment($deploymentId: ID!) {\n    deleteDeployment(input: {id: $deploymentId}) {\n      clientMutationId\n    }\n  }\n"): typeof import('./graphql.js').DeleteGitHubDeploymentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteGitHubDeploymentAndComment(\n    $deploymentId: ID!\n    $commentId: ID!\n  ) {\n    deleteDeployment(input: {id: $deploymentId}) {\n      clientMutationId\n    }\n    deleteIssueComment(input: {id: $commentId}) {\n      clientMutationId\n    }\n  }\n"): typeof import('./graphql.js').DeleteGitHubDeploymentAndCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment DeploymentFragment on Deployment {\n    id\n    environment\n    state\n  }\n"): typeof import('./graphql.js').DeploymentFragmentFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateGitHubDeploymentStatus(\n    $deploymentId: ID!\n    $environment: String\n    $environmentUrl: String!\n    $logUrl: String!\n    $state: DeploymentStatusState!\n  ) {\n    createDeploymentStatus(\n      input: {\n        autoInactive: false\n        deploymentId: $deploymentId\n        environment: $environment\n        environmentUrl: $environmentUrl\n        logUrl: $logUrl\n        state: $state\n      }\n    ) {\n      deploymentStatus {\n        deployment {\n          ...DeploymentFragment\n        }\n      }\n    }\n  }\n"): typeof import('./graphql.js').CreateGitHubDeploymentStatusDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment EnvironmentFragment on Environment {\n    name\n    id\n  }\n"): typeof import('./graphql.js').EnvironmentFragmentFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateEnvironment($repositoryId: ID!, $name: String!) {\n    createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {\n      environment {\n        ...EnvironmentFragment\n      }\n    }\n  }\n"): typeof import('./graphql.js').CreateEnvironmentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetEnvironment(\n    $owner: String!\n    $repo: String!\n    $environment_name: String!\n    $qualifiedName: String!\n  ) {\n    repository(owner: $owner, name: $repo) {\n      environment(name: $environment_name) {\n        ...EnvironmentFragment\n      }\n      ref(qualifiedName: $qualifiedName) {\n        id\n        name\n        prefix\n      }\n    }\n  }\n"): typeof import('./graphql.js').GetEnvironmentDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
