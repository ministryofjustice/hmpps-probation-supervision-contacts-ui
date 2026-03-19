import { auditService } from '@ministryofjustice/hmpps-audit-client'
import { Response } from 'express'
import { v4 } from 'uuid'

export enum SubjectType {
  CRN = 'CRN',
  USER = 'USER',
}

export enum AuditAction {
  VIEW_ADD_FREQUENTLY_USED_CONTACT = 'VIEW_ADD_FREQUENTLY_USED_CONTACT',
  SELECT_FREQUENTLY_USED_CONTACT_TYPE = 'SELECT_FREQUENTLY_USED_CONTACT_TYPE',
  VIEW_ADD_CONTACT = 'VIEW_ADD_CONTACT',
  ADD_CONTACT = 'ADD_CONTACT',
}

export default async function sendAuditMessage(
  res: Response,
  action: AuditAction,
  subjectId: string,
  subjectType: SubjectType,
) {
  await auditService.sendAuditMessage({
    action,
    who: res.locals.user.username,
    subjectId,
    subjectType,
    correlationId: v4(),
    service: 'hmpps-probation-supervision-contacts-ui',
  })
}
