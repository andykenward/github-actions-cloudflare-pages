/**
 * Fork of
 * https://github.com/cloudflare/workers-sdk/blob/55703e52da35b15f5c11f9e3936cc5b1ad5836dc/packages/wrangler/src/parse.ts
 */

export type Message = {
  text: string
  location?: Location
  notes?: Message[]
  kind?: 'warning' | 'error'
}

export type Location = File & {
  line: number
  column: number
  length?: number
  lineText?: string
  suggestion?: string
}

export type File = {
  file?: string
  fileText?: string
}

/**
 * An error that's thrown when something fails to parse.
 */
export class ParseError extends Error implements Message {
  readonly text: string
  readonly notes: Message[]
  readonly location?: Location
  readonly kind: 'warning' | 'error'
  code: number | undefined

  constructor({text, notes, location, kind}: Message) {
    super(text)
    // eslint-disable-next-line unicorn/custom-error-definition
    this.name = this.constructor.name
    this.text = text
    this.notes = notes ?? []
    this.location = location
    this.kind = kind ?? 'error'
  }
}
