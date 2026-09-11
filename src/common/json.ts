import * as Option from 'effect/Option'
import * as Schema from 'effect/Schema'

const decodeJson = Schema.decodeUnknownOption(
  Schema.fromJsonString(Schema.Unknown)
)

/** Parses `text` as JSON, or `undefined` when it is not valid JSON. */
export const parseJson = (text: string): unknown =>
  Option.getOrUndefined(decodeJson(text))
