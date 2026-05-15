import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import setupFrequentlyUsedContact from './frequently-used-contact'
import setupTabsScrollToTop from './tabs-scroll-to-top'
import setupCategorySearch from './category-search'
import setupAddContactGuidance from './add-contact-guidance'
import setupKeywordSearch from './keyword-search'
import './appInsights'

govukFrontend.initAll()
mojFrontend.initAll()
setupFrequentlyUsedContact()
setupTabsScrollToTop()
setupCategorySearch()
setupAddContactGuidance()
setupKeywordSearch()
