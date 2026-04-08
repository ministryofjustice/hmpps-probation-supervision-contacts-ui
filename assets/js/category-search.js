const setupCategorySearch = () => {
  const form = document.getElementById('category-search-form')
  if (!form) {
    return
  }

  const tabsContainer = document.querySelector('[data-active-tab]')
  if (tabsContainer && tabsContainer.getAttribute('data-active-tab') === 'search-by-category') {
    const searchTab = document.querySelector('[href="#search-by-category"]')
    if (searchTab) {
      searchTab.click()
    }
  }

  const clearState = () => {
    const checkboxes = form.querySelectorAll('input[name="categories"][type="checkbox"]')
    checkboxes.forEach(element => {
      const checkbox = element
      checkbox.checked = false
      checkbox.removeAttribute('checked')
    })

    const lastCategories = form.querySelector('input[name="lastCategories"]')
    if (lastCategories) {
      lastCategories.value = ''
    }

    const results = document.querySelector('[data-qa="categorySearchResults"]')
    if (results) {
      results.remove()
    }

    const errorSummary = document.querySelector('[data-qa="errorList"]')
    if (errorSummary) {
      errorSummary.remove()
    }

    form.querySelectorAll('.govuk-error-message').forEach(element => element.remove())
    form
      .querySelectorAll('.govuk-form-group--error')
      .forEach(element => element.classList.remove('govuk-form-group--error'))
  }

  const frequentTab = document.querySelector('[href="#frequently-used-contacts"]')
  if (frequentTab) {
    frequentTab.addEventListener('click', clearState)
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#frequently-used-contacts') {
      clearState()
    }
  })

  const ndeliusLink = document.querySelector('[data-ndelius-link="true"]')
  if (ndeliusLink) {
    const ndeliusUrl = ndeliusLink.getAttribute('href')
    const backUrl = ndeliusLink.getAttribute('data-back-url')

    if (!ndeliusUrl || !backUrl) {
      return
    }

    ndeliusLink.addEventListener('click', event => {
      event.preventDefault()

      const newTab = window.open(ndeliusUrl, '_blank')

      if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
        window.location.href = ndeliusUrl
      } else {
        setTimeout(() => {
          window.location.href = backUrl
        }, 200)
      }
    })
  }
}

export default setupCategorySearch
