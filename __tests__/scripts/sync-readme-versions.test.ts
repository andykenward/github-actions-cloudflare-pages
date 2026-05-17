import {describe, expect, test} from 'vitest'

import {replaceVersionReferences} from '../../bin/sync-readme-versions.js'

const SHA = 'abc123def456abc123def456abc123def456abc1'
const VERSION = '3.4.0'

describe(replaceVersionReferences, () => {
  describe('main action', () => {
    test('replaces tag-only version', () => {
      expect(
        replaceVersionReferences(
          'uses: andykenward/github-actions-cloudflare-pages@v3.0.0',
          SHA,
          VERSION
        )
      ).toBe(
        `uses: andykenward/github-actions-cloudflare-pages@${SHA} #v${VERSION}`
      )
    })

    test('replaces existing SHA+tag version', () => {
      expect(
        replaceVersionReferences(
          `uses: andykenward/github-actions-cloudflare-pages@oldsha123 #v2.0.0`,
          SHA,
          VERSION
        )
      ).toBe(
        `uses: andykenward/github-actions-cloudflare-pages@${SHA} #v${VERSION}`
      )
    })

    test('replaces multiple occurrences', () => {
      const line = 'uses: andykenward/github-actions-cloudflare-pages@v3.0.0'
      expect(
        replaceVersionReferences([line, line].join('\n'), SHA, VERSION)
      ).toBe(
        [
          `uses: andykenward/github-actions-cloudflare-pages@${SHA} #v${VERSION}`,
          `uses: andykenward/github-actions-cloudflare-pages@${SHA} #v${VERSION}`
        ].join('\n')
      )
    })
  })

  describe('delete sub-action', () => {
    test('replaces tag-only version', () => {
      expect(
        replaceVersionReferences(
          'uses: andykenward/github-actions-cloudflare-pages/delete@v2.3.2',
          SHA,
          VERSION
        )
      ).toBe(
        `uses: andykenward/github-actions-cloudflare-pages/delete@${SHA} #v${VERSION}`
      )
    })

    test('replaces existing SHA+tag version', () => {
      expect(
        replaceVersionReferences(
          `uses: andykenward/github-actions-cloudflare-pages/delete@oldsha123 #v2.0.0`,
          SHA,
          VERSION
        )
      ).toBe(
        `uses: andykenward/github-actions-cloudflare-pages/delete@${SHA} #v${VERSION}`
      )
    })
  })

  test('replaces both main and delete references in the same content', () => {
    const content = [
      'uses: andykenward/github-actions-cloudflare-pages@v3.0.0',
      'uses: andykenward/github-actions-cloudflare-pages/delete@v2.3.2'
    ].join('\n')

    expect(replaceVersionReferences(content, SHA, VERSION)).toBe(
      [
        `uses: andykenward/github-actions-cloudflare-pages@${SHA} #v${VERSION}`,
        `uses: andykenward/github-actions-cloudflare-pages/delete@${SHA} #v${VERSION}`
      ].join('\n')
    )
  })

  test('delete reference is not partially matched by main pattern', () => {
    const result = replaceVersionReferences(
      'uses: andykenward/github-actions-cloudflare-pages/delete@v2.3.2',
      SHA,
      VERSION
    )
    expect(result).toContain('/delete@')
    expect(result).not.toMatch(/github-actions-cloudflare-pages@.*\/delete@/)
  })

  test('leaves content without action references unchanged', () => {
    const content = '# Just a README\nSome text without action references.'
    expect(replaceVersionReferences(content, SHA, VERSION)).toBe(content)
  })
})
