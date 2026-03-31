export type ContactTypeOption = {
  code: string
  description: string
}

export const ContactTypeOptions: ContactTypeOption[] = [
  { code: 'CM3A', description: 'Email or text from other' },
  { code: 'CM3B', description: 'Email or text to other' },
  { code: 'CMOA', description: 'Email or text from person on probation' },
  { code: 'CMOB', description: 'Email or text to person on probation' },
  { code: 'C326', description: 'Internal communications' },
  { code: 'C202', description: 'Police liaison' },
  { code: 'CT3A', description: 'Telephone contact from other' },
  { code: 'CT3B', description: 'Telephone contact to other' },
  { code: 'CTOA', description: 'Telephone contact from person on probation' },
  { code: 'CTOB', description: 'Telephone contact to person on probation' },
]
