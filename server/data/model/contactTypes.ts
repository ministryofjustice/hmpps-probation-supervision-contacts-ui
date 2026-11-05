import { ContactTypeCategoryEntries } from './contactCategories'
import { NoOutcomeContactTypeDetails } from './noOutcomeContactTypes'
import { OutcomeContactTypeDetails } from './outcomeContactTypes'

export type ContactTypeOption = {
  code: string
  description: string
}

export const FrequentlyUsedContactTypeOptions = (): ContactTypeOption[] =>
  ContactTypeCategoryEntries()
    .filter(entry => entry.isFrequentlyUsed)
    .map(entry => ({ code: entry.code, description: entry.displayName }))
    .sort((a, b) => a.description.localeCompare(b.description))

const contactTypeByCode = new Map<string, ContactTypeOption>()

ContactTypeCategoryEntries().forEach(entry => {
  if (!contactTypeByCode.has(entry.code)) {
    contactTypeByCode.set(entry.code, { code: entry.code, description: entry.displayName })
  }
})

NoOutcomeContactTypeDetails.forEach(detail => {
  contactTypeByCode.set(detail.code, { code: detail.code, description: detail.description })
})

OutcomeContactTypeDetails.forEach(detail => {
  contactTypeByCode.set(detail.code, { code: detail.code, description: detail.description })
})

export const ContactTypeOptions: ContactTypeOption[] = Array.from(contactTypeByCode.values()).sort((a, b) =>
  a.description.localeCompare(b.description),
)
