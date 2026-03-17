import { formattedDate } from './formattedDate'

describe('utils/formattedDate', () => {
  describe('returns empty string for falsy input', () => {
    it.each([
      ['null', null],
      ['empty string', ''],
      ['undefined', undefined],
    ])('%s', (_, input) => {
      expect(formattedDate(input as string)).toEqual('')
    })
  })

  describe('converts D/M/YYYY to YYYY-MM-DD', () => {
    it.each([
      ['single digit day and month', '1/3/2024', '2024-03-01'],
      ['double digit day and month', '25/12/2023', '2023-12-25'],
      ['day needing padding', '5/11/2024', '2024-11-05'],
      ['month needing padding', '15/1/2024', '2024-01-15'],
      ['no padding needed', '31/10/2025', '2025-10-31'],
    ])('%s: formattedDate(%s)', (_, input, expected) => {
      expect(formattedDate(input)).toEqual(expected)
    })
  })

  describe('throws on invalid format', () => {
    it.each([
      ['missing year', '1/3/'],
      ['missing month', '1//2024'],
      ['missing day', '/3/2024'],
      ['ISO format', '2024-03-01'],
      ['only two parts', '1/3'],
    ])('%s: formattedDate(%s)', (_, input) => {
      expect(() => formattedDate(input)).toThrow(`Invalid date format. Expected D/M/YYYY but received: ${input}`)
    })
  })
})
