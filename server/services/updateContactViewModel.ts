import { OutcomeContactTypeDetails } from '../data/model/outcomeContactTypes'

const normalise = (value?: string) => value?.replace(/\s+/g, '').toLowerCase() ?? ''

export const buildUpdateContactViewModelWithOutcome = ({
  displayName,
  contact,
}: {
  displayName: string
  contact: {
    appointment: {
      outcome: string
    }
  }
}) => {
  const contactDetails = OutcomeContactTypeDetails.find(item => item.description === displayName)

  if (contactDetails?.outcomes?.length === 1) {
    return false
  }

  const outcomeSection = {
    legend: 'Select an outcome',

    type: 'radios',

    items: contactDetails.outcomes.map(outcome => ({
      text: outcome.label,
      value: outcome.value,

      checked: normalise(outcome.label) === normalise(contact.appointment.outcome),
    })),
  }

  return outcomeSection
}
