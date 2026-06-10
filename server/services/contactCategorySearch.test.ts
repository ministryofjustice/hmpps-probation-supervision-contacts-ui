import {
  buildCategoryCheckboxItems,
  buildKeywordSearchResults,
  buildSearchResults,
  normaliseSelectedCategories,
} from './contactCategorySearch'

const crn = 'X123456'

describe('contactCategorySearch', () => {
  it('normalises selected categories from single values and arrays', () => {
    expect(normaliseSelectedCategories(undefined)).toEqual([])
    expect(normaliseSelectedCategories('Referrals')).toEqual(['Referrals'])
    expect(normaliseSelectedCategories(['Referrals', 'Sentence management'])).toEqual([
      'Referrals',
      'Sentence management',
    ])
  })

  it('builds category checkbox items in alphabetical order', () => {
    const items = buildCategoryCheckboxItems([])

    expect(items.length).toBeGreaterThan(0)
    const labels = items.map(item => item.text)
    const sorted = [...labels].sort((a, b) => a.localeCompare(b))

    expect(labels).toEqual(sorted)
  })

  it('marks selected categories as checked', () => {
    const items = buildCategoryCheckboxItems(['Referrals'])
    const referrals = items.find(item => item.value === 'Referrals')

    expect(referrals?.checked).toBe(true)
  })

  it('includes flagged entries only when enableEnforcementContacts is true', () => {
    const withFlag = buildSearchResults(
      ['Safeguarding and victim liaison', 'Non-compliance and enforcement'],
      crn,
      true,
    )
    const withoutFlag = buildSearchResults(['Safeguarding and victim liaison', 'Non-compliance and enforcement'], crn)

    const allCodes = (r: ReturnType<typeof buildSearchResults>) =>
      r.categories.flatMap(c => [...c.items, ...c.subcategories.flatMap(s => s.items)]).map(i => i.code)

    expect(allCodes(withFlag)).toContain('C280')
    expect(allCodes(withFlag)).toContain('AAM1')
    expect(allCodes(withoutFlag)).not.toContain('C280')
    expect(allCodes(withoutFlag)).not.toContain('AAM1')
    expect(withoutFlag.count).toBe(withFlag.count - 2)
  })

  it('builds grouped search results with sorted headings and items', () => {
    const results = buildSearchResults(
      ['Communication with person on probation', 'Communication and information sharing with others'],
      crn,
    )

    expect(results.count).toBeGreaterThan(0)
    const categoryNames = results.categories.map(category => category.name)
    const categorySorted = [...categoryNames].sort((a, b) => a.localeCompare(b))
    expect(categoryNames).toEqual(categorySorted)

    results.categories.forEach(category => {
      const subcategoryNames = category.subcategories.map(subcategory => subcategory.name)
      const subcategorySorted = [...subcategoryNames].sort((a, b) => a.localeCompare(b))
      expect(subcategoryNames).toEqual(subcategorySorted)

      category.subcategories.forEach(subcategory => {
        const names = subcategory.items.map(item => item.displayName)
        const namesSorted = [...names].sort((a, b) => a.localeCompare(b))
        expect(names).toEqual(namesSorted)
      })

      const directNames = category.items.map(item => item.displayName)
      const directNamesSorted = [...directNames].sort((a, b) => a.localeCompare(b))
      expect(directNames).toEqual(directNamesSorted)
    })
  })

  describe('buildKeywordSearchResults', () => {
    it('returns matching items for a keyword', () => {
      const results = buildKeywordSearchResults('police liaison', crn)

      expect(results.count).toBeGreaterThan(0)
      expect(results.items.some(item => item.displayName === 'Police liaison')).toBe(true)
    })

    it('returns empty results when no items match', () => {
      const results = buildKeywordSearchResults('zzznomatch', crn)

      expect(results.count).toBe(0)
      expect(results.items).toEqual([])
    })

    it('matches case-insensitively', () => {
      const lower = buildKeywordSearchResults('case conference', crn)
      const upper = buildKeywordSearchResults('CASE CONFERENCE', crn)

      expect(lower.count).toBe(upper.count)
      expect(lower.items.map(i => i.displayName)).toEqual(upper.items.map(i => i.displayName))
    })

    it('returns items sorted alphabetically by displayName', () => {
      const results = buildKeywordSearchResults('case', crn)

      expect(results.count).toBeGreaterThan(1)
      const names = results.items.map(i => i.displayName)
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
    })

    it('deduplicates items when the same contact code appears in multiple categories', () => {
      // 'PS recall decision' has code CNPS which appears in 3 different categories
      const results = buildKeywordSearchResults('PS recall decision', crn)

      const displayNames = results.items.map(i => i.displayName)
      const uniqueNames = [...new Set(displayNames)]
      expect(displayNames).toEqual(uniqueNames)
      expect(results.count).toBe(uniqueNames.length)
    })

    it('generates correct href for each result', () => {
      const results = buildKeywordSearchResults('police liaison', crn)

      const policeItem = results.items.find(i => i.displayName === 'Police liaison')
      expect(policeItem?.href).toBe(`/case/${crn}/contacts/add-police-liaison`)
    })

    it('echoes the keyword in the returned object', () => {
      const results = buildKeywordSearchResults('liaison', crn)

      expect(results.keyword).toBe('liaison')
    })

    it('includes flagged entries only when enableEnforcementContacts is true', () => {
      const withFlag = buildKeywordSearchResults('alcohol', crn, true)
      const withoutFlag = buildKeywordSearchResults('alcohol', crn)

      expect(withFlag.items.some(i => i.displayName === 'Alcohol consumption')).toBe(true)
      expect(withoutFlag.items.some(i => i.displayName === 'Alcohol consumption')).toBe(false)
      expect(withoutFlag.count).toBe(0)
    })
  })
})
