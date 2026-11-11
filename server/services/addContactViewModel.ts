import { DateTime } from 'luxon'
import { Sentence, Templates } from '../data/model/contacts'
import { convertToTitleCase } from '../utils/utils'
import { dateWithYear } from '../utils/dateWithYear'
import { CONTACT_DETAILS_MAX_LENGTH } from '../utils/validationUtils'
import {
  buildGuidanceContent,
  getContactTypeDetailBySlug,
  getContactTypeNameBySlug,
  PERSON_ONLY_CONTACT_CODES,
} from './contactTypeDetails'
import { FeatureFlags } from '../data/model/featureFlags'
import { ContactTypeOption } from '../data/model/contactTypes'

type BuildAddContactViewModelArgs = {
  crn: string
  slug: string
  selectedType?: ContactTypeOption
  sentences: Sentence[]
  personName: string
  formValues: Record<string, string>
  isVisor?: string
  responsibleOfficer?: string
  responsibleOfficerForename?: string
  responsibleOfficerSurname?: string
  csrfToken?: string
  backUrl?: string
  isEarlyTermination?: boolean
  documentTemplates?: Templates
}

export const buildAddContactViewModel = (
  {
    crn,
    slug,
    selectedType,
    sentences,
    personName,
    formValues,
    isVisor,
    responsibleOfficer,
    responsibleOfficerForename,
    responsibleOfficerSurname,
    csrfToken,
    backUrl,
    documentTemplates,
  }: BuildAddContactViewModelArgs,
  flags: FeatureFlags = {},
) => {
  const detail = getContactTypeDetailBySlug(slug, flags)
  const contactTypeName = getContactTypeNameBySlug(slug, flags)
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

  const isInsetOutcome = !!detail?.showOutcomeBanner && outcomes.length === 1

  function outcomeType() {
    if (isInsetOutcome) return 'inset'
    if (outcomes.length === 1) return 'checkbox'
    return 'radios'
  }

  if (isInsetOutcome) {
    updatedFormValues.outcomeCode = outcomes[0].value
  }

  const outcomeItems =
    outcomes.length === 1
      ? [
          {
            text: `Set the outcome to '${outcomes[0].label}'`,
            value: outcomes[0].value,
            checked: updatedFormValues.outcomeCode === outcomes[0].value,
            attributes: {
              'data-qa': 'contactOutcome',
            },
          },
        ]
      : outcomes.map(outcome => ({
          text: outcome.label,
          value: outcome.value,
          checked: updatedFormValues.outcomeCode === outcome.value,
          attributes: {
            'data-qa': 'contactOutcome',
          },
        }))

  const dateToday = DateTime.now().toFormat('d/M/yyyy')

  const isEarlyTermination =
    flags.enableEarlyTermination20261103Squad3 && contactTypeName === 'Request early termination'

  const templates: { link: string; name: string }[] = []
  if (flags.enableEarlyTermination20261103Squad3 && selectedType) {
    documentTemplates?.templates.forEach(template => {
      const link = `/contacts/types/${selectedType?.code}/documents/${template.name}`
      const { name } = template
      templates.push({ link, name })
    })
  }

  return {
    crn,
    contactTypeName,
    csrfToken,
    backLink: backUrl ?? `/case/${crn}/add-frequently-used-contact`,
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
    isEarlyTermination,
    templates,
    outcomeSection:
      outcomes.length > 0
        ? {
            legend:
              detail?.mandatoryOutcome || detail?.showOutcomeBanner
                ? 'Select an outcome'
                : 'Select an outcome (optional)',
            type: outcomeType(),
            items: outcomeItems,
            insetText: isInsetOutcome
              ? `The outcome for this contact will be set to '${outcomes[0].label}'.`
              : undefined,
          }
        : undefined,
  }
}
