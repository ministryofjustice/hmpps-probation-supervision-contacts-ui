import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import { slugify } from '../utils/slugify'
import { deliusDeepLinkUrl } from '../utils/deliusDeepLinkUrl'
import { formattedDate } from '../utils/formattedDate'
import { CreateContactRequest } from '../data/model/contacts'
import ContactService from '../services/contactService'
import config from '../config'
import sendAuditMessage, { AuditAction, SubjectType } from '../middleware/sendAuditMessage'
import { ContactTypeOptions } from '../data/model/contactTypes'
import {
  buildCategoryCheckboxItems,
  buildKeywordSearchResults,
  buildSearchResults,
  normaliseSelectedCategories,
} from '../services/contactCategorySearch'
import { buildAddContactViewModel } from '../services/addContactViewModel'
import { isBlank } from '../utils/isBlank'
import logger from '../../logger'

const allContactTypeNamesJson = JSON.stringify(ContactTypeOptions.map(t => t.description))

const getStringValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

const buildFrequentlyUsedContacts = (contactTypes: any[], crn: string) =>
  contactTypes
    .slice()
    .sort((first: any, second: any) => first.description.localeCompare(second.description))
    .map((contact: any) => ({
      text: contact.description,
      href: `/case/${crn}/contacts/add-${slugify(contact.description)}`,
    }))

const addContactController = {
  getFrequentlyUsedContact: (): RequestHandler => {
    return async (req, res, next) => {
      const { crn } = req.params as Record<string, string>
      const referer = req.get('referer') || ''
      const cameFromStepTwo = req.query.from === 'step2' || referer.includes(`/case/${crn}/contacts/add-`)

      await sendAuditMessage(res, AuditAction.VIEW_ADD_FREQUENTLY_USED_CONTACT, crn as string, SubjectType.CRN)
      const session = req.session as any
      session.data ||= {}
      session.data.contactType ||= {}
      if (!cameFromStepTwo) {
        delete session.data.contactType[crn]
      }

      const selectedContactType = session.data?.contactType?.[crn]
      const baseRadioItems = res.locals.radioItems || []
      const radioItems = baseRadioItems.map((item: any) => ({
        ...item,
        ...(item.value === selectedContactType ? { checked: true } : {}),
      }))
      const contactTypes = Array.isArray(res.locals.contactTypes) ? res.locals.contactTypes : []
      const frequentlyUsedContacts = buildFrequentlyUsedContacts(contactTypes, crn)

      if (res.locals.flags?.searchContactsByCategory && req.query?.contactType === 'APPOINTMENT') {
        const uuid = crypto.randomUUID()
        return res.redirect(`${config.manageProbationUrl}/case/${crn}/arrange-appointment/${uuid}/sentence`)
      }
      return res.render('pages/contacts/add-frequently-used-contact', {
        crn,
        radioItems,
        frequentlyUsedContacts,
        categoryCheckboxItems: buildCategoryCheckboxItems([]),
        selectedCategories: [],
        searchResults: null,
        searchByCategoryTabActive: false,
        contactTypeNamesJson: allContactTypeNamesJson,
        lastCategories: '',
        csrfToken: res.locals.csrfToken,
        contactLogUrl: `${config.manageProbationUrl}/case/${crn}/activity-log`,
        ndeliusDeepLinkUrl: deliusDeepLinkUrl('ContactList', crn),
      })
    }
  },
  getSearchByCategory: (): RequestHandler => {
    return async (req, res, next) => {
      const { crn } = req.params as Record<string, string>
      const selectedCategories = normaliseSelectedCategories(req.query?.categories as string | string[])
      const lastCategories = normaliseSelectedCategories(
        typeof req.query?.lastCategories === 'string' && req.query.lastCategories.length
          ? req.query.lastCategories
              .split(',')
              .map((value: string) => value.trim())
              .filter(Boolean)
          : [],
      )
      const action = req.query?.action

      const contactTypes = Array.isArray(res.locals.contactTypes) ? res.locals.contactTypes : []
      const frequentlyUsedContacts = buildFrequentlyUsedContacts(contactTypes, crn)

      const baseLocals = {
        crn,
        frequentlyUsedContacts,
        categoryCheckboxItems: buildCategoryCheckboxItems([]),
        selectedCategories: [] as string[],
        searchResults: null as ReturnType<typeof buildSearchResults> | null,
        searchByCategoryTabActive: true,
        lastCategories: '',
        csrfToken: res.locals.csrfToken,
        contactLogUrl: `${config.manageProbationUrl}/case/${crn}/activity-log`,
        ndeliusDeepLinkUrl: deliusDeepLinkUrl('ContactList', crn),
      }

      if (!action || action === 'clear') {
        return res.render('pages/contacts/add-frequently-used-contact', baseLocals)
      }

      if (!selectedCategories.length) {
        return res.render('pages/contacts/add-frequently-used-contact', {
          ...baseLocals,
          errorMessages: { categories: 'Select a category' },
          lastCategories: lastCategories.join(','),
        })
      }

      const searchResults = buildSearchResults(selectedCategories, crn)
      return res.render('pages/contacts/add-frequently-used-contact', {
        crn,
        frequentlyUsedContacts,
        categoryCheckboxItems: buildCategoryCheckboxItems(selectedCategories),
        selectedCategories,
        searchResults,
        searchByCategoryTabActive: true,
        lastCategories: selectedCategories.join(','),
        csrfToken: res.locals.csrfToken,
        contactLogUrl: `${config.manageProbationUrl}/case/${crn}/activity-log`,
        ndeliusDeepLinkUrl: deliusDeepLinkUrl('ContactList', crn),
      })
    }
  },
  getSearchByKeyword: (): RequestHandler => {
    return async (req, res, next) => {
      const { crn } = req.params as Record<string, string>
      const keyword = typeof req.query?.keyword === 'string' ? req.query.keyword : ''
      const action = req.query?.action

      const contactTypes = Array.isArray(res.locals.contactTypes) ? res.locals.contactTypes : []
      const frequentlyUsedContacts = buildFrequentlyUsedContacts(contactTypes, crn)

      const baseLocals = {
        crn,
        frequentlyUsedContacts,
        categoryCheckboxItems: buildCategoryCheckboxItems([]),
        searchByCategoryTabActive: false,
        searchByKeywordTabActive: true,
        keywordSearch: keyword,
        keywordSearchResults: null as ReturnType<typeof buildKeywordSearchResults> | null,
        contactTypeNamesJson: allContactTypeNamesJson,
        lastCategories: '',
        csrfToken: res.locals.csrfToken,
        contactLogUrl: `${config.manageProbationUrl}/case/${crn}/activity-log`,
        ndeliusDeepLinkUrl: deliusDeepLinkUrl('ContactList', crn),
      }

      if (!action) {
        return res.render('pages/contacts/add-frequently-used-contact', baseLocals)
      }

      if (isBlank(keyword)) {
        return res.render('pages/contacts/add-frequently-used-contact', {
          ...baseLocals,
          errorMessages: { keyword: 'Enter a keyword or phrase' },
        })
      }

      if (/[^a-zA-Z0-9\- ]/.test(keyword)) {
        return res.render('pages/contacts/add-frequently-used-contact', {
          ...baseLocals,
          errorMessages: { keyword: 'You can only search using letters, numbers, hyphens or dashes' },
        })
      }

      return res.render('pages/contacts/add-frequently-used-contact', {
        ...baseLocals,
        keywordSearchResults: buildKeywordSearchResults(keyword, crn),
      })
    }
  },
  postFrequentlyUsedContact: (masApiClient: MasApiClient): RequestHandler => {
    return async (req, res, next) => {
      const { crn } = req.params as Record<string, string>
      await sendAuditMessage(res, AuditAction.SELECT_FREQUENTLY_USED_CONTACT_TYPE, crn as string, SubjectType.CRN)
      const { contactType } = req.body
      const session = req.session as any
      const sessionData = session.data || {}

      session.data = {
        ...sessionData,
        contactType: {
          ...(sessionData.contactType || {}),
          [crn]: contactType,
        },
      }

      if (contactType === 'APPOINTMENT') {
        const uuid = crypto.randomUUID()
        return res.redirect(`${config.manageProbationUrl}/case/${crn}/arrange-appointment/${uuid}/sentence`)
      }

      const contactTypes = ContactTypeOptions
      const selected = contactTypes.find((c: any) => c.code === contactType)
      const slug = selected ? slugify(selected.description) : contactType

      return res.redirect(`/case/${crn}/contacts/add-${slug}`)
    }
  },
  getAddContactType: (masApiClient: MasApiClient): RequestHandler => {
    return async (req, res, next) => {
      const crn = getStringValue(req.params?.crn)
      const contactType = getStringValue(req.params?.contactType)

      await sendAuditMessage(res, AuditAction.VIEW_ADD_CONTACT, crn, SubjectType.CRN)
      const { username } = res.locals.user
      const overview = await masApiClient.getOverview(crn, username)
      const hasVisorRegistration = overview?.registrations?.some(r => r.toLowerCase() === 'visor') ?? false
      const isVisor: string | undefined = hasVisorRegistration ? 'SHOW_VISOR' : undefined
      const showResponsibleOfficer: string | undefined = !res.locals.isResponsibleOfficer ? 'SHOW_OFFICER' : undefined
      const headerName = res.locals.headerPersonName
      const personName = `${headerName?.forename || ''} ${headerName?.surname || ''}`.trim()
      const viewModel = buildAddContactViewModel({
        crn,
        slug: contactType,
        sentences: res.locals.sentences || [],
        personName,
        formValues: {},
        isVisor,
        responsibleOfficer: showResponsibleOfficer,
        responsibleOfficerForename: getStringValue(res.locals.responsibleOfficerForename),
        responsibleOfficerSurname: getStringValue(res.locals.responsibleOfficerSurname),
        csrfToken: getStringValue(res.locals.csrfToken),
      })
      return res.render('pages/contacts/add-contact-type', viewModel)
    }
  },
  postAddContactType: (masApiClient: MasApiClient): RequestHandler => {
    return async (req, res, next) => {
      const { crn } = req.params as Record<string, string>
      await sendAuditMessage(res, AuditAction.ADD_CONTACT, crn, SubjectType.CRN)
      const slug = req.params.contactType as string
      const { username } = res.locals.user
      const sentence = getStringValue(req.body?.sentence)
      const title = getStringValue(req.body?.title)
      const details = getStringValue(req.body?.details)
      const sensitivity = getStringValue(req.body?.sensitivity)
      const visor = getStringValue(req.body?.visor)
      const alertResponsibleOfficer = getStringValue(req.body?.alertResponsibleOfficer)
      const date = getStringValue(req.body?.date)
      const time = getStringValue(req.body?.time)
      const outcomeCode = getStringValue(req.body?.outcomeCode)
      const contactTypes = ContactTypeOptions
      const selectedType = contactTypes.find(c => slugify(c.description) === slug)
      const contactService = new ContactService(masApiClient)
      const pp = await masApiClient.getProbationPractitioner(crn, username)

      const staffCode = pp?.code || 'UNKNOWN'
      const teamCode = pp?.team?.code || 'UNKNOWN'
      const eventId = sentence === 'PERSON_LEVEL_CONTACT' ? null : Number(sentence)
      const payload: CreateContactRequest = {
        date: formattedDate(date),
        time,
        staffCode,
        teamCode,
        type: selectedType?.code || slug,
        eventId,
        requirementId: null,
        description: title || undefined,
        notes: details || '',
        outcomeCode: outcomeCode || undefined,
        alert: alertResponsibleOfficer === 'Yes',
        sensitive: sensitivity === 'Yes',
        visorReport: visor === 'Yes',
      }
      const { id: contactId } = await contactService.createContact(crn, payload, username)

      if (req.file) {
        try {
          await contactService.patchDocuments(crn, contactId.toString(), req.file, username)
          return res.redirect(`${config.manageProbationUrl}/case/${crn}/activity-log?showSuccessBanner=true`)
        } catch {
          return res.redirect(
            `${config.manageProbationUrl}/case/${crn}/activity-log?showSuccessBanner=true&uploadFailed=true`,
          )
        }
      }

      return res.redirect(`${config.manageProbationUrl}/case/${crn}/activity-log?showSuccessBanner=true`)
    }
  },
}

export default addContactController
