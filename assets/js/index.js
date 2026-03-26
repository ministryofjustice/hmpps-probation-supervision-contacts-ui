import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import setupFrequentlyUsedContact from './frequently-used-contact'

govukFrontend.initAll()
mojFrontend.initAll()
setupFrequentlyUsedContact()

const tabsScrollToTop = () => {
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
    const targetId = window.location.hash?.slice(1)
    if (!targetId) {
      return
    }
    const target = document.getElementById(targetId)
    if (target && target.closest('[data-scroll-top-on-change="true"]')) {
      scrollToTop()
    }
  })
}

tabsScrollToTop()
