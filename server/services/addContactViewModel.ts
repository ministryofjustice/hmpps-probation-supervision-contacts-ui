import { DateTime } from 'luxon'
import { Sentence } from '../data/model/contacts'
import { convertToTitleCase } from '../utils/utils'
import { dateWithYear } from '../utils/dateWithYear'
import { CONTACT_DETAILS_MAX_LENGTH } from '../utils/validationUtils'
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

type ContactTypeDetail = ReturnType<typeof getContactTypeDetailBySlug>
type Outcome = NonNullable<ContactTypeDetail>['outcomes'][number]

const buildPersonOption = (showPersonOption: boolean, personLabel: string, selectedSentence?: string) => {
  if (!showPersonOption) return []
  return [
    {
      text: personLabel,
      value: 'PERSON_LEVEL_CONTACT',
      checked: selectedSentence === 'PERSON_LEVEL_CONTACT',
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
    },
  ]
}

const buildSentenceOptions = (showEventOptions: boolean, sentences: Sentence[], selectedSentence?: string) => {
  if (!showEventOptions) return []
  return sentences
    .filter(sentence => !!sentence.order?.description)
    .map(sentence => {
      const formattedDate = sentence.order.startDate ? dateWithYear(sentence.order.startDate) : null
      const hintText = formattedDate ? `Sentence start date: ${formattedDate}.` : ''
      return {
        text: sentence.order.description,
        value: sentence.id,
        checked: sentence.id.toString() === selectedSentence?.toString(),
        label: {
          classes: 'govuk-!-font-weight-bold',
        },
        hint: hintText ? { text: hintText } : undefined,
      }
    })
}

const buildOutcomeItems = (outcomes: Outcome[], selectedOutcomeCode?: string) => {
  if (outcomes.length === 1) {
    return [
      {
        text: `Set the outcome to '${outcomes[0].label}'`,
        value: outcomes[0].value,
        checked: selectedOutcomeCode === outcomes[0].value,
        attributes: {
          'data-qa': 'contactOutcome',
        },
      },
    ]
  }
  return outcomes.map(outcome => ({
    text: outcome.label,
    value: outcome.value,
    checked: selectedOutcomeCode === outcome.value,
    attributes: {
      'data-qa': 'contactOutcome',
    },
  }))
}

const outcomeType = (isInsetOutcome: boolean, outcomeCount: number) => {
  if (isInsetOutcome) return 'inset'
  if (outcomeCount === 1) return 'checkbox'
  return 'radios'
}

const buildOutcomeSection = (
  detail: ContactTypeDetail,
  outcomes: Outcome[],
  isInsetOutcome: boolean,
  selectedOutcomeCode?: string,
) => {
  if (outcomes.length === 0) return undefined
  return {
    legend:
      detail?.mandatoryOutcome || detail?.showOutcomeBanner ? 'Select an outcome' : 'Select an outcome (optional)',
    type: outcomeType(isInsetOutcome, outcomes.length),
    items: buildOutcomeItems(outcomes, selectedOutcomeCode),
    insetText: isInsetOutcome ? `The outcome for this contact will be set to '${outcomes[0].label}'.` : undefined,
  }
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

  const relatesToOptions = [
    ...buildPersonOption(showPersonOption, personLabel, updatedFormValues.sentence),
    ...buildSentenceOptions(showEventOptions, sentences, updatedFormValues.sentence),
  ]

  const isInsetOutcome = !!detail?.showOutcomeBanner && outcomes.length === 1

  if (isInsetOutcome) {
    updatedFormValues.outcomeCode = outcomes[0].value
  }

  const dateToday = DateTime.now().toFormat('d/M/yyyy')

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
    detailsMaxLength: CONTACT_DETAILS_MAX_LENGTH,
    showOutcomeBanner: detail?.showOutcomeBanner ?? false,
    dateToday,
    outcomeSection: buildOutcomeSection(detail, outcomes, isInsetOutcome, updatedFormValues.outcomeCode),
  }
}
