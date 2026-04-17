import { ContactTypeCategoryEntries } from './contactCategories'
import { NoOutcomeContactTypeDetails } from './noOutcomeContactTypes'

export type ContactTypeOption = {
  code: string
  description: string
}

export const FrequentlyUsedContactTypeOptions: ContactTypeOption[] = [
  { code: 'CM3A', description: 'Email or text from other' },
  { code: 'CM3B', description: 'Email or text to other' },
  { code: 'CMOA', description: 'Email or text from person on probation' },
  { code: 'CMOB', description: 'Email or text to person on probation' },
  { code: 'C326', description: 'Internal communications' },
  { code: 'C204', description: 'Police liaison' },
  { code: 'CT3A', description: 'Telephone contact from other' },
  { code: 'CT3B', description: 'Telephone contact to other' },
  { code: 'CTOA', description: 'Telephone contact from person on probation' },
  { code: 'CTOB', description: 'Telephone contact to person on probation' },
]

const contactTypeByCode = new Map<string, ContactTypeOption>()

ContactTypeCategoryEntries.forEach(entry => {
  if (!contactTypeByCode.has(entry.code)) {
    contactTypeByCode.set(entry.code, { code: entry.code, description: entry.displayName })
  }
})

NoOutcomeContactTypeDetails.forEach(detail => {
  contactTypeByCode.set(detail.code, { code: detail.code, description: detail.description })
})

export const ContactTypeOptions: ContactTypeOption[] = Array.from(contactTypeByCode.values()).sort((a, b) =>
  a.description.localeCompare(b.description),
)
