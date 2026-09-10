import {debug, setFailed} from '@actions/core'
import * as Cause from 'effect/Cause'
import * as Config from 'effect/Config'
import * as Schema from 'effect/Schema'
import * as SchemaIssue from 'effect/SchemaIssue'

const formatIssue = SchemaIssue.makeFormatterDefault()

/**
 * Action inputs are always strings, so a type mismatch below the input's
 * `Pointer` means the input was absent — the provider treats an empty string
 * as absent too.
 */
const isMissing = (issue: SchemaIssue.Issue): boolean => {
  switch (issue._tag) {
    case 'Encoding': {
      return isMissing(issue.issue)
    }
    case 'InvalidType':
    case 'MissingKey': {
      return true
    }
    default: {
      return false
    }
  }
}

/**
 * `ConfigError` is not an `Error`, and its own message nests the schema error
 * (`SchemaError(Expected string\n  at ["cloudflare-api-token"])`). Name the
 * input instead, matching `getInput`'s wording for a missing required input.
 */
const configErrorMessage = ({cause}: Config.ConfigError): string => {
  if (!Schema.isSchemaError(cause) || cause.issue._tag !== 'Pointer') {
    return cause.message
  }
  const {path, issue} = cause.issue
  const name = path.map(String).join('.')

  return isMissing(issue)
    ? `Input required and not supplied: ${name}`
    : `Input '${name}' is invalid: ${formatIssue(issue)}`
}

/** A one-line, human-readable description of any thrown or failed value. */
export const errorMessage = (cause: unknown): string => {
  if (cause instanceof Config.ConfigError) {
    return configErrorMessage(cause)
  }
  if (cause instanceof Error) {
    return cause.message
  }
  return String(cause)
}

/**
 * Fails the step with a concise message. The full cause — stack traces and
 * nested causes — goes to `debug`, which the runner only shows when step debug
 * logging is enabled (`ACTIONS_STEP_DEBUG` / re-run with debug logging).
 */
export const reportFailure = (cause: Cause.Cause<unknown>): void => {
  debug(Cause.pretty(cause))
  setFailed(errorMessage(Cause.squash(cause)))
}
