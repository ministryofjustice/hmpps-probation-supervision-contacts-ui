import { convertDateToIso } from './toDateOnly'

describe('convertDateToIso', () => {
  it('should convert a date to ISO format', () => {
    expect(convertDateToIso('21/5/2026')).toBe('2026-05-21')
  })
})
