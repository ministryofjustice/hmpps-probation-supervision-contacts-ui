const setupCategorySearch = () => {
  const ndeliusLink = document.querySelector('[data-ndelius-link="true"]')
  if (!ndeliusLink) {
    return
  }

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

export default setupCategorySearch
