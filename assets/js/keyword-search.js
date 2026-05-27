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
    keys: ['text'],
    threshold: 0.35,
    includeScore: true,
  })

  function fuzzySearch(query, populateResults) {
    if (!query) {
      populateResults([])
      return
    }
    const results = fuse.search(query)
    populateResults(results.map(r => r.item).sort((a, b) => a.text.localeCompare(b.text)))
  }

  accessibleAutocomplete({
    element: container,
    id: 'keyword',
    name: 'keyword',
    defaultValue,
    source: fuzzySearch,
    minLength: 1,
    showNoOptionsFound: true,
    templates: {
      inputValue: item => {
        if (!item) return ''
        return typeof item === 'string' ? item : item.text
      },
      suggestion: item => {
        if (!item) return ''
        return typeof item === 'string' ? item : item.text
      },
    },
    onConfirm: item => {
      if (item && item.href) {
        window.location.href = item.href
      }
    },
  })
}

export default setupKeywordSearch
