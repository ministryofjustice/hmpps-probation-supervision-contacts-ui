import accessibleAutocomplete from 'accessible-autocomplete'
import Fuse from 'fuse.js'

const setupKeywordSearch = () => {
  const container = document.getElementById('keyword-autocomplete-container')
  if (!container) {
    return
  }

  const suggestions = JSON.parse(container.getAttribute('data-suggestions') || '[]')
  const defaultValue = container.getAttribute('data-default-value') || ''

  const fuse = new Fuse(suggestions, {
    threshold: 0.35,
    includeScore: true,
  })

  function fuzzySearch(query, populateResults) {
    if (!query) {
      populateResults([])
      return
    }
    const results = fuse.search(query)
    populateResults(results.map(r => r.item))
  }

  accessibleAutocomplete({
    element: container,
    id: 'keyword',
    name: 'keyword',
    defaultValue,
    source: fuzzySearch,
    minLength: 2,
    showNoOptionsFound: true,
  })
}

export default setupKeywordSearch
