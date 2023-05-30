/**
 * https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
 */

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The head ref or source branch of the pull request in a workflow run.
     * This property is only set when the event that triggers a workflow run
     * is either pull_request or pull_request_target.
     *
     * Example: feature-branch-1.
     */
    GITHUB_HEAD_REF: string
    /**
     * The short ref name of the branch or tag that triggered the workflow
     * run. This value matches the branch or tag name shown on GitHub.
     *
     * Example: feature-branch-1.
     */
    GITHUB_REF_NAME: string
  }
}
