import { buildUpdateContactViewModelWithOutcome, updateContactOutcomeCode } from './updateContactViewModel'

describe('buildUpdateContactViewModelWithOutcome', () => {
  it('returns false when the contact type has a single outcome', () => {
    const result = buildUpdateContactViewModelWithOutcome({
      displayName: 'Arrest incident',
      contact: {
        appointment: {
          outcome: '',
        },
      },
    })

    expect(result).toBe(false)
  })

  it('returns an outcome section when the contact type has multiple outcomes', () => {
    const result = buildUpdateContactViewModelWithOutcome({
      displayName: 'Safeguarding enquiries - response received',
      contact: {
        appointment: {
          outcome: '',
        },
      },
    })
    expect(result).toEqual(
      expect.objectContaining({
        legend: 'Select an outcome',
        type: 'radios',
        items: [
          {
            checked: false,
            text: 'Response received - known to social services',
            value: 'SFG1',
          },
          {
            checked: false,
            text: 'Response received - not known to social services',
            value: 'SFG2',
          },
        ],
      }),
    )
  })
})

describe('updateContactOutcomeCode', () => {
  it('returns the supplied outcome code when multiple outcomes exist', () => {
    const result = updateContactOutcomeCode('Safeguarding enquiries - response received', 'SFG1')

    expect(result).toBe('SFG1')
  })

  it('returns the only available outcome code when a single outcome exists', () => {
    const result = updateContactOutcomeCode('Arrest incident', '')

    expect(result).toBe('CO29')
  })
})
