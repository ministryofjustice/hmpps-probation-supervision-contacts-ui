import { ContactTypeCategoryEntries } from './contactCategories'
import { FeatureFlags } from './featureFlags'
import { NoOutcomeContactTypeDetails } from './noOutcomeContactTypes'
import { OutcomeContactTypeDetails } from './outcomeContactTypes'

export type ContactTypeOption = {
  code: string
  description: string
}

export const FrequentlyUsedContactTypeOptions = (flags: FeatureFlags = {}): ContactTypeOption[] =>
  ContactTypeCategoryEntries(flags)
    .filter(entry => entry.isFrequentlyUsed)
    .map(entry => ({ code: entry.code, description: entry.displayName }))
    .sort((a, b) => a.description.localeCompare(b.description))

export const ContactTypeOptions = (flags: FeatureFlags = {}): ContactTypeOption[] => {
  const contactTypeByCode = new Map<string, ContactTypeOption>()
  ContactTypeCategoryEntries(flags).forEach(entry => {
    if (!contactTypeByCode.has(entry.code)) {
      contactTypeByCode.set(entry.code, { code: entry.code, description: entry.displayName })
    }
  })

  NoOutcomeContactTypeDetails.forEach(detail => {
    contactTypeByCode.set(detail.code, { code: detail.code, description: detail.description })
  })

  OutcomeContactTypeDetails(flags).forEach(detail => {
    contactTypeByCode.set(detail.code, { code: detail.code, description: detail.description })
  })

  return Array.from(contactTypeByCode.values()).sort((a, b) => a.description.localeCompare(b.description))
}
