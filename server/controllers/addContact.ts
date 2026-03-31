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
      const frequentlyUsedContacts = contactTypes
        .slice()
        .sort((first: any, second: any) => first.description.localeCompare(second.description))
        .map((contact: any) => ({
          text: contact.description,
          href: `/case/${crn}/contacts/add-${slugify(contact.description)}`,
        }))

      if (res.locals.flags?.searchContactsByCategory && req.query?.contactType === 'APPOINTMENT') {
        const uuid = crypto.randomUUID()
        return res.redirect(`${config.manageProbationUrl}/case/${crn}/arrange-appointment/${uuid}/sentence`)
      }
      return res.render('pages/contacts/add-frequently-used-contact', {
        crn,
        radioItems,
        frequentlyUsedContacts,
        csrfToken: res.locals.csrfToken,
        contactLogUrl: `${config.manageProbationUrl}/case/${crn}/activity-log`,
        ndeliusDeepLinkUrl: deliusDeepLinkUrl('ContactList', crn),
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
      const { crn, contactType } = req.params as Record<string, string>
      await sendAuditMessage(res, AuditAction.VIEW_ADD_CONTACT, crn as string, SubjectType.CRN)
      const { username } = res.locals.user
      const overview = await masApiClient.getOverview(crn, username)
      const contactTypes = ContactTypeOptions
      const selectedType = contactTypes.find((c: any) => slugify(c.description) === contactType)
      const hasVisorRegistration = overview?.registrations?.some(r => r.toLowerCase() === 'visor') ?? false
      const isVisor: string | undefined = hasVisorRegistration ? 'SHOW_VISOR' : undefined
      const showResponsibleOfficer: string | undefined = !res.locals.isResponsibleOfficer ? 'SHOW_OFFICER' : undefined
      return res.render('pages/contacts/add-contact-type', {
        crn,
        contactTypeName: selectedType?.description || 'Contact',
        csrfToken: res.locals.csrfToken,
        formValues: {},
        isVisor,
        responsibleOfficer: showResponsibleOfficer,
        responsibleOfficerForename: res.locals.responsibleOfficerForename,
        responsibleOfficerSurname: res.locals.responsibleOfficerSurname,
        sentences: res.locals.sentences,
      })
    }
  },
  postAddContactType: (masApiClient: MasApiClient): RequestHandler => {
    return async (req, res, next) => {
      const { crn } = req.params as Record<string, string>
      await sendAuditMessage(res, AuditAction.ADD_CONTACT, crn, SubjectType.CRN)
      const slug = req.params.contactType as string
      const { username } = res.locals.user
      const { sentence, title, details, sensitivity, visor, alertResponsibleOfficer, date, time } = req.body
      const contactTypes = ContactTypeOptions
      const selectedType = contactTypes.find(c => slugify(c.description) === slug)
      const contactService = new ContactService(masApiClient)
      const userProviders = await masApiClient.getUserProviders(username)
      const staffCode = userProviders.defaultUserDetails?.staffCode || 'UNKNOWN'
      const teamName = userProviders.defaultUserDetails?.team
      const teamCode = userProviders.teams?.find(t => t.description === teamName)?.code || 'UNKNOWN'
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
