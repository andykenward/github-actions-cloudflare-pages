import assert from 'node:assert/strict'

import {info} from '@actions/core'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {getCloudflareDeploymentAlias} from '@/common/cloudflare/deployment/get.js'
import {useCommonInputs} from '@/common/inputs.js'
import {graphql} from '@/gql/gql.js'

import {request} from './api/client.js'
import {useContext, useContextEvent} from './context.js'

export const MutationAddComment = graphql(/* GraphQL */ `
  mutation AddComment($subjectId: ID!, $body: String!) {
    addComment(input: {subjectId: $subjectId, body: $body}) {
      commentEdge {
        node {
          id
        }
      }
    }
  }
`)

export const QueryPullRequestNodeId = graphql(/* GraphQL */ `
  query PullRequestNodeId($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        id
      }
    }
  }
`)

export const QueryPullRequestNodeIdByBranch = graphql(/* GraphQL */ `
  query PullRequestNodeIdByBranch(
    $owner: String!
    $repo: String!
    $headRefName: String!
  ) {
    repository(owner: $owner, name: $repo) {
      pullRequests(first: 1, states: [OPEN], headRefName: $headRefName) {
        nodes {
          id
        }
      }
    }
  }
`)

export const QueryPullRequestComments = graphql(/* GraphQL */ `
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
`)

export const MutationUpdateComment = graphql(/* GraphQL */ `
  mutation UpdateComment($id: ID!, $body: String!) {
    updateIssueComment(input: {id: $id, body: $body}) {
      issueComment {
        id
      }
    }
  }
`)

const COMMENT_MARKER = '<!-- cloudflare-pages-deployment-comment -->'

const findExistingComment = async (
  prNodeId: string
): Promise<string | undefined> => {
  try {
    const result = await request({
      query: QueryPullRequestComments,
      variables: {
        prNodeId,
        first: 50
      }
    })

    const node = result.data.node
    if (!node || !('comments' in node)) {
      return undefined
    }

    const comments = node.comments.nodes ?? []
    const botLogin = 'github-actions[bot]'

    // Find the most recent comment from this action that contains our marker
    const existingComment = comments.find(
      comment =>
        comment?.author?.login === botLogin &&
        comment?.body?.includes(COMMENT_MARKER)
    )

    return existingComment?.id
  } catch {
    // If we can't find existing comments, we'll just create a new one
    return undefined
  }
}

const getNodeIdFromEvent = async () => {
  const {repo} = useContext()
  const {prNumber} = useCommonInputs()

  if (prNumber) {
    const parsedPrNumber = Number.parseInt(prNumber, 10)
    assert.ok(
      Number.isInteger(parsedPrNumber) && parsedPrNumber > 0,
      `Invalid pr-number input: ${prNumber}`
    )

    const pullRequest = await request({
      query: QueryPullRequestNodeId,
      variables: {
        owner: repo.owner,
        repo: repo.repo,
        number: parsedPrNumber
      }
    })

    const nodeId = pullRequest.data.repository?.pullRequest?.id
    assert.ok(
      nodeId,
      `No pull request node id found for pr-number input: ${prNumber}`
    )
    return nodeId
  }

  const {eventName, payload} = useContextEvent()

  switch (eventName) {
    case 'workflow_dispatch': {
      const {branch} = useContext()
      assert.ok(branch, 'No branch found in context')

      const pullRequest = await request({
        query: QueryPullRequestNodeIdByBranch,
        variables: {
          owner: repo.owner,
          repo: repo.repo,
          headRefName: branch
        }
      })

      const nodeId = pullRequest.data.repository?.pullRequests.nodes?.[0]?.id
      assert.ok(
        nodeId,
        'No pull request node id found for workflow_dispatch event'
      )
      return nodeId
    }
    case 'workflow_run': {
      const pullRequestsMatchingHead =
        payload.workflow_run.pull_requests.filter(pullRequest => {
          return (
            pullRequest.head.ref === payload.workflow_run.head_branch &&
            pullRequest.head.sha === payload.workflow_run.head_sha
          )
        })

      assert.ok(
        pullRequestsMatchingHead.length > 0,
        'No pull request found in workflow_run event matching head branch and sha'
      )

      assert.ok(
        pullRequestsMatchingHead.length === 1,
        'Multiple pull requests found in workflow_run event matching head branch and sha'
      )

      const pullRequestNumber = pullRequestsMatchingHead[0]?.number

      assert.ok(
        pullRequestNumber,
        'No pull request number found in workflow_run event'
      )

      const pullRequest = await request({
        query: QueryPullRequestNodeId,
        variables: {
          owner: repo.owner,
          repo: repo.repo,
          number: pullRequestNumber
        }
      })

      const nodeId = pullRequest.data.repository?.pullRequest?.id
      assert.ok(nodeId, 'No pull request node id found for workflow_run event')
      return nodeId
    }
    case 'pull_request': {
      if (payload.action === 'closed') {
        return
      }

      const nodeId = payload.pull_request.node_id
      assert.ok(nodeId, 'No pull request node id found for pull_request event')
      return nodeId
    }
    default: {
      return
    }
  }
}

export const addComment = async (
  deployment: PagesDeployment,
  output: string
): Promise<string | undefined> => {
  const prNodeId = await getNodeIdFromEvent()

  if (prNodeId) {
    const {sha} = useContext()
    const {eventName} = useContextEvent()
    const {commentMode, hideWranglerOutput} = useCommonInputs()

    // Build the comment body
    let rawBody = `${COMMENT_MARKER}\n## Cloudflare Pages Deployment\n**Event Name:** ${eventName}\n**Environment:** ${deployment.environment}\n**Project:** ${deployment.project_name}\n**Built with commit:** ${sha}\n**Preview URL:** ${deployment.url}\n**Branch Preview URL:** ${getCloudflareDeploymentAlias(deployment)}`

    // Optionally include Wrangler output
    if (!hideWranglerOutput) {
      rawBody += `\n\n### Wrangler Output\n${output}`
    }

    // Check if we should update an existing comment or create a new one
    if (commentMode === 'update') {
      const existingCommentId = await findExistingComment(prNodeId)

      if (existingCommentId) {
        // Update existing comment
        info('Updating existing PR comment')
        await request({
          query: MutationUpdateComment,
          variables: {
            id: existingCommentId,
            body: rawBody
          }
        })
        return existingCommentId
      }
    }

    // Create new comment (either commentMode is 'new' or no existing comment found)
    info('Creating new PR comment')
    const comment = await request({
      query: MutationAddComment,
      variables: {
        subjectId: prNodeId,
        body: rawBody
      }
    })
    return comment.data.addComment?.commentEdge?.node?.id
  }
  info('addComment - No Pull Request could be found to post comment.')
}
