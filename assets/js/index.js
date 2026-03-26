import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import setupFrequentlyUsedContact from './frequently-used-contact'
import setupTabsScrollToTop from './tabs-scroll-to-top'

govukFrontend.initAll()
mojFrontend.initAll()
setupFrequentlyUsedContact()
setupTabsScrollToTop()
