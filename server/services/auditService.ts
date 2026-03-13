import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event)
  }
}
