import {error, notice} from '@unlike/github-actions-core'

import {graphql} from '@/gql/gql.js'

import {useCommonInputs} from '@/common/inputs.js'
import {raiseFail} from '@/common/utils.js'

import {request} from './api/client.js'
import {useContext} from './context.js'

const PREFIX = `GitHub Environment:`

export const EnvironmentFragment = graphql(/* GraphQL */ `
  fragment EnvironmentFragment on Environment {
    name
    id
  }
`)

/**
 * MutationCreateEnvironment will either return the environment if it exists or create it.
 * GITHUB_TOKEN Action permissions don't allow for creating environments.
 * @see {@link https://docs.github.com/en/actions/security-guides/automatic-token-authentication#granting-additional-permissions | Granting additional permissions}
 * @see {@link https://docs.github.com/en/graphql/reference/mutations#createenvironment | `createEnvironment`}
 */
export const MutationCreateEnvironment = graphql(/* GraphQL */ `
  mutation CreateEnvironment($repositoryId: ID!, $name: String!) {
    createEnvironment(input: {repositoryId: $repositoryId, name: $name}) {
      environment {
        ...EnvironmentFragment
      }
    }
  }
`)

export const createEnvironment = async () => {
  const {branch, repo} = useContext()

  if (!branch) throw new Error('branch is required')

  const environment = await request({
    query: MutationCreateEnvironment,
    variables: {
      repositoryId: repo.node_id,
      name: branch
    },
    options: {
      errorThrows: false
    }
  })

  if (environment.errors) {
    error(`${PREFIX} Errors - ${JSON.stringify(environment.errors)}`)
  }

  if (!environment.data.createEnvironment?.environment) {
    notice(`${PREFIX} Not created`)
  }

  return environment.data.createEnvironment?.environment
}

export const QueryGetEnvironment = graphql(/* GraphQL */ `
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
`)

/**
 * CheckEnvironment will check if the environment exists and if it does not it
 * will error to the users to create the environment themselves.
 */
export const checkEnvironment = async () => {
  const {gitHubEnvironment} = useCommonInputs()
  const {repo, ref} = useContext()

  if (!gitHubEnvironment) {
    return raiseFail(
      `${PREFIX} missing input gitHubEnvironment ${gitHubEnvironment}`
    )
  }

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
  })

  if (environment.errors) {
    return raiseFail(`${PREFIX} Errors - ${JSON.stringify(environment.errors)}`)
  }

  if (!environment.data.repository?.environment) {
    return raiseFail(`${PREFIX} Not created for ${gitHubEnvironment}`)
  }

  if (!environment.data.repository?.ref?.id) {
    return raiseFail(`${PREFIX} No ref id ${gitHubEnvironment}`)
  }

  return {
    ...environment.data.repository.environment,
    refId: environment.data.repository?.ref?.id
  }
}

export type Environment = Awaited<ReturnType<typeof checkEnvironment>>
