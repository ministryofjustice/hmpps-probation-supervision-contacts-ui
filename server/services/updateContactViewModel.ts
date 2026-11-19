import { FeatureFlags } from '../data/model/featureFlags'
import { OutcomeContactTypeDetails } from '../data/model/outcomeContactTypes'

const normalise = (value?: string) => value?.replace(/\s+/g, '').toLowerCase() ?? ''

export const buildUpdateContactViewModelWithOutcome = (
  {
    displayName,
    contact,
    outcomeCodes,
  }: {
    displayName: string
    contact: {
      appointment: {
        outcome: string
      }
    }
    outcomeCodes?: string[]
  },
  flags: FeatureFlags = {},
) => {
  const contactDetails = OutcomeContactTypeDetails(flags).find(item => item.description === displayName)
  const contactDetailsOutcomes = flags?.enableCheckOutcomes20261124Squad3
    ? contactDetails?.outcomes?.filter(outcome => outcomeCodes?.includes(outcome.value))
    : contactDetails?.outcomes
  const selectedOutcome = contactDetailsOutcomes.find(
    outcome =>
      normalise(outcome.label) === normalise(contact.appointment.outcome) ||
      normalise(outcome.systemLabel) === normalise(contact.appointment.outcome),
  )
  const outcomeLabel = selectedOutcome?.label ?? contact.appointment.outcome

  if (contactDetailsOutcomes.length === 1) {
    return {
      outcomeSection: false,
      outcomeLabel,
    }
  }

  const outcomeSection = {
    legend: 'Select an outcome',

    type: 'radios',

    items: contactDetailsOutcomes.map(outcome => ({
      text: outcome.label,
      value: outcome.value,

      checked:
        normalise(outcome.label) === normalise(contact.appointment.outcome) ||
        normalise(outcome.systemLabel) === normalise(contact.appointment.outcome),
    })),
  }
  return {
    outcomeSection,
    outcomeLabel,
  }
}

export const updateContactOutcomeCode = (
  displayName: string,
  outcomeCode: string,
  flags: FeatureFlags = {},
  outcomeCodes: string[] = [],
) => {
  const contactDetails = OutcomeContactTypeDetails(flags).find(item => item.description === displayName)
  const contactDetailsOutcomes = flags?.enableCheckOutcomes20261124Squad3
    ? contactDetails?.outcomes?.filter(outcome => outcomeCodes?.includes(outcome.value))
    : contactDetails?.outcomes
  const hasSingleOutcome = contactDetailsOutcomes?.length === 1
  if (hasSingleOutcome) {
    return contactDetailsOutcomes[0].value
  }

  return outcomeCode
}
