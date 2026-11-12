import { Sentence } from '../data/model/contacts'
import { buildAddContactViewModel } from './addContactViewModel'

const sentences: Sentence[] = [
  {
    id: 1,
    order: {
      description: 'Community Order 1',
      startDate: '2024-06-15',
    },
  },
  {
    id: 2,
    order: {
      description: 'Community Order 2',
      startDate: '2025-04-19',
    },
  },
]

describe('buildAddContactViewModel', () => {
  it('auto-selects person for person-only contacts and hides the relates to question', () => {
    const result = buildAddContactViewModel({
      crn: 'X123456',
      slug: 'accommodation-evidence',
      sentences,
      personName: 'Stuart Morrison',
      formValues: {},
    })

    expect(result.contactTypeName).toBe('Accommodation evidence')
    expect(result.showRelatesToQuestion).toBe(false)
    expect(result.showPersonOption).toBe(false)
    expect(result.showEventOptions).toBe(false)
    expect(result.relatesToOptions).toEqual([])
    expect(result.formValues).toEqual({
      sentence: 'PERSON_LEVEL_CONTACT',
      sensitivity: 'No',
    })
    expect(result.guidance).toBeUndefined()
  })

  it('builds guidance, sentence options and title-cased officer names for contacts with guidance', () => {
    const result = buildAddContactViewModel({
      crn: 'X123456',
      slug: 'victim-liaison-contact',
      sentences,
      personName: 'Stuart Morrison',
      formValues: { sentence: '2' },
      responsibleOfficer: 'SHOW_OFFICER',
      responsibleOfficerForename: 'jane',
      responsibleOfficerSurname: 'doe',
      csrfToken: 'csrf-token',
    })

    expect(result.contactTypeName).toBe('Victim liaison contact')
    expect(result.showRelatesToQuestion).toBe(true)
    expect(result.showPersonOption).toBe(true)
    expect(result.showEventOptions).toBe(true)
    expect(result.formValues.sentence).toBe('2')
    expect(result.formValues.sensitivity).toBe('Yes')
    expect(result.responsibleOfficer).toBe('SHOW_OFFICER')
    expect(result.responsibleOfficerForename).toBe('Jane')
    expect(result.responsibleOfficerSurname).toBe('Doe')
    expect(result.csrfToken).toBe('csrf-token')
    expect(result.relatesToOptions).toEqual([
      expect.objectContaining({
        text: 'Stuart Morrison',
        value: 'PERSON_LEVEL_CONTACT',
        checked: false,
      }),
      expect.objectContaining({
        text: 'Community Order 1',
        value: 1,
        checked: false,
        hint: { text: 'Sentence start date: 15 June 2024.' },
      }),
      expect.objectContaining({
        text: 'Community Order 2',
        value: 2,
        checked: true,
        hint: { text: 'Sentence start date: 19 April 2025.' },
      }),
    ])
    expect(result.guidance).toEqual(
      expect.objectContaining({
        paragraphs: [
          'Victim liaison contacts should normally be marked as sensitive. You should include these headings in the details:',
        ],
        bullets: ['Probation practitioner and VLO contact type', 'Sub category', 'Probation practitioner actions'],
      }),
    )
  })

  it('only shows event options for event-only contacts and includes guidance when configured', () => {
    const result = buildAddContactViewModel({
      crn: 'X123456',
      slug: 'mappa-level-setting-process',
      sentences,
      personName: 'Stuart Morrison',
      formValues: {},
    })

    expect(result.contactTypeName).toBe('MAPPA level setting process')
    expect(result.showRelatesToQuestion).toBe(true)
    expect(result.showPersonOption).toBe(false)
    expect(result.showEventOptions).toBe(true)
    expect(result.relatesToOptions).toHaveLength(2)
    expect(result.formValues.sensitivity).toBe('Yes')
    expect(result.guidance).toEqual({
      paragraphs: ["You must notify the prison of the MAPPA level, and record that you've done this."],
      insertText: "You must notify the prison of the MAPPA level, and record that you've done this.",
    })
  })

  it('builds a mandatory radio outcome section for outcome contacts', () => {
    const result = buildAddContactViewModel({
      crn: 'X123456',
      slug: 'management-oversight',
      sentences,
      personName: 'Stuart Morrison',
      formValues: { outcomeCode: 'MO3' },
    })

    expect(result.showRelatesToQuestion).toBe(false)
    expect(result.outcomeSection).toEqual({
      legend: 'Select an outcome',
      type: 'radios',
      items: expect.arrayContaining([
        expect.objectContaining({
          text: 'Management oversight decision',
          value: 'MO3',
          checked: true,
        }),
      ]),
    })
  })

  it('builds an inset outcome section with auto-selected value for single-outcome showOutcomeBanner contacts', () => {
    const result = buildAddContactViewModel({
      crn: 'X123456',
      slug: 'arrest-incident',
      sentences,
      personName: 'Stuart Morrison',
      formValues: {},
    })

    expect(result.formValues.outcomeCode).toBe('CO29')
    expect(result.outcomeSection).toEqual({
      legend: 'Select an outcome',
      type: 'inset',
      insetText: "The outcome for this contact will be set to 'Risk review'.",
      items: [
        expect.objectContaining({
          text: "Set the outcome to 'Risk review'",
          value: 'CO29',
          checked: true,
        }),
      ],
    })
  })

  it('builds MO8 guidance and mandatory radio outcomes for the HVRA contact', () => {
    const result = buildAddContactViewModel({
      crn: 'X123456',
      slug: 'management-oversight-home-visit-risk-assessment',
      sentences,
      personName: 'Stuart Morrison',
      formValues: { outcomeCode: 'MO23' },
    })

    expect(result.showRelatesToQuestion).toBe(false)
    expect(result.outcomeSection).toEqual({
      legend: 'Select an outcome',
      type: 'radios',
      items: expect.arrayContaining([
        expect.objectContaining({
          text: 'Home visit approved',
          value: 'MO23',
          checked: true,
        }),
      ]),
    })
    expect(result.guidance).toEqual(
      expect.objectContaining({
        sections: expect.arrayContaining([
          expect.objectContaining({
            paragraph: 'If you are the responsible officer, you must include:',
          }),
        ]),
      }),
    )
  })
})
