import { toIsoDateTime } from './toDateandTime'

describe('toIsoDateTime', () => {
  it('returns an ISO string from date and time', () => {
    const result = toIsoDateTime('17/4/2016', '09:45')

    expect(result).toBe('2016-04-17T08:45:00.000Z')
  })
})
