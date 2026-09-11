/**
 * Builders for the job summary's HTML. `summary.addTable` inserts each cell
 * as raw HTML, and values such as a commit message or branch name are chosen
 * by whoever opened the pull request — escape every one rather than rely on
 * GitHub's renderer to sanitise them.
 */

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

/** `text` as HTML text or a quoted attribute value. */
export const escapeHtml = (text: string): string =>
  text.replaceAll(/[&<>"']/g, char => ENTITIES[char] ?? char)

/** `text` in a `<code>` element. */
export const code = (text: string): string => `<code>${escapeHtml(text)}</code>`

const isHttpUrl = (href: string): boolean => {
  if (!URL.canParse(href)) {
    return false
  }
  const {protocol} = new URL(href)
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
 * A `https://github.com/<owner>/<repo>/<path…>` URL. Each segment is
 * percent-encoded, so a branch name cannot add a query or fragment; a
 * segment's own `/` (as in `feature/x`) is kept.
 */
export const githubUrl = (...segments: Array<string>): string =>
  `https://github.com/${segments
    .flatMap(segment => segment.split('/'))
    .map(part => encodeURIComponent(part))
    .join('/')}`
