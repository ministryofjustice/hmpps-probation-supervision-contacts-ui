import { slugify } from '../utils/slugify'
import { ContactTypeOptions } from '../data/model/contactTypes'
import { ContactTypeDetail, NoOutcomeContactTypeDetails } from '../data/model/noOutcomeContactTypes'
import { OutcomeContactTypeDetails } from '../data/model/outcomeContactTypes'

export type GuidanceContent = {
  paragraphs: string[]
  bullets?: string[]
  sections?: Array<{
    paragraph?: string
    bullets?: string[]
  }>
  insertText: string
}

export const PERSON_ONLY_CONTACT_CODES = new Set(['ACOM1', 'IRP2', 'LRP1', 'MO1', 'MO8', 'PREVENT', 'RTEMS', 'ROTL'])

const GUIDANCE_EXCLUDED_CODES = new Set(['C344', 'CCMM', 'C150', 'C005', 'CNDC', 'CSNR', 'ERFM'])

const contactTypeDetails = [...NoOutcomeContactTypeDetails, ...OutcomeContactTypeDetails]

const detailsByCode = new Map<string, ContactTypeDetail>(contactTypeDetails.map(detail => [detail.code, detail]))

const detailsBySlug = new Map<string, ContactTypeDetail>(
  contactTypeDetails.map(detail => [slugify(detail.description), detail]),
)

export const getContactTypeDetailBySlug = (slug: string): ContactTypeDetail | undefined => detailsBySlug.get(slug)

export const getContactTypeNameBySlug = (slug: string): string => {
  const detail = detailsBySlug.get(slug)
  if (detail) {
    return detail.description
  }
  const matched = ContactTypeOptions.find(option => slugify(option.description) === slug)
  return matched?.description || 'Contact'
}

export const getContactTypeDetailByCode = (code: string): ContactTypeDetail | undefined => detailsByCode.get(code)

export const buildGuidanceContent = (detail?: ContactTypeDetail): GuidanceContent | undefined => {
  if (!detail || GUIDANCE_EXCLUDED_CODES.has(detail.code)) {
    return undefined
  }

  if (detail.code === 'MO8') {
    const firstBullets = [
      'the ROSH level and nature of any risk to probation staff',
      'any relevant information regarding the address or area',
      'the names of the practitioners carrying out the visit',
      'whether it is an initial visit or a repeat visit',
      'the duration of the home visit in minutes',
    ]
    const secondBullets = [
      'complete an office home visit itinerary diary and record the car registration',
      'use a personal safety device',
      'carry a mobile phone at all times',
      'contact the nominated contact point immediately before the visit and provide the estimated duration',
      'contact the nominated contact point again when the visit is completed',
      'advise the individual to secure any pets beforehand, where required',
    ]
    const sections = [
      {
        paragraph: 'If you are the responsible officer, you must include:',
        bullets: firstBullets,
      },
      {
        paragraph: 'If a home visit is approved, practitioners must:',
        bullets: secondBullets,
      },
      {
        paragraph: 'If you are the senior probation officer, you must include the rationale for your decision.',
      },
    ]
    const insertText = `${sections[0].paragraph}\n- ${firstBullets.join('\n- ')}\n\n${sections[1].paragraph}\n- ${secondBullets.join('\n- ')}\n\n${sections[2].paragraph}`
    return {
      paragraphs: sections.map(section => section.paragraph).filter((paragraph): paragraph is string => !!paragraph),
      sections,
      insertText,
    }
  }

  if (!detail.guidance) {
    return undefined
  }

  if (detail.code === 'CVIC') {
    const paragraphs = [
      'Victim liaison contacts should normally be marked as sensitive. You should include these headings in the details:',
    ]
    const bullets = ['Probation practitioner and VLO contact type', 'Sub category', 'Probation practitioner actions']
    const insertText = `${paragraphs[0]}\n- ${bullets.join('\n- ')}`
    return { paragraphs, bullets, insertText }
  }

  if (detail.code === 'VINC') {
    const paragraphs = [
      "If you want the information to be copied to ViSOR, you must select 'Yes' to the question 'Include contact in ViSOR report?' when the contact is first created. If you don't, the ViSOR team won't pick it up.",
      "If the contact does not have the 'Include contact in ViSOR report?' question, you should add the ViSOR register to this person on probation's record.",
    ]
    return { paragraphs, insertText: paragraphs.join('\n\n') }
  }

  return { paragraphs: [detail.guidance], insertText: detail.guidance }
}
