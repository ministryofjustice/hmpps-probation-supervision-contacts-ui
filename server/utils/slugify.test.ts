import { slugify } from './slugify'

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toEqual('hello-world')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('police liaison')).toEqual('police-liaison')
  })

  it('removes non-word characters', () => {
    expect(slugify('Hello, World!')).toEqual('hello-world')
  })

  it('collapses multiple spaces into a single hyphen', () => {
    expect(slugify('hello   world')).toEqual('hello-world')
  })

  it('handles a single word', () => {
    expect(slugify('Contact')).toEqual('contact')
  })

  it('converts a typical contact type description', () => {
    expect(slugify('Police Liaison')).toEqual('police-liaison')
  })
})
