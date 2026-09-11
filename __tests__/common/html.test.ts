import {describe, expect, test} from 'vitest'

import {code, escapeHtml, githubUrl, link} from '@/common/html.js'

describe(escapeHtml, () => {
  test('escapes markup and both quote characters', () => {
    expect.assertions(1)

    expect(escapeHtml(`<a href='x' title="y">&</a>`)).toBe(
      '&lt;a href=&#39;x&#39; title=&quot;y&quot;&gt;&amp;&lt;/a&gt;'
    )
  })

  test('leaves plain text unchanged', () => {
    expect.assertions(1)

    expect(escapeHtml('chore(deps): update 🙂')).toBe('chore(deps): update 🙂')
  })
})

describe(code, () => {
  test('wraps escaped text in a code element', () => {
    expect.assertions(1)

    expect(code('<script>')).toBe('<code>&lt;script&gt;</code>')
  })
})

describe(link, () => {
  test.each([
    {href: 'https://example.com/a?b=1&c=2'},
    {href: 'http://example.com'}
  ])('links $href with the attribute escaped', ({href}) => {
    expect.assertions(1)

    expect(link(href, 'text')).toBe(`<a href='${escapeHtml(href)}'>text</a>`)
  })

  test('cannot break out of the href attribute', () => {
    expect.assertions(1)

    expect(link(`https://example.com/'><script>`, 'text')).toBe(
      `<a href='https://example.com/&#39;&gt;&lt;script&gt;'>text</a>`
    )
  })

  test.each([
    {href: 'javascript:alert(1)'},
    {href: 'data:text/html,<script>alert(1)</script>'},
    {href: 'not a url'},
    {href: ''}
  ])('renders only the content for $href', ({href}) => {
    expect.assertions(1)

    expect(link(href, 'text')).toBe('text')
  })
})

describe(githubUrl, () => {
  test('keeps the slashes of a branch name', () => {
    expect.assertions(1)

    expect(githubUrl('owner', 'repo', 'tree', 'feature/x')).toBe(
      'https://github.com/owner/repo/tree/feature/x'
    )
  })

  test('encodes characters that would end the path', () => {
    expect.assertions(1)

    expect(githubUrl('owner', 'repo', 'tree', 'a#b?c=d e')).toBe(
      'https://github.com/owner/repo/tree/a%23b%3Fc%3Dd%20e'
    )
  })
})
