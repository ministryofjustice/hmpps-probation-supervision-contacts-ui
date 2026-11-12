import { defaultBackUrl, resolveBackUrl, sanitiseBackUrl, withBackUrl } from './backLink'

describe('backLink', () => {
  const crn = 'X123456'

  it.each([
    `/case/${crn}/add-frequently-used-contact`,
    `/case/${crn}/contacts/find-contact-to-add?action=search&categories=Alert`,
    `/case/${crn}/contacts/search-keyword?keyword=email&action=search`,
  ])('accepts %s', url => {
    expect(sanitiseBackUrl(url, crn)).toBe(url)
  })

  it.each([
    undefined,
    '',
    'https://evil.com',
    '//evil.com',
    '/\\evil.com',
    `/case/OTHER/add-frequently-used-contact`,
    `/case/${crn}/contacts/add-email`,
    `/case/${crn}/add-frequently-used-contactx`,
  ])('rejects %s', url => {
    expect(sanitiseBackUrl(url, crn)).toBeUndefined()
  })

  it('uses first value of an array', () => {
    expect(sanitiseBackUrl([`/case/${crn}/contacts/search-keyword`, 'x'], crn)).toBe(
      `/case/${crn}/contacts/search-keyword`,
    )
  })

  it('falls back to frequently used contacts', () => {
    expect(resolveBackUrl('https://evil.com', crn)).toBe(defaultBackUrl(crn))
  })

  it('appends an encoded backUrl', () => {
    expect(withBackUrl('/a', '/b?c=d&e=f')).toBe('/a?backUrl=%2Fb%3Fc%3Dd%26e%3Df')
    expect(withBackUrl('/a')).toBe('/a')
  })
})
