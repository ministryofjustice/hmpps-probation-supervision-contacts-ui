import type { RequestHandler } from 'express'
import MasApiClient from '../data/masApiClient'
import { getFrequentContactTypes } from '../middleware/getFrequentlyUsedContactTypes'
import { slugify } from '../utils/slugify'
import { deliusDeepLinkUrl } from '../utils/deliusDeepLinkUrl'
import { formattedDate } from '../utils/formattedDate'
import { CreateContactRequest } from '../data/model/contacts'
import ContactService from '../services/contactService'
import config from '../config'

const addContactController = {
  getFrequentlyUsedContact: (masApiClient: MasApiClient): RequestHandler => {
    return async (req, res) => {
      const { crn } = req.params
      return res.render('pages/contacts/add-frequently-used-contact', {
        crn,
        radioItems: res.locals.radioItems,
        csrfToken: res.locals.csrfToken,
        contactLogUrl: `${config.manageProbationUrl}/case/${crn}/activity-log`,
        ndeliusDeepLinkUrl: deliusDeepLinkUrl('ContactList', crn as string),
      })
    }
  },
  postFrequentlyUsedContact: (masApiClient: MasApiClient): RequestHandler => {
    return async (req, res) => {
      const { crn } = req.params
      const { contactType } = req.body

      if (contactType === 'APPOINTMENT') {
        const uuid = crypto.randomUUID()
        return res.redirect(`${config.manageProbationUrl}/case/${crn}/arrange-appointment/${uuid}/sentence`)
      }

      const contactTypes = await getFrequentContactTypes(req, masApiClient, res.locals.user.username)
      const selected = contactTypes.find((c: any) => c.code === contactType)
      const slug = selected ? slugify(selected.description) : contactType
      return res.redirect(`/case/${crn}/contacts/add-${slug}`)
    }
  },
  getAddContactType: (masApiClient: MasApiClient): RequestHandler => {
    return async (req, res) => {
      const { crn, contactType } = req.params
      const { username } = res.locals.user
      const contactTypes = await getFrequentContactTypes(req, masApiClient, username)
      const selectedType = contactTypes.find((c: any) => slugify(c.description) === contactType)
      const isVisor: string | undefined = undefined // TODO: check risk flags for ViSOR
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
    return async (req, res) => {
      const crn = req.params.crn as string
      const slug = req.params.contactType as string
      const { username } = res.locals.user
      const { sentence, title, details, sensitivity, visor, alertResponsibleOfficer, date, time } = req.body
      const contactTypes = await getFrequentContactTypes(req, masApiClient, username)
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
