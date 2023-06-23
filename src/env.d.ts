declare namespace NodeJS {
  /**
   * The default environment variables that GitHub sets are available to every
   * step in a workflow. See ["Default environment variables"](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables)
   */
  interface ProcessEnv {
    /**
     * The head ref or source branch of the pull request in a workflow run.
     * This property is only set when the event that triggers a workflow run
     * is either pull_request or pull_request_target.
     *
     * Example: `feature-branch-1`.
     */
    GITHUB_HEAD_REF?: string
    /**
     * The short ref name of the branch or tag that triggered the workflow
     * run. This value matches the branch or tag name shown on GitHub.
     *
     * Example: `feature-branch-1`.
     */
    GITHUB_REF_NAME?: string

    /**
     * The commit SHA that triggered the workflow. The value of this commit SHA
     * depends on the event that triggered the workflow.
     * For more information, see "Events that trigger workflows."
     *
     * Example: `ffac537e6cbbf934b08745a378932722df287a53`.
     */
    GITHUB_SHA: string

    /**
     * The name of the event that triggered the workflow.
     *
     * Example: `workflow_dispatch`.
     */
    GITHUB_EVENT_NAME: string

    /**
     * The path to the file on the runner that contains the full event webhook
     * payload.
     *
     * Example:`/github/workflow/event.json`.
     */
    GITHUB_EVENT_PATH?: string

    /**
     * The owner and repository name.
     *
     * Example: `octocat/Hello-World`.
     */
    GITHUB_REPOSITORY?: string

    /**
     * The path to a temporary directory on the runner.
     * This directory is emptied at the beginning and end of each job.
     * Note that files will not be removed if the runner's user account does not
     *  have permission to delete them.
     *
     * Example: `D:\a\_temp`.
     */
    RUNNER_TEMP?: string

    CLOUDFLARE_ACCOUNT_ID?: string
    CLOUDFLARE_API_TOKEN?: string

    /** Action Inputs */
    INPUT_API_TOKEN?: string
    INPUT_ACCOUNT_ID?: string
    INPUT_PROJECT_NAME?: string
    INPUT_DIRECTORY?: string
    // INPUT_GITHUB_TOKEN?: string
  }
}
