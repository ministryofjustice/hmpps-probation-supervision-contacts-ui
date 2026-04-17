import {
  buildGuidanceContent,
  getContactTypeDetailByCode,
  getContactTypeDetailBySlug,
  getContactTypeNameBySlug,
} from './contactTypeDetails'

describe('contactTypeDetails', () => {
  it('returns contact type details by slug for no outcome contacts', () => {
    expect(getContactTypeDetailBySlug('mappa-level-setting-process')).toEqual(
      expect.objectContaining({
        code: 'MAPLS',
        description: 'MAPPA level setting process',
      }),
    )
  })

  it('returns a contact type name from standard contact types when no no-outcome detail exists', () => {
    expect(getContactTypeNameBySlug('police-liaison')).toBe('Police liaison')
  })

  it('falls back to Contact when the slug is unknown', () => {
    expect(getContactTypeNameBySlug('does-not-exist')).toBe('Contact')
  })

  it('does not build guidance content when a contact has no displayable guidance', () => {
    expect(buildGuidanceContent(getContactTypeDetailByCode('C344'))).toBeUndefined()
    expect(buildGuidanceContent(undefined)).toBeUndefined()
  })

  it('builds single paragraph guidance for suicide or self harm information', () => {
    expect(buildGuidanceContent(getContactTypeDetailByCode('C280'))).toEqual({
      paragraphs: ["You should complete a safety plan, and record that you've done this."],
      insertText: "You should complete a safety plan, and record that you've done this.",
    })
  })

  it('builds bullet guidance for victim liaison contact', () => {
    expect(buildGuidanceContent(getContactTypeDetailByCode('CVIC'))).toEqual({
      paragraphs: [
        'Victim liaison contacts should normally be marked as sensitive. You should include these headings in the details:',
      ],
      bullets: ['Probation practitioner and VLO contact type', 'Sub category', 'Probation practitioner actions'],
      insertText:
        'Victim liaison contacts should normally be marked as sensitive. You should include these headings in the details:\n- Probation practitioner and VLO contact type\n- Sub category\n- Probation practitioner actions',
    })
  })

  it('builds multi paragraph guidance for ViSOR information contact', () => {
    expect(buildGuidanceContent(getContactTypeDetailByCode('VINC'))).toEqual({
      paragraphs: [
        "If you want the information to be copied to ViSOR, you must select 'Yes' to the question 'Include contact in ViSOR report?' when the contact is first created. If you don't, the ViSOR team won't pick it up.",
        "If the contact does not have the 'Include contact in ViSOR report?' question, you should add the ViSOR register to this person on probation's record.",
      ],
      insertText:
        "If you want the information to be copied to ViSOR, you must select 'Yes' to the question 'Include contact in ViSOR report?' when the contact is first created. If you don't, the ViSOR team won't pick it up.\n\nIf the contact does not have the 'Include contact in ViSOR report?' question, you should add the ViSOR register to this person on probation's record.",
    })
  })
})
