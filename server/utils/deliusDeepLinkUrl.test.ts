import { deliusDeepLinkUrl } from './deliusDeepLinkUrl'

const BASE = 'https://ndelius-dummy-url/NDelius-war/delius/JSP/deeplink.xhtml'

describe('deliusDeepLinkUrl', () => {
  it('returns empty string when component is missing', () => {
    expect(deliusDeepLinkUrl('', 'X123456')).toBe('')
  })

  it('returns empty string when crn is missing', () => {
    expect(deliusDeepLinkUrl('ContactList', '')).toBe('')
  })

  it('builds basic URL with component and crn', () => {
    expect(deliusDeepLinkUrl('ContactList', 'X123456')).toBe(`${BASE}?component=ContactList&CRN=X123456`)
  })

  it('appends contactId when provided', () => {
    expect(deliusDeepLinkUrl('ContactList', 'X123456', '99')).toBe(
      `${BASE}?component=ContactList&CRN=X123456&contactID=99`,
    )
  })

  it('appends componentId when provided', () => {
    expect(deliusDeepLinkUrl('ContactList', 'X123456', undefined, '42')).toBe(
      `${BASE}?component=ContactList&CRN=X123456&componentId=42`,
    )
  })

  it('appends both contactId and componentId when provided', () => {
    expect(deliusDeepLinkUrl('ContactList', 'X123456', '99', '42')).toBe(
      `${BASE}?component=ContactList&CRN=X123456&contactID=99&componentId=42`,
    )
  })
})
