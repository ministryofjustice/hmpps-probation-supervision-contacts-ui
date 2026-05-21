import { OutcomeContactTypeDetails } from '../data/model/outcomeContactTypes'

const normalise = (value?: string) => value?.replace(/\s+/g, '').toLowerCase() ?? ''

export const buildUpdateContactViewModelWithOutcome = ({
  crn,
  displayName,
  contact,
}: {
  crn: string
  displayName: string
  contact: {
    appointment: {
      outcome: string
    }
  }
}) => {
  const contactDetails = OutcomeContactTypeDetails.find(item => item.description === displayName)

  const outcomeSection = {
    legend: contactDetails.mandatoryOutcome ? 'Select an outcome' : 'Select an outcome (optional)',

    type: contactDetails.mandatoryOutcome ? 'radios' : 'checkbox',

    items: contactDetails.outcomes.map(outcome => ({
      text: outcome.label,
      value: outcome.value,

      checked: normalise(outcome.label) === normalise(contact.appointment.outcome),
    })),
  }

  return outcomeSection
}
