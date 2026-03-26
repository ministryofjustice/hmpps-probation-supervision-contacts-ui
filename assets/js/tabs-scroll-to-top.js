const setupTabsScrollToTop = () => {
  const tabs = document.querySelectorAll('[data-scroll-top-on-change="true"] .govuk-tabs__tab')
  if (!tabs.length) {
    return
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', scrollToTop)
  })

  window.addEventListener('hashchange', () => {
    const { hash } = window.location
    const targetId = hash && hash.length > 1 ? hash.slice(1) : ''
    if (!targetId) {
      return
    }
    const target = document.getElementById(targetId)
    if (target && target.closest('[data-scroll-top-on-change="true"]')) {
      scrollToTop()
    }
  })
}

export default setupTabsScrollToTop
