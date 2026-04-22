import { Sentence } from '../data/model/contacts'
import { convertToTitleCase } from '../utils/utils'
import { dateWithYear } from '../utils/dateWithYear'
import {
  buildGuidanceContent,
  getContactTypeDetailBySlug,
  getContactTypeNameBySlug,
  PERSON_ONLY_CONTACT_CODES,
} from './contactTypeDetails'

type BuildAddContactViewModelArgs = {
  crn: string
  slug: string
  sentences: Sentence[]
  personName: string
  formValues: Record<string, string>
  isVisor?: string
  responsibleOfficer?: string
  responsibleOfficerForename?: string
  responsibleOfficerSurname?: string
  csrfToken?: string
}

export const buildAddContactViewModel = ({
  crn,
  slug,
  sentences,
  personName,
  formValues,
  isVisor,
  responsibleOfficer,
  responsibleOfficerForename,
  responsibleOfficerSurname,
  csrfToken,
}: BuildAddContactViewModelArgs) => {
  const detail = getContactTypeDetailBySlug(slug)
  const contactTypeName = getContactTypeNameBySlug(slug)
  const relatesTo = detail?.relatesTo ?? ['Person', 'Pre-CJA Events', 'CJA/ORA Events']
  const isPersonOnly = !!detail && PERSON_ONLY_CONTACT_CODES.has(detail.code)
  const outcomes = detail?.outcomes ?? []
  const showPersonOption = !isPersonOnly && relatesTo.includes('Person')
  const showEventOptions =
    !isPersonOnly && (relatesTo.includes('Pre-CJA Events') || relatesTo.includes('CJA/ORA Events'))
  const personLabel = personName || 'Person on probation'

  const updatedFormValues = { ...formValues }

  if (isPersonOnly && !updatedFormValues.sentence) {
    updatedFormValues.sentence = 'PERSON_LEVEL_CONTACT'
  }

  if (!updatedFormValues.sensitivity && detail) {
    updatedFormValues.sensitivity = detail.sensitive ? 'Yes' : 'No'
  }

  const relatesToOptions = []

  if (showPersonOption) {
    relatesToOptions.push({
      text: personLabel,
      value: 'PERSON_LEVEL_CONTACT',
      checked: updatedFormValues.sentence === 'PERSON_LEVEL_CONTACT',
      label: {
        classes: 'govuk-!-font-weight-bold',
        attributes: {
          'data-qa': 'personLevelContactLabel',
        },
      },
      hint: {
        text: 'Relates to the person.',
      },
      attributes: {
        'data-qa': 'personLevelContact',
        'data-sentence': 'true',
        'data-reset-conditional-radios': '',
      },
    })
  }

  if (showEventOptions) {
    sentences.forEach(sentence => {
      if (!sentence.order?.description) {
        return
      }
      const formattedDate = sentence.order.startDate ? dateWithYear(sentence.order.startDate) : null
      const hintText = formattedDate ? `Sentence start date: ${formattedDate}.` : ''
      relatesToOptions.push({
        text: sentence.order.description,
        value: sentence.id,
        checked: updatedFormValues.sentence && sentence.id.toString() === updatedFormValues.sentence.toString(),
        label: {
          classes: 'govuk-!-font-weight-bold',
        },
        hint: hintText ? { text: hintText } : undefined,
      })
    })
  }

  const outcomeItems =
    outcomes.length === 1
      ? [
          {
            text: `Set the outcome to '${outcomes[0].label}'`,
            value: outcomes[0].value,
            checked: updatedFormValues.outcome === outcomes[0].value,
            attributes: {
              'data-qa': 'contactOutcome',
            },
          },
        ]
      : outcomes.map(outcome => ({
          text: outcome.label,
          value: outcome.value,
          checked: updatedFormValues.outcome === outcome.value,
          attributes: {
            'data-qa': 'contactOutcome',
          },
        }))

  return {
    crn,
    contactTypeName,
    csrfToken,
    formValues: updatedFormValues,
    isVisor,
    responsibleOfficer,
    responsibleOfficerForename: convertToTitleCase(responsibleOfficerForename || ''),
    responsibleOfficerSurname: convertToTitleCase(responsibleOfficerSurname || ''),
    relatesToOptions,
    showRelatesToQuestion: !isPersonOnly,
    showPersonOption,
    showEventOptions,
    guidance: buildGuidanceContent(detail),
    outcomeSection:
      outcomes.length > 0
        ? {
            legend: detail?.mandatoryOutcome ? 'Select an outcome' : 'Select an outcome (optional)',
            type: outcomes.length === 1 ? 'checkbox' : 'radios',
            items: outcomeItems,
          }
        : undefined,
  }
}
