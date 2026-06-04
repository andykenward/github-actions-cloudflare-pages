/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** The possible states in which a deployment can be. */
export enum DeploymentState {
  /** The pending deployment was not updated after 30 minutes. */
  Abandoned = 'ABANDONED',
  /** The deployment is currently active. */
  Active = 'ACTIVE',
  /** An inactive transient deployment. */
  Destroyed = 'DESTROYED',
  /** The deployment experienced an error. */
  Error = 'ERROR',
  /** The deployment has failed. */
  Failure = 'FAILURE',
  /** The deployment is inactive. */
  Inactive = 'INACTIVE',
  /** The deployment is in progress. */
  InProgress = 'IN_PROGRESS',
  /** The deployment is pending. */
  Pending = 'PENDING',
  /** The deployment has queued */
  Queued = 'QUEUED',
  /** The deployment was successful. */
  Success = 'SUCCESS',
  /** The deployment is waiting. */
  Waiting = 'WAITING'
}

/** The possible states for a deployment status. */
export enum DeploymentStatusState {
  /** The deployment experienced an error. */
  Error = 'ERROR',
  /** The deployment has failed. */
  Failure = 'FAILURE',
  /** The deployment is inactive. */
  Inactive = 'INACTIVE',
  /** The deployment is in progress. */
  InProgress = 'IN_PROGRESS',
  /** The deployment is pending. */
  Pending = 'PENDING',
  /** The deployment is queued */
  Queued = 'QUEUED',
  /** The deployment was successful. */
  Success = 'SUCCESS',
  /** The deployment is waiting. */
  Waiting = 'WAITING'
}

export type FilesQueryVariables = Exact<{
  owner: string;
  repo: string;
  path: string;
}>;


export type FilesQuery = { readonly repository: { readonly object:
      | { readonly __typename: 'Blob' }
      | { readonly __typename: 'Commit' }
      | { readonly __typename: 'Tag' }
      | { readonly __typename: 'Tree', readonly entries: ReadonlyArray<{ readonly name: string, readonly type: string, readonly language: { readonly name: string } | null, readonly object:
            | { readonly __typename: 'Blob', readonly text: string | null }
            | { readonly __typename: 'Commit' }
            | { readonly __typename: 'Tag' }
            | { readonly __typename: 'Tree' }
           | null }> | null }
     | null } | null };

export type LatestReleaseQueryVariables = Exact<{
  owner: string;
  repo: string;
}>;


export type LatestReleaseQuery = { readonly repository: { readonly latestRelease: { readonly tagName: string, readonly tagCommit: { readonly oid: string } | null } | null } | null };

export type AddCommentMutationVariables = Exact<{
  subjectId: string | number;
  body: string;
}>;


export type AddCommentMutation = { readonly addComment: { readonly commentEdge: { readonly node: { readonly id: string } | null } | null } | null };

export type PullRequestNodeIdQueryVariables = Exact<{
  owner: string;
  repo: string;
  number: number;
}>;


export type PullRequestNodeIdQuery = { readonly repository: { readonly pullRequest: { readonly id: string } | null } | null };

export type PullRequestNodeIdByBranchQueryVariables = Exact<{
  owner: string;
  repo: string;
  headRefName: string;
}>;


export type PullRequestNodeIdByBranchQuery = { readonly repository: { readonly pullRequests: { readonly nodes: ReadonlyArray<{ readonly id: string } | null> | null } } | null };

export type PullRequestCommentsQueryVariables = Exact<{
  prNodeId: string | number;
  first: number;
}>;


export type PullRequestCommentsQuery = { readonly node:
    | { readonly comments: { readonly nodes: ReadonlyArray<{ readonly id: string, readonly body: string, readonly author:
            | { readonly login: string }
            | { readonly login: string }
            | { readonly login: string }
            | { readonly login: string }
            | { readonly login: string }
           | null } | null> | null } }
    | Record<PropertyKey, never>
   | null };

export type UpdateCommentMutationVariables = Exact<{
  id: string | number;
  body: string;
}>;


export type UpdateCommentMutation = { readonly updateIssueComment: { readonly issueComment: { readonly id: string } | null } | null };

export type CreateGitHubDeploymentMutationVariables = Exact<{
  repositoryId: string | number;
  environmentName: string;
  refId: string | number;
  payload: string;
  description?: string | null | undefined;
}>;


export type CreateGitHubDeploymentMutation = { readonly createDeployment: { readonly deployment: { readonly id: string, readonly environment: string | null, readonly state: DeploymentState | null } | null } | null };

export type DeleteGitHubDeploymentMutationVariables = Exact<{
  deploymentId: string | number;
}>;


export type DeleteGitHubDeploymentMutation = { readonly deleteDeployment: { readonly clientMutationId: string | null } | null };

export type DeleteGitHubDeploymentAndCommentMutationVariables = Exact<{
  deploymentId: string | number;
  commentId: string | number;
}>;


export type DeleteGitHubDeploymentAndCommentMutation = { readonly deleteDeployment: { readonly clientMutationId: string | null } | null, readonly deleteIssueComment: { readonly clientMutationId: string | null } | null };

export type DeploymentFragmentFragment = { readonly id: string, readonly environment: string | null, readonly state: DeploymentState | null };

export type CreateGitHubDeploymentStatusMutationVariables = Exact<{
  deploymentId: string | number;
  environment?: string | null | undefined;
  environmentUrl: string;
  logUrl: string;
  state: DeploymentStatusState;
}>;


export type CreateGitHubDeploymentStatusMutation = { readonly createDeploymentStatus: { readonly clientMutationId: string | null } | null };

export type CreateEnvironmentMutationVariables = Exact<{
  repositoryId: string | number;
  name: string;
}>;


export type CreateEnvironmentMutation = { readonly createEnvironment: { readonly environment: { readonly name: string, readonly id: string } | null } | null };

export type GetEnvironmentQueryVariables = Exact<{
  owner: string;
  repo: string;
  environment_name: string;
  qualifiedName: string;
}>;


export type GetEnvironmentQuery = { readonly repository: { readonly environment: { readonly name: string, readonly id: string } | null, readonly ref: { readonly id: string } | null } | null };

export type EnvironmentFragmentFragment = { readonly name: string, readonly id: string };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const DeploymentFragmentFragmentDoc = new TypedDocumentString(`
    fragment DeploymentFragment on Deployment {
  id
  environment
  state
}
    `, {"fragmentName":"DeploymentFragment"}) as unknown as TypedDocumentString<DeploymentFragmentFragment, unknown>;
export const EnvironmentFragmentFragmentDoc = new TypedDocumentString(`
    fragment EnvironmentFragment on Environment {
  name
  id
}
    `, {"fragmentName":"EnvironmentFragment"}) as unknown as TypedDocumentString<EnvironmentFragmentFragment, unknown>;
export const FilesDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<FilesQuery, FilesQueryVariables>;
export const LatestReleaseDocument = new TypedDocumentString(`
    query LatestRelease($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    latestRelease {
      tagName
      tagCommit {
        oid
      }
    }
  }
}
    `) as unknown as TypedDocumentString<LatestReleaseQuery, LatestReleaseQueryVariables>;
export const AddCommentDocument = new TypedDocumentString(`
    mutation AddComment($subjectId: ID!, $body: String!) {
  addComment(input: {subjectId: $subjectId, body: $body}) {
    commentEdge {
      node {
        id
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AddCommentMutation, AddCommentMutationVariables>;
export const PullRequestNodeIdDocument = new TypedDocumentString(`
    query PullRequestNodeId($owner: String!, $repo: String!, $number: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $number) {
      id
    }
  }
}
    `) as unknown as TypedDocumentString<PullRequestNodeIdQuery, PullRequestNodeIdQueryVariables>;
export const PullRequestNodeIdByBranchDocument = new TypedDocumentString(`
    query PullRequestNodeIdByBranch($owner: String!, $repo: String!, $headRefName: String!) {
  repository(owner: $owner, name: $repo) {
    pullRequests(first: 1, states: [OPEN], headRefName: $headRefName) {
      nodes {
        id
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PullRequestNodeIdByBranchQuery, PullRequestNodeIdByBranchQueryVariables>;
export const PullRequestCommentsDocument = new TypedDocumentString(`
    query PullRequestComments($prNodeId: ID!, $first: Int!) {
  node(id: $prNodeId) {
    ... on PullRequest {
      comments(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          id
          body
          author {
            login
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PullRequestCommentsQuery, PullRequestCommentsQueryVariables>;
export const UpdateCommentDocument = new TypedDocumentString(`
    mutation UpdateComment($id: ID!, $body: String!) {
  updateIssueComment(input: {id: $id, body: $body}) {
    issueComment {
      id
    }
  }
}
    `) as unknown as TypedDocumentString<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const CreateGitHubDeploymentDocument = new TypedDocumentString(`
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
}`) as unknown as TypedDocumentString<CreateGitHubDeploymentMutation, CreateGitHubDeploymentMutationVariables>;
export const DeleteGitHubDeploymentDocument = new TypedDocumentString(`
    mutation DeleteGitHubDeployment($deploymentId: ID!) {
  deleteDeployment(input: {id: $deploymentId}) {
    clientMutationId
  }
}
    `) as unknown as TypedDocumentString<DeleteGitHubDeploymentMutation, DeleteGitHubDeploymentMutationVariables>;
export const DeleteGitHubDeploymentAndCommentDocument = new TypedDocumentString(`
    mutation DeleteGitHubDeploymentAndComment($deploymentId: ID!, $commentId: ID!) {
  deleteDeployment(input: {id: $deploymentId}) {
    clientMutationId
  }
  deleteIssueComment(input: {id: $commentId}) {
    clientMutationId
  }
}
    `) as unknown as TypedDocumentString<DeleteGitHubDeploymentAndCommentMutation, DeleteGitHubDeploymentAndCommentMutationVariables>;
export const CreateGitHubDeploymentStatusDocument = new TypedDocumentString(`
    mutation CreateGitHubDeploymentStatus($deploymentId: ID!, $environment: String, $environmentUrl: String!, $logUrl: String!, $state: DeploymentStatusState!) {
  createDeploymentStatus(
    input: {autoInactive: false, deploymentId: $deploymentId, environment: $environment, environmentUrl: $environmentUrl, logUrl: $logUrl, state: $state}
  ) {
    clientMutationId
  }
}
    `) as unknown as TypedDocumentString<CreateGitHubDeploymentStatusMutation, CreateGitHubDeploymentStatusMutationVariables>;
export const CreateEnvironmentDocument = new TypedDocumentString(`
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
}`) as unknown as TypedDocumentString<CreateEnvironmentMutation, CreateEnvironmentMutationVariables>;
export const GetEnvironmentDocument = new TypedDocumentString(`
    query GetEnvironment($owner: String!, $repo: String!, $environment_name: String!, $qualifiedName: String!) {
  repository(owner: $owner, name: $repo) {
    environment(name: $environment_name) {
      ...EnvironmentFragment
    }
    ref(qualifiedName: $qualifiedName) {
      id
    }
  }
}
    fragment EnvironmentFragment on Environment {
  name
  id
}`) as unknown as TypedDocumentString<GetEnvironmentQuery, GetEnvironmentQueryVariables>;