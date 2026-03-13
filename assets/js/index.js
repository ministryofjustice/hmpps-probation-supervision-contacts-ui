import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'
import setupFrequentlyUsedContact from './frequently-used-contact'

govukFrontend.initAll()
mojFrontend.initAll()
setupFrequentlyUsedContact()
