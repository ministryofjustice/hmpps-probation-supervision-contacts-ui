import { ADD_ET_OUTCOMES, BASE_ENTRIES, BASE_ET_OUTCOMES, OutcomeContactTypeDetails } from './outcomeContactTypes'

describe('outcomeContactTypeDetails', () => {
  it('returns base entries if no flags set', () => {
    expect(OutcomeContactTypeDetails()).toBe(BASE_ENTRIES)
  })
  it('includes ET entry if ET flag set', () => {
    const outcomes = OutcomeContactTypeDetails({ enableEarlyTermination20261103Squad3: true })
    expect(outcomes.some(entry => entry.code === 'ETRP')).toBeTruthy()
  })
  it('includes additional ET outcomes if additional outcome and ET flags set', () => {
    const outcomes = OutcomeContactTypeDetails({
      enableEarlyTermination20261103Squad3: true,
      enableETAdditionalOutcomes20261117Squad3: true,
    })
    const earlyTerminationEntry = outcomes.find(entry => entry.code === 'ETRP')
    expect(earlyTerminationEntry.outcomes).toEqual([...BASE_ET_OUTCOMES, ...ADD_ET_OUTCOMES])
  })
})
