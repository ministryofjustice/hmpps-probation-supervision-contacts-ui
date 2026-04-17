import { slugify } from '../utils/slugify'
import { ContactTypeOptions } from '../data/model/contactTypes'
import { ContactTypeDetail, NoOutcomeContactTypeDetails } from '../data/model/noOutcomeContactTypes'

export type GuidanceContent = {
  paragraphs: string[]
  bullets?: string[]
  insertText: string
}

export const PERSON_ONLY_CONTACT_CODES = new Set(['ACOM1', 'LRP1', 'PREVENT', 'RTEMS', 'ROTL'])

const GUIDANCE_EXCLUDED_CODES = new Set(['C344', 'CCMM', 'C150', 'C005', 'CNDC', 'CSNR'])

const detailsByCode = new Map<string, ContactTypeDetail>(
  NoOutcomeContactTypeDetails.map(detail => [detail.code, detail]),
)

const detailsBySlug = new Map<string, ContactTypeDetail>(
  NoOutcomeContactTypeDetails.map(detail => [slugify(detail.description), detail]),
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
  if (!detail?.guidance || GUIDANCE_EXCLUDED_CODES.has(detail.code)) {
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
