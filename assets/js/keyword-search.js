import accessibleAutocomplete from 'accessible-autocomplete'
import Fuse from 'fuse.js'

const setupKeywordSearch = () => {
  const container = document.getElementById('keyword-autocomplete-container')
  if (!container) {
    return
  }

  const fallback = document.getElementById('keyword-fallback')
  if (fallback) {
    fallback.disabled = true
    fallback.hidden = true
  }

  const hint = document.getElementById('keyword-hint')
  if (hint) {
    hint.textContent =
      'For example email, safeguarding or CMS. You can select an answer as it appears or click the search icon to see a list of results.'
  }

  container.style.display = ''

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
