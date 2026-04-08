import { buildCategoryCheckboxItems, buildSearchResults, normaliseSelectedCategories } from './contactCategorySearch'

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
})
