const setupCategorySearch = () => {
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
  const form = document.getElementById('category-search-form')
  if (!form) {
    return
  }

  const tabsContainer = document.querySelector('[data-active-tab]')
  if (tabsContainer) {
    const activeTab = tabsContainer.getAttribute('data-active-tab')
    if (activeTab === 'search-by-category') {
      const searchTab = document.querySelector('[href="#search-by-category"]')
      if (searchTab) {
        searchTab.click()
      }
    } else if (activeTab === 'search-by-keyword') {
      const keywordTab = document.querySelector('[href="#search-by-keyword"]')
      if (keywordTab) {
        keywordTab.click()
      }
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
}

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.moj-sub-navigation__link')
  const frequentPanel = document.getElementById('frequently-used-contacts')
  const categoryPanel = document.getElementById('search-by-category')
  const keywordPanel = document.getElementById('search-by-keyword')

  const allPanels = [frequentPanel, categoryPanel, keywordPanel].filter(Boolean)

  links.forEach(link => {
    link.addEventListener('click', event => {
      const target = link.getAttribute('href')

      if (target === '#frequently-used-contacts' || target === '#search-by-category' || target === '#search-by-keyword') {
        event.preventDefault()

        allPanels.forEach(panel => panel.classList.add('govuk-tabs__panel--hidden'))
        links.forEach(item => item.removeAttribute('aria-current'))

        const targetPanel = document.getElementById(target.slice(1))
        if (targetPanel) {
          targetPanel.classList.remove('govuk-tabs__panel--hidden')
        }

        link.setAttribute('aria-current', 'page')
      }
    })
  })
})

export default setupCategorySearch
