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
  const contactDetailsOutcomes = contactDetails?.outcomes?.filter(outcome => outcomeCodes?.includes(outcome.value))
  const selectedOutcome = contactDetailsOutcomes.find(
    outcome =>
      normalise(outcome.label) === normalise(contact.appointment.outcome) ||
      normalise(outcome.systemLabel) === normalise(contact.appointment.outcome),
  )
  const outcomeLabel = selectedOutcome?.label ?? contact.appointment.outcome

  if (contactDetails?.outcomes?.length === 1) {
    return {
      outcomeSection: false,
      outcomeLabel,
    }
  }

  const outcomeSection = {
    legend: 'Select an outcome',

    type: 'radios',

    items: contactDetails?.outcomes.map(outcome => ({
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

export const updateContactOutcomeCode = (displayName: string, outcomeCode: string, flags: FeatureFlags = {}) => {
  const contactDetails = OutcomeContactTypeDetails(flags).find(item => item.description === displayName)
  const hasSingleOutcome = contactDetails?.outcomes?.length === 1
  if (hasSingleOutcome) {
    return contactDetails.outcomes[0].value
  }

  return outcomeCode
}
