import { slugify } from '../utils/slugify'
import { ContactTypeCategoryEntries } from '../data/model/contactCategories'

type CategoryCheckboxItem = {
  value: string
  text: string
  checked: boolean
}

export type CategorySearchItem = {
  code: string
  displayName: string
  href: string
}

export type CategorySearchGroup = {
  name: string
  items: CategorySearchItem[]
  subcategories: { name: string; items: CategorySearchItem[] }[]
}

export const normaliseSelectedCategories = (value: undefined | string | string[]): string[] => {
  if (!value) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}

export const buildCategoryCheckboxItems = (selectedCategories: string[]): CategoryCheckboxItem[] => {
  const categories = Array.from(new Set(ContactTypeCategoryEntries().map(entry => entry.category))).sort((a, b) =>
    a.localeCompare(b),
  )
  return categories.map(category => ({
    value: category,
    text: category,
    checked: selectedCategories.includes(category),
  }))
}

export const buildSearchResults = (categories: string[], crn: string, enableEnforcementContacts = false) => {
  const entries = ContactTypeCategoryEntries(enableEnforcementContacts).filter(entry =>
    categories.includes(entry.category),
  )
  const grouped = new Map<string, { items: CategorySearchItem[]; subcategories: Map<string, CategorySearchItem[]> }>()

  entries.forEach(entry => {
    if (!grouped.has(entry.category)) {
      grouped.set(entry.category, { items: [], subcategories: new Map() })
    }
    const group = grouped.get(entry.category)!
    const item = {
      code: entry.code,
      displayName: entry.displayName,
      href: `/case/${crn}/contacts/add-${slugify(entry.displayName)}`,
    }
    if (entry.subcategory) {
      if (!group.subcategories.has(entry.subcategory)) {
        group.subcategories.set(entry.subcategory, [])
      }
      group.subcategories.get(entry.subcategory)!.push(item)
    } else {
      group.items.push(item)
    }
  })

  const categoriesSorted: CategorySearchGroup[] = Array.from(grouped.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([name, group]) => ({
      name,
      items: group.items.sort((a, b) => a.displayName.localeCompare(b.displayName)),
      subcategories: Array.from(group.subcategories.entries())
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([subcategoryName, items]) => ({
          name: subcategoryName,
          items: items.sort((a, b) => a.displayName.localeCompare(b.displayName)),
        })),
    }))

  return {
    count: entries.length,
    categories: categoriesSorted,
  }
}

export const buildKeywordSearchResults = (keyword: string, crn: string, enableEnforcementContacts = false) => {
  const lowerKeyword = keyword.toLowerCase()
  const seen = new Set<string>()
  const items = ContactTypeCategoryEntries(enableEnforcementContacts)
    .filter(entry => {
      if (seen.has(entry.code)) return false
      seen.add(entry.code)
      return entry.displayName.toLowerCase().includes(lowerKeyword)
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map(entry => ({
      displayName: entry.displayName,
      href: `/case/${crn}/contacts/add-${slugify(entry.displayName)}`,
    }))

  return { keyword, count: items.length, items }
}
