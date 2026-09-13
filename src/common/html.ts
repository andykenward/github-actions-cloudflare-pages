/**
 * Builders for the job summary's HTML. `summary.addTable` inserts each cell
 * as raw HTML, and values such as a commit message or branch name are chosen
 * by whoever opened the pull request — escape every one rather than rely on
 * GitHub's renderer to sanitise them.
 */

import assert from 'node:assert/strict'

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

/** `text` as HTML text or a quoted attribute value. */
export const escapeHtml = (text: string): string => {
  const escaped = text.replaceAll(/[&<>"']/g, char => ENTITIES[char] ?? char)
  assert.doesNotMatch(escaped, /[<>"']/)
  return escaped
}

/** A `summary.addTable` header row. */
export const headerRow = (
  ...names: Array<string>
): Array<{data: string; header: true}> =>
  names.map(data => ({data, header: true}))

/** `text` in a `<code>` element. */
export const code = (text: string): string => `<code>${escapeHtml(text)}</code>`

const isHttpUrl = (href: string): boolean => {
  const protocol = URL.parse(href)?.protocol
  return protocol === 'https:' || protocol === 'http:'
}

/**
 * A link to `href` around `html`, which must already be markup — pass it
 * through `escapeHtml` or `code`. Anything but an http(s) URL (such as
 * `javascript:`) renders as `html` alone.
 */
export const link = (href: string, html: string): string =>
  isHttpUrl(href) ? `<a href='${escapeHtml(href)}'>${html}</a>` : html

/**
 * `base` followed by `segments`, each percent-encoded so a value cannot add a
 * query or fragment; a segment's own `/` (as in `feature/x`) is kept.
 */
export const url = (base: string, ...segments: Array<string>): string => {
  const result = `${base}/${segments
    .flatMap(segment => segment.split('/'))
    .map(part => encodeURIComponent(part))
    .join('/')}`
  assert.ok(URL.canParse(result))
  return result
}

/** A `https://github.com/<owner>/<repo>/<path…>` URL. */
export const githubUrl = (...segments: Array<string>): string =>
  url('https://github.com', ...segments)
