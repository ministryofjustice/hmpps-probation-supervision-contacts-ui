import { isNotEmpty, isValidDate, isValidDateFormat, timeIsValid24HourFormat, validateWithSpec } from './validationUtils'

describe('isNotEmpty', () => {
  it('returns true when value is present', () => {
    expect(isNotEmpty(['some value'])).toEqual(true)
  })

  it('returns false when value is empty string', () => {
    expect(isNotEmpty([''])).toEqual(false)
  })

  it('returns false when value is undefined', () => {
    expect(isNotEmpty([undefined])).toEqual(false)
  })

  it('returns false when value is null', () => {
    expect(isNotEmpty([null])).toEqual(false)
  })
})

describe('isValidDate', () => {
  it('returns true for a valid date in d/M/yyyy format', () => {
    expect(isValidDate(['1/1/2023'])).toEqual(true)
  })

  it('returns true for a valid date with two-digit day and month', () => {
    expect(isValidDate(['31/12/2023'])).toEqual(true)
  })

  it('returns false for an invalid date', () => {
    expect(isValidDate(['32/1/2023'])).toEqual(false)
  })

  it('returns false for an empty string', () => {
    expect(isValidDate([''])).toEqual(false)
  })

  it('returns false when value is undefined', () => {
    expect(isValidDate([undefined])).toEqual(false)
  })
})

describe('isValidDateFormat', () => {
  it('returns true for valid d/M/yyyy format', () => {
    expect(isValidDateFormat(['1/1/2023'])).toEqual(true)
  })

  it('returns true for dd/mm/yyyy format', () => {
    expect(isValidDateFormat(['31/12/2023'])).toEqual(true)
  })

  it('returns false for yyyy-mm-dd format', () => {
    expect(isValidDateFormat(['2023-01-01'])).toEqual(false)
  })

  it('returns false for invalid format', () => {
    expect(isValidDateFormat(['not-a-date'])).toEqual(false)
  })

  it('returns false for empty string', () => {
    expect(isValidDateFormat([''])).toEqual(false)
  })

  it('returns false when leading zero used for day', () => {
    expect(isValidDateFormat(['01/01/2023'])).toEqual(false)
  })
})

describe('timeIsValid24HourFormat', () => {
  it('returns true for a valid 24-hour time', () => {
    expect(timeIsValid24HourFormat([undefined, '09:30'])).toEqual(true)
  })

  it('returns true for midnight', () => {
    expect(timeIsValid24HourFormat([undefined, '00:00'])).toEqual(true)
  })

  it('returns true for 23:59', () => {
    expect(timeIsValid24HourFormat([undefined, '23:59'])).toEqual(true)
  })

  it('returns false for invalid time format', () => {
    expect(timeIsValid24HourFormat([undefined, '9:30'])).toEqual(false)
  })

  it('returns false for time with seconds', () => {
    expect(timeIsValid24HourFormat([undefined, '09:30:00'])).toEqual(false)
  })

  it('returns false when time is undefined', () => {
    expect(timeIsValid24HourFormat([undefined, undefined])).toEqual(false)
  })

  it('returns false for 24:00', () => {
    expect(timeIsValid24HourFormat([undefined, '24:00'])).toEqual(false)
  })
})

describe('validateWithSpec', () => {
  const validatorAlwaysTrue = jest.fn().mockReturnValue(true)
  const validatorAlwaysFalse = jest.fn().mockReturnValue(false)

  beforeEach(() => {
    jest.clearAllMocks()
    validatorAlwaysTrue.mockReturnValue(true)
    validatorAlwaysFalse.mockReturnValue(false)
  })

  it('returns empty errors when all validators pass', () => {
    const request = { name: 'John' }
    const spec = {
      name: {
        optional: false,
        checks: [{ validator: validatorAlwaysTrue, msg: 'Name is required' }],
      },
    }
    expect(validateWithSpec(request, spec)).toEqual({})
  })

  it('returns error message when validator fails', () => {
    const request = { name: 'John' }
    const spec = {
      name: {
        optional: false,
        checks: [{ validator: validatorAlwaysFalse, msg: 'Name is invalid' }],
      },
    }
    expect(validateWithSpec(request, spec)).toEqual({ name: 'Name is invalid' })
  })

  it('skips optional fields when value is falsy', () => {
    const request = { name: '' }
    const spec = {
      name: {
        optional: true,
        checks: [{ validator: validatorAlwaysFalse, msg: 'Name is invalid' }],
      },
    }
    expect(validateWithSpec(request, spec)).toEqual({})
  })

  it('returns error for non-optional field not present in request', () => {
    const request = {}
    const spec = {
      name: {
        optional: false,
        checks: [{ validator: validatorAlwaysTrue, msg: 'Name is required' }],
      },
    }
    expect(validateWithSpec(request, spec)).toEqual({ name: 'Name is required' })
  })

  it('stops at first failing check for a field', () => {
    const request = { name: 'John' }
    const spec = {
      name: {
        optional: false,
        checks: [
          { validator: validatorAlwaysFalse, msg: 'First error' },
          { validator: validatorAlwaysFalse, msg: 'Second error' },
        ],
      },
    }
    const errors = validateWithSpec(request, spec)
    expect(errors).toEqual({ name: 'First error' })
    expect(validatorAlwaysFalse).toHaveBeenCalledTimes(1)
  })
})
