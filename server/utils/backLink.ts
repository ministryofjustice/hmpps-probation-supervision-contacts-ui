export const defaultBackUrl = (crn: string) => `/case/${crn}/add-frequently-used-contact`

const allowedPaths = (crn: string) => [
  `/case/${crn}/add-frequently-used-contact`,
  `/case/${crn}/contacts/find-contact-to-add`,
  `/case/${crn}/contacts/search-keyword`,
]

// Only allow relative links back to one of the add contact entry pages, to avoid open redirects
export const sanitiseBackUrl = (raw: unknown, crn: string): string | undefined => {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return undefined
  }
  const path = value.split(/[?#]/)[0]
  return allowedPaths(crn).includes(path) ? value : undefined
}

export const resolveBackUrl = (raw: unknown, crn: string): string => sanitiseBackUrl(raw, crn) ?? defaultBackUrl(crn)

export const withBackUrl = (href: string, backUrl?: string): string =>
  backUrl ? `${href}?backUrl=${encodeURIComponent(backUrl)}` : href
