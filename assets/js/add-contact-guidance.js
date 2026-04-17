const setupAddContactGuidance = () => {
  const buttons = Array.from(document.querySelectorAll('[data-qa="add-guidance-button"]'))
  if (!buttons.length) {
    return
  }

  const detailsField = document.getElementById('details')
  if (!detailsField) {
    return
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const guidanceText = button.getAttribute('data-guidance-text') || ''
      if (!guidanceText) {
        return
      }
      const currentValue = detailsField.value.trim()
      detailsField.value = currentValue ? `${currentValue}\n\n${guidanceText}` : guidanceText
      detailsField.focus()
    })
  })
}

export default setupAddContactGuidance
