import { FeatureFlags } from '../data/model/featureFlags'
import { slugify } from '../utils/slugify'
import { withBackUrl } from '../utils/backLink'
import { CATEGORY_IDS, Category, ContactTypeCategoryEntries, categoryFromId } from '../data/model/contactCategories'
import { ContactTypeFullDetail } from '../data/model/contactInfo'

type CategoryCheckboxItem = {
  value: number
  text: string
  checked: boolean
}

export type CategorySearchItem = {
  code: string
  displayName: string
  href: string
}

export type CategorySearchGroup = {
  id: number
  name: string
  items: CategorySearchItem[]
  subcategories: { name: string; items: CategorySearchItem[] }[]
}

export const normaliseSelectedCategories = (value: undefined | string | string[]): number[] => {
  if (!value) {
    return []
  }
  const values = Array.isArray(value) ? value : [value]
  return values.map(item => Number(item)).filter(item => Number.isInteger(item))
}

export const buildCategoryCheckboxItems = (
  selectedCategories: number[],
  flags: FeatureFlags = {},
  contactTypes?: ContactTypeFullDetail[],
): CategoryCheckboxItem[] => {
  let categories: Category[]
  if (flags?.enableCheckOutcomes20261124Squad3 && contactTypes) {
    categories = []
    contactTypes.forEach(entry => {
      Object.keys(entry.categories).forEach(key => {
        if (!categories.includes(key as Category)) {
          categories.push(key as Category)
        }
      })
    })
    categories.sort((a, b) => a.localeCompare(b))
  } else {
    categories = Array.from(new Set(ContactTypeCategoryEntries(flags).map(entry => entry.category))).sort((a, b) =>
      a.localeCompare(b),
    )
  }

  return categories.map(category => ({
    value: CATEGORY_IDS[category],
    text: category,
    checked: selectedCategories.includes(CATEGORY_IDS[category]),
  }))
}

export const buildSearchResults = (
  categoryIds: number[],
  crn: string,
  flags: FeatureFlags = {},
  backUrl?: string,
  contactTypes?: ContactTypeFullDetail[],
) => {
  const categories = categoryIds.map(categoryFromId).filter((category): category is Category => !!category)
  const grouped = new Map<string, { items: CategorySearchItem[]; subcategories: Map<string, CategorySearchItem[]> }>()

  let entries
  if (flags?.enableCheckOutcomes20261124Squad3 && contactTypes) {
    entries = contactTypes
    entries.forEach(entry => {
      if (entry.categories) {
        Object.keys(entry.categories).forEach((category: Category) => {
          if (categories.includes(category)) {
            if (!grouped.has(category)) {
              grouped.set(category, { items: [], subcategories: new Map() })
            }
            const group = grouped.get(category)!
            const item = {
              code: entry.code,
              displayName: entry.description,
              href: withBackUrl(`/case/${crn}/contacts/add-${slugify(entry.description)}`, backUrl),
            }
            if (entry.categories[category] !== '') {
              if (!group.subcategories.has(entry.categories[category])) {
                group.subcategories.set(entry.categories[category], [])
              }
              group.subcategories.get(entry.categories[category])!.push(item)
            } else {
              group.items.push(item)
            }
          }
        })
      }
    })
  } else {
    entries = ContactTypeCategoryEntries(flags).filter(entry => categories.includes(entry.category))
    entries.forEach(entry => {
      if (!grouped.has(entry.category)) {
        grouped.set(entry.category, { items: [], subcategories: new Map() })
      }
      const group = grouped.get(entry.category)!
      const item = {
        code: entry.code,
        displayName: entry.displayName,
        href: withBackUrl(`/case/${crn}/contacts/add-${slugify(entry.displayName)}`, backUrl),
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
  }

  const categoriesSorted: CategorySearchGroup[] = Array.from(grouped.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([name, group]) => ({
      id: CATEGORY_IDS[name as Category],
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

export const buildKeywordSearchResults = (
  keyword: string,
  crn: string,
  flags: FeatureFlags = {},
  backUrl?: string,
  contactTypes?: ContactTypeFullDetail[],
) => {
  const lowerKeyword = keyword.toLowerCase()
  const seen = new Set<string>()
  let items
  if (flags?.enableCheckOutcomes20261124Squad3 && contactTypes) {
    items = contactTypes
      .filter(entry => {
        if (seen.has(entry.code)) return false
        seen.add(entry.code)
        return entry.description.toLowerCase().includes(lowerKeyword)
      })
      .sort((a, b) => a.description.localeCompare(b.description))
      .map(entry => ({
        displayName: entry.description,
        href: withBackUrl(`/case/${crn}/contacts/add-${slugify(entry.description)}`, backUrl),
      }))
  } else {
    items = ContactTypeCategoryEntries(flags)
      .filter(entry => {
        if (seen.has(entry.code)) return false
        seen.add(entry.code)
        return entry.displayName.toLowerCase().includes(lowerKeyword)
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
      .map(entry => ({
        displayName: entry.displayName,
        href: withBackUrl(`/case/${crn}/contacts/add-${slugify(entry.displayName)}`, backUrl),
      }))
  }
  return { keyword, count: items.length, items }
}
