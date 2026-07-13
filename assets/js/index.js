import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import { DateTime } from 'luxon'
import setupTabsScrollToTop from './tabs-scroll-to-top'
import setupCategorySearch from './category-search'
import setupAddContactGuidance from './add-contact-guidance'
import setupKeywordSearch from './keyword-search'
import './appInsights'

govukFrontend.initAll()
mojFrontend.initAll()

class ServiceAlert {
  constructor() {
    this.dateInput = document.querySelector('.moj-js-datepicker-input')
    this.timeInput = document.querySelector('[data-qa="time"] input')

    this.formatTimeChange = this.formatTimeChange.bind(this)
    this.formatDateChange = this.formatDateChange.bind(this)
  }

  init() {
    if (this.dateInput) {
      this.dateInput.addEventListener('change', this.formatDateChange)
    }
    if (this.timeInput) {
      this.timeInput.addEventListener('change', this.formatTimeChange)
    }
  }

  formatDateChange() {
    this.dateInput.value = standardiseDateValue(this.dateInput.value)
  }

  formatTimeChange() {
    this.timeInput.value = standardiseTimeValue(this.timeInput.value)
  }
}

function standardiseDateValue(dateValue) {
  if (!dateValue) {
    return dateValue
  }
  const separators = ['/', '-', '.', ' ', '_', ':']
  const formats = []
  for (const seperator of separators) {
    formats.push(`d${seperator}M${seperator}yyyy`)
    formats.push(`d${seperator}M${seperator}yy`)
  }
  for (const format of formats) {
    const date = DateTime.fromFormat(dateValue, format)
    if (date.isValid) {
      const newDateValue = date.toFormat('d/M/yyyy')
      return newDateValue
    }
  }
  return dateValue
}

function standardiseTimeValue(timeValue) {
  if (!timeValue) {
    return timeValue
  }
  const separators = [':', '/', '-', '.', ' ', '_']
  const formats = []
  for (const seperator of separators) {
    formats.push(`H${seperator}mm`)
    formats.push(`h${seperator}mma`)
  }
  for (const format of formats) {
    const time = DateTime.fromFormat(timeValue, format)
    if (time.isValid) {
      const newTimeValue = time.toFormat('HH:mm')
      return newTimeValue
    }
  }
  return timeValue
}

setupTabsScrollToTop()
setupCategorySearch()
setupAddContactGuidance()
setupKeywordSearch()
const formatter = new ServiceAlert()
formatter.init()
