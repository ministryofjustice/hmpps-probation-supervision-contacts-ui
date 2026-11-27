import { Category } from './contactCategories'
import { FeatureFlags } from './featureFlags'

export type ContactRelatesTo = 'Person' | 'Pre-CJA Events' | 'CJA/ORA Events'
export type ContactOutcome = {
  label: string
  value: string
  systemLabel: string
}
export type ContactTypeDetails = {
  [code: string]: ContactTypeFullDetail
}
export type Categories = {
  [category in Category]?: string
}
export type ContactOutcomes = {
  [code: string]: ContactOutcome
}
export type ContactTypeFullDetail = {
  code: string
  description: string
  sensitive: boolean
  categories: Categories
  relatesTo: ContactRelatesTo[]
  defaultHeading?: string
  guidance?: string
  mandatoryOutcome?: boolean
  outcomes?: ContactOutcomes
  showOutcomeBanner?: boolean
  isFrequentlyUsed?: boolean
}

export const ContactTypeInfo = (flags: FeatureFlags = {}): ContactTypeDetails => {
  return {
    CCON: {
      code: 'CCON',
      description: 'Case conference',
      categories: {
        'Case management and meetings': 'Case meetings',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    RRPCC1: {
      code: 'RRPCC1',
      description: 'Case consultation',
      categories: {
        'Case management and meetings': 'Case meetings',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C238: {
      code: 'C238',
      description: 'Case discussion',
      categories: {
        'Case management and meetings': 'Case meetings',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CSPO: {
      code: 'CSPO',
      description: 'Consultation with manager',
      categories: {
        'Case management and meetings': 'Case meetings',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    NSD1: {
      code: 'NSD1',
      description: 'Core group meeting',
      categories: {
        'Case management and meetings': 'Case meetings',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMS40: {
      code: 'CMS40',
      description: 'CMS - assistance with assessments',
      categories: {
        'Case management and meetings': 'Case management support',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMS41: {
      code: 'CMS41',
      description: 'CMS - assistance with case conferencing',
      categories: {
        'Case management and meetings': 'Case management support',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMS42: {
      code: 'CMS42',
      description: 'CMS - attending partnership meetings',
      categories: {
        'Case management and meetings': 'Case management support',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMS43: {
      code: 'CMS43',
      description: 'CMS - case related communication',
      categories: {
        'Case management and meetings': 'Case management support',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMS44: {
      code: 'CMS44',
      description: 'CMS - completing and assisting with referrals',
      categories: {
        'Case management and meetings': 'Case management support',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMS45: {
      code: 'CMS45',
      description: 'CMS - court liaison and applications to court',
      categories: {
        'Case management and meetings': 'Case management support',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMS47: {
      code: 'CMS47',
      description: 'CMS - home and prison visits',
      categories: {
        'Case management and meetings': 'Case management support',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMS48: {
      code: 'CMS48',
      description: 'CMS - information and intelligence gathering',
      categories: {
        'Case management and meetings': 'Case management support',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMS49: {
      code: 'CMS49',
      description: 'CMS - ROTL assessments and support',
      categories: {
        'Case management and meetings': 'Case management support',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMS50: {
      code: 'CMS50',
      description: 'CMS - sentence plan intervention delivery',
      categories: {
        'Case management and meetings': 'Case management support',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    C053: {
      code: 'C053',
      description: 'Case decisions',
      categories: {
        'Case management and meetings': 'Case management',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        CO11: {
          label: 'Contact frequency',
          value: 'CO11',
          systemLabel: 'Contact Frequency',
        },
        CO14: {
          label: 'OASys/Assessment',
          value: 'CO14',
          systemLabel: 'OASys/Assessment',
        },
        CO15: {
          label: 'Other - see notes',
          value: 'CO15',
          systemLabel: 'Other - see Notes',
        },
        CO12: {
          label: 'Referral or other agency contact',
          value: 'CO12',
          systemLabel: 'Referral/Other Agency Contact',
        },
        CO13: {
          label: 'Significant event',
          value: 'CO13',
          systemLabel: 'Significant Event',
        },
      },
    },
    CRCO: {
      code: 'CRCO',
      description: 'Case reviewed by case manager',
      categories: {
        'Case management and meetings': 'Case management',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    C201: {
      code: 'C201',
      description: 'Comment',
      categories: {
        'Case management and meetings': 'Case management',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C333: {
      code: 'C333',
      description: 'Interpreter requested or confirmed',
      categories: {
        'Case management and meetings': 'Case management',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    C256: {
      code: 'C256',
      description: 'Order or licence received',
      categories: {
        'Case management and meetings': 'Case management',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CNPS: {
      code: 'CNPS',
      description: 'PS recall decision',
      categories: {
        'Case management and meetings': 'Case management',
        'Non-compliance and enforcement': '',
        'Sentence management': '',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        RRDD: {
          label: 'Recommendation declined',
          value: 'RRDD',
          systemLabel: 'Recommendation Declined',
        },
        RRDE: {
          label: 'Recommendation endorsed',
          value: 'RRDE',
          systemLabel: 'Recommendation Endorsed',
        },
      },
    },
    MO1: {
      code: 'MO1',
      description: 'Management oversight',
      categories: {
        'Case management and meetings': 'Management oversight',
      },
      sensitive: false,
      relatesTo: ['Person'],
      mandatoryOutcome: true,
      outcomes: {
        MO13: {
          label: 'Home visit delayed',
          value: 'MO13',
          systemLabel: 'Delay of home visit',
        },
        MO1: {
          label: 'Follow-up action required',
          value: 'MO1',
          systemLabel: 'Follow-up Action Required',
        },
        MO28: {
          label: 'Follow-up action completed',
          value: 'MO28',
          systemLabel: 'Follow-up Action Completed',
        },
        MO12: {
          label: 'Home visit not carried out',
          value: 'MO12',
          systemLabel: 'Home Visit Not Undertaken',
        },
        MO3: {
          label: 'Management oversight decision',
          value: 'MO3',
          systemLabel: 'Management Oversight Decision',
        },
        MO27: {
          label: 'Probation practitioner recommendation endorsed',
          value: 'MO27',
          systemLabel: 'PP recommendation endorsed',
        },
      },
    },
    MO8: {
      code: 'MO8',
      description: 'Management oversight – home visit risk assessment',
      categories: {
        'Case management and meetings': 'Management oversight',
      },
      sensitive: false,
      relatesTo: ['Person'],
      defaultHeading:
        'TO BE COMPLETED BY PP:\n- Specify RoSH level and nature of any risk to probation staff\n- Any known or relevant information regarding the address or area\n- Name of probation practitioner(s) undertaking visit\n- Specify type of visit (initial or repeat)\n- Duration of home visit (minutes)\n\nNOTE:\nWhere home visit is approved, all of the following must be completed.\n- Office home visit itinerary diary is completed, and car registration recorded\n- Personal safety device will be used\n- Nominated contact point will be contacted immediately before the visit to provide the estimated length of visit, and upon completion of visit\n- Mobile phone will be carried at all times\n- Individual has been advised to secure any pets, where required\n\nA further Management Oversight – HVRA entry is only required where there has been a significant change in circumstance or risk level which impacts safe facilitation of a home visit.\n\nTO BE COMPLETED BY SPO:\n- SPO rationale for decision',
      mandatoryOutcome: false,
      showOutcomeBanner: true,
      outcomes: {
        MO26: {
          label: 'Home visit - referred for SPO decision',
          value: 'MO26',
          systemLabel: 'Home Visit - Referred for SPO Decision',
        },
        MO23: {
          label: 'Home visit approved',
          value: 'MO23',
          systemLabel: 'Home Visit Approved',
        },
        MO25: {
          label: 'Home visit exempted',
          value: 'MO25',
          systemLabel: 'Home Visit Exempted',
        },
        MO24: {
          label: 'Home visit not approved',
          value: 'MO24',
          systemLabel: 'Home Visit Not Approved',
        },
      },
    },
    C326: {
      code: 'C326',
      description: 'Internal communications',
      isFrequentlyUsed: true,
      categories: {
        'Communication and information sharing with others': '',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CRTUP4: {
      code: 'CRTUP4',
      description: 'Assistance at court - court query',
      categories: {
        'Communication and information sharing with others': 'Courts',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CRTUP: {
      code: 'CRTUP',
      description: 'Assistance to court – update from probation practitioner',
      categories: {
        'Communication and information sharing with others': 'Courts',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C016: {
      code: 'C016',
      description: 'CPS received',
      categories: {
        'Communication and information sharing with others': 'Courts',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    C294: {
      code: 'C294',
      description: 'Information from court team',
      categories: {
        'Communication and information sharing with others': 'Courts',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C063: {
      code: 'C063',
      description: 'Contact with electronic monitoring provider',
      categories: {
        'Communication and information sharing with others': 'Electronic monitoring',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    INFFES: {
      code: 'INFFES',
      description: 'Information from EMS provider',
      categories: {
        'Communication and information sharing with others': 'Electronic monitoring',
      },
      sensitive: false,
      relatesTo: ['Person', 'CJA/ORA Events'],
    },
    INFTES: {
      code: 'INFTES',
      description: 'Information to EMS provider',
      categories: {
        'Communication and information sharing with others': 'Electronic monitoring',
      },
      sensitive: false,
      relatesTo: ['Person', 'CJA/ORA Events'],
    },
    RTEMS: {
      code: 'RTEMS',
      description: 'Risk notification to EMS provider',
      categories: {
        'Communication and information sharing with others': 'Electronic monitoring',
      },
      sensitive: false,
      relatesTo: ['Person'],
    },
    CM3A: {
      code: 'CM3A',
      description: 'Email or text from other',
      isFrequentlyUsed: true,
      categories: {
        'Communication and information sharing with others': 'External communications',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CM3B: {
      code: 'CM3B',
      description: 'Email or text to other',
      isFrequentlyUsed: true,
      categories: {
        'Communication and information sharing with others': 'External communications',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C203: {
      code: 'C203',
      description: 'Health and social service liaison',
      categories: {
        'Communication and information sharing with others': 'External communications',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CL3A: {
      code: 'CL3A',
      description: 'Letter or fax from other',
      categories: {
        'Communication and information sharing with others': 'External communications',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CL3B: {
      code: 'CL3B',
      description: 'Letter or fax to other',
      categories: {
        'Communication and information sharing with others': 'External communications',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CLDR: {
      code: 'CLDR',
      description: 'Liaison with drug treatment provider',
      categories: {
        'Communication and information sharing with others': 'External communications',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CT3A: {
      code: 'CT3A',
      description: 'Telephone contact from other',
      isFrequentlyUsed: true,
      categories: {
        'Communication and information sharing with others': 'External communications',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CT3B: {
      code: 'CT3B',
      description: 'Telephone contact to other',
      isFrequentlyUsed: true,
      categories: {
        'Communication and information sharing with others': 'External communications',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C344: {
      code: 'C344',
      description: 'Gang member information sharing',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: true,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      defaultHeading:
        'Before saving please check the "Sensitive" flag - these contacts should normally be marked as sensitive.',
    },
    CIZZ: {
      code: 'CIZZ',
      description: 'Information - other',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CIEA: {
      code: 'CIEA',
      description: 'Information from external agency',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CI3A: {
      code: 'CI3A',
      description: 'Information from third party',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C325: {
      code: 'C325',
      description: 'Information or documents requested',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CIEB: {
      code: 'CIEB',
      description: 'Information to external agency',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CI3B: {
      code: 'CI3B',
      description: 'Information to third party',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    IRP2: {
      code: 'IRP2',
      description: 'IPP progression panel',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
        'Sentence management': '',
      },
      sensitive: false,
      relatesTo: ['Person'],
      mandatoryOutcome: true,
      outcomes: {
        PNL15: {
          label: 'Community - amber RAG progression review',
          value: 'PNL15',
          systemLabel: 'Community Amber-RAG Progression Review',
        },
        PNL22: {
          label: 'Consideration of terminating licence',
          value: 'PNL22',
          systemLabel: 'Consideration of Licence Termination',
        },
        PNL21: {
          label: 'Consideration of recall',
          value: 'PNL21',
          systemLabel: 'Consideration of Recall',
        },
        PNL14: {
          label: 'Consideration of reducing supervision frequency',
          value: 'PNL14',
          systemLabel: 'Consideration of Reducing Supervision Frequency',
        },
        PNL23: {
          label: 'Consideration of reimposing supervision',
          value: 'PNL23',
          systemLabel: 'Consideration of Supervision Reimposition',
        },
        PNL13: {
          label: 'Consideration of suspending supervision',
          value: 'PNL13',
          systemLabel: 'Consideration of Supervision Suspension',
        },
        PNL20: {
          label: 'Escalation of risk in community',
          value: 'PNL20',
          systemLabel: 'Escalation of Risk in Community',
        },
        PNL18: {
          label: 'Following a negative parole outcome',
          value: 'PNL18',
          systemLabel: 'Following Negative Parole Outcome',
        },
        PNL16: {
          label: 'Following recall',
          value: 'PNL16',
          systemLabel: 'Following Recall',
        },
        PNL17: {
          label: 'Following recategorisation',
          value: 'PNL17',
          systemLabel: 'Following Recategorisation',
        },
        PNL12: {
          label: 'Following remission from secure hospital',
          value: 'PNL12',
          systemLabel: 'Following Remission from Secure Hospital',
        },
        PNL19: {
          label: 'Initial panel following release',
          value: 'PNL19',
          systemLabel: 'Initial Panel Following Release',
        },
        PNL02: {
          label: 'Panel not held',
          value: 'PNL02',
          systemLabel: 'Panel Not Held',
        },
        PNL11: {
          label: 'Prison - amber RAG progression review',
          value: 'PNL11',
          systemLabel: 'Prison Amber-RAG Progression Review',
        },
        PNL10: {
          label: 'Prison - red RAG progression review',
          value: 'PNL10',
          systemLabel: 'Prison Red-RAG Progression Review',
        },
      },
    },
    LRP1: {
      code: 'LRP1',
      description: 'Lifer review panel',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
        'Sentence management': '',
      },
      sensitive: true,
      relatesTo: ['Person'],
    },
    C395: {
      code: 'C395',
      description: 'Parole hearing - notification of outcome',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
        'Sentence management': '',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    DPRE: {
      code: 'DPRE',
      description: 'Pre-cons received',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C187: {
      code: 'C187',
      description: 'Pre-cons requested',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    PREVENT: {
      code: 'PREVENT',
      description: 'Prevent activity',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: true,
      relatesTo: ['Person'],
    },
    CRFI: {
      code: 'CRFI',
      description: 'Request for information',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CNDC: {
      code: 'CNDC',
      description: 'Sensitive information contact',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      defaultHeading:
        'Before saving please check the "Sensitive" flag - these contacts should normally be marked as sensitive.',
    },
    VINC: {
      code: 'VINC',
      description: 'ViSOR information contact',
      categories: {
        'Communication and information sharing with others': 'Information sharing and requests',
        'Safeguarding and victim liaison': '',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      defaultHeading:
        'For adding information to be included in the set of data to be copied to ViSOR. Please ensure that the "Include in ViSOR Extract" field is set to "Yes" when the contact is first saved or this will not be picked up by the ViSOR team. If the contact does not have an "Include in ViSOR Extract" field please add the ViSOR register for this Offender Record.',
      guidance:
        "If you want the information to be copied to ViSOR, you must select 'Yes' to the question 'Include contact in ViSOR report?' when the contact is first created. If you don't, the ViSOR team won't pick it up. If the contact does not have the 'Include contact in ViSOR report?' question, you should add the ViSOR register to this person on probation's record.",
    },
    CDHC: {
      code: 'CDHC',
      description: 'HDC - correspondence or communication',
      categories: {
        'Communication and information sharing with others': 'Home detention curfew (HDC)',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    C399: {
      code: 'C399',
      description: 'QA - HDC2 and 3/PD1 received',
      categories: {
        'Communication and information sharing with others': 'Home detention curfew (HDC)',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    C401: {
      code: 'C401',
      description: 'QA - HDC3/PD1 returned to prison',
      categories: {
        'Communication and information sharing with others': 'Home detention curfew (HDC)',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CARR: {
      code: 'CARR',
      description: 'Arrest incident',
      categories: {
        'Communication and information sharing with others': 'Police',
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'MARAC',
        'Non-compliance and enforcement': '',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: false,
      showOutcomeBanner: true,
      outcomes: {
        CO29: {
          label: 'Risk review',
          value: 'CO29',
          systemLabel: 'Risk Review',
        },
      },
    },
    C369: {
      code: 'C369',
      description: 'Police intelligence enquiries - requested',
      categories: {
        'Communication and information sharing with others': 'Police',
      },
      sensitive: true,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: false,
      showOutcomeBanner: true,
      outcomes: {
        PIDA: {
          label: 'Domestic abuse',
          value: 'PIDA',
          systemLabel: 'Domestic Abuse',
        },
        PIDO: {
          label: 'Domestic abuse and other check',
          value: 'PIDO',
          systemLabel: 'Domestic Abuse and Other Check',
        },
        PICO: {
          label: 'Other check (not domestic abuse)',
          value: 'PICO',
          systemLabel: 'Other Check (not DA)',
        },
        PIDN: {
          label: 'Request not sent - up to date information already',
          value: 'PIDN',
          systemLabel: 'Request Not Sent - up to date information already',
        },
      },
    },
    C515: {
      code: 'C515',
      description: 'Police intelligence enquiries - response received',
      categories: {
        'Communication and information sharing with others': 'Police',
      },
      sensitive: true,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: false,
      showOutcomeBanner: true,
      outcomes: {
        PIDA: {
          label: 'Domestic abuse',
          value: 'PIDA',
          systemLabel: 'Domestic Abuse',
        },
        PIDO: {
          label: 'Domestic abuse and other check',
          value: 'PIDO',
          systemLabel: 'Domestic Abuse and Other Check',
        },
        PICO: {
          label: 'Other check (not domestic abuse)',
          value: 'PICO',
          systemLabel: 'Other Check (not DA)',
        },
      },
    },
    C204: {
      code: 'C204',
      description: 'Police liaison',
      isFrequentlyUsed: true,
      categories: {
        'Communication and information sharing with others': 'Police',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    POM4: {
      code: 'POM4',
      description: 'POM/COM standard handover - information received',
      categories: {
        'Communication and information sharing with others': 'Prisons',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    C202: {
      code: 'C202',
      description: 'Prison liaison',
      categories: {
        'Communication and information sharing with others': 'Prisons',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMOA: {
      code: 'CMOA',
      description: 'Email or text from person on probation',
      isFrequentlyUsed: true,
      categories: {
        'Communication with person on probation': 'Email or telephone',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CMOB: {
      code: 'CMOB',
      description: 'Email or text to person on probation',
      isFrequentlyUsed: true,
      categories: {
        'Communication with person on probation': 'Email or telephone',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CTOA: {
      code: 'CTOA',
      description: 'Telephone contact from person on probation',
      isFrequentlyUsed: true,
      categories: {
        'Communication with person on probation': 'Email or telephone',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CTOB: {
      code: 'CTOB',
      description: 'Telephone contact to person on probation',
      isFrequentlyUsed: true,
      categories: {
        'Communication with person on probation': 'Email or telephone',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CLOA: {
      code: 'CLOA',
      description: 'Letter or fax from person on probation',
      categories: {
        'Communication with person on probation': 'Letters',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CLOB: {
      code: 'CLOB',
      description: 'Letter or fax to person on probation',
      categories: {
        'Communication with person on probation': 'Letters',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    LCL: {
      code: 'LCL',
      description: 'Licence compliance letter',
      categories: {
        'Communication with person on probation': 'Letters',
        'Non-compliance and enforcement': '',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CIOA: {
      code: 'CIOA',
      description: 'Information from person on probation',
      categories: {
        'Communication with person on probation': 'Information',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CIOB: {
      code: 'CIOB',
      description: 'Information to person on probation',
      categories: {
        'Communication with person on probation': 'Information',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CTXT: {
      code: 'CTXT',
      description: 'Text message to send',
      categories: {
        'Communication with person on probation': 'Other communications',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C129: {
      code: 'C129',
      description: 'Use of video link or teleconference',
      categories: {
        'Communication with person on probation': 'Other communications',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    ICON: {
      code: 'ICON',
      description: 'IOM case conference',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'IOM',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CAIL: {
      code: 'CAIL',
      description: 'IOM correspondence contact',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'IOM',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    ERFI: {
      code: 'ERFI',
      description: 'IOM referral',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'IOM',
        Referrals: '',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        RACC: {
          label: 'Referral decision - accepted',
          value: 'RACC',
          systemLabel: 'Referral Decision - Accepted',
        },
        RPEN: {
          label: 'Referral decision - pending',
          value: 'RPEN',
          systemLabel: 'Referral Decision - Pending',
        },
        RRJT: {
          label: 'Rejected - remain at level 1',
          value: 'RRJT',
          systemLabel: 'Rejected - Remain at Level 1',
        },
      },
    },
    CAIR: {
      code: 'CAIR',
      description: 'IOM review',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'IOM',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C200: {
      code: 'C200',
      description: 'MAPPA information',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'MAPPA',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    C484: {
      code: 'C484',
      description: 'MAPPA J Form - Job Centre+ notification',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'MAPPA',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    C281: {
      code: 'C281',
      description: 'MAPPA level 1 review',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'MAPPA',
      },
      sensitive: true,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        MAP9: {
          label: 'Review complete - refer to Level 2 (SPO endorsed)',
          value: 'MAP9',
          systemLabel: 'Review complete - Refer to Level 2 - SPO endorsed',
        },
        MAP10: {
          label: 'Review complete - refer to Level 3 (SPO endorsed)',
          value: 'MAP10',
          systemLabel: 'Review complete - Refer to Level 3 - SPO endorsed',
        },
        MAP7: {
          label: 'Review complete - retain at Level 1 (management oversight not required)',
          value: 'MAP7',
          systemLabel: 'Review complete - Retain at Level 1 - MO not required',
        },
        MAP8: {
          label: 'Review complete - retain at Level 1 (SPO endorsed)',
          value: 'MAP8',
          systemLabel: 'Review complete - Retain at Level 1 - SPO endorsed',
        },
      },
    },
    MAPLS: {
      code: 'MAPLS',
      description: 'MAPPA level setting process',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'MAPPA',
      },
      sensitive: true,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        MAP4: {
          label: 'Level 1 - SPO Endorsed',
          value: 'MAP4',
          systemLabel: 'Level 1 - SPO endorsed',
        },
        MAP5: {
          label: 'Refer to Level 2 - SPO Endorsed',
          value: 'MAP5',
          systemLabel: 'Refer to level 2 - SPO endorsed',
        },
        MAP6: {
          label: 'Refer to Level 3 - SPO Endorsed',
          value: 'MAP6',
          systemLabel: 'Refer to level 3 - SPO endorsed',
        },
      },
      defaultHeading: 'Has the prison been notified of MAPPA Level?',
      guidance: "You must notify the prison of the MAPPA level, and record that you've done this.",
    },
    CCMM: {
      code: 'CCMM',
      description: 'MAPPA meeting',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'MAPPA',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      defaultHeading:
        'Before saving please check the "Sensitive" flag - these contacts should normally be marked as sensitive.',
    },
    CCMR: {
      code: 'CCMR',
      description: 'MAPPA referral',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'MAPPA',
        Referrals: '',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        RDL2: {
          label: 'Accepted - level 2',
          value: 'RDL2',
          systemLabel: 'Accepted - Level 2',
        },
        RDL3: {
          label: 'Accepted - level 3',
          value: 'RDL3',
          systemLabel: 'Accepted - Level 3',
        },
        RRJ2: {
          label: 'Category 3 referral rejected - not MAPPA managed',
          value: 'RRJ2',
          systemLabel: 'Category 3 Referral Rejected - Not MAPPA Managed',
        },
        RPEN: {
          label: 'Referral decision - pending',
          value: 'RPEN',
          systemLabel: 'Referral Decision - Pending',
        },
        RRJT: {
          label: 'Rejected - remain at level 1',
          value: 'RRJT',
          systemLabel: 'Rejected - Remain at Level 1',
        },
      },
    },
    C150: {
      code: 'C150',
      description: 'MARAC - perpetrated DV incident',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'MARAC',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      defaultHeading:
        'Before saving please check the "Sensitive" flag - these contacts should normally be marked as sensitive.',
    },
    C151: {
      code: 'C151',
      description: 'MARAC - victim of DV incident',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'MARAC',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C005: {
      code: 'C005',
      description: 'MARAC meeting',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'MARAC',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      defaultHeading:
        'Before saving please check the "Sensitive" flag - these contacts should normally be marked as sensitive.',
    },
    ERFM: {
      code: 'ERFM',
      description: 'MARAC referral',
      categories: {
        'Multi-agency working (including IOM, MAPPA and MARAC)': 'MARAC',
        Referrals: '',
      },
      sensitive: true,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      defaultHeading:
        'Before saving please check the "Sensitive" flag - these contacts should normally be marked as sensitive.',
      mandatoryOutcome: true,
      outcomes: {
        RACC: {
          label: 'Referral decision - accepted',
          value: 'RACC',
          systemLabel: 'Referral Decision - Accepted',
        },
        RPEN: {
          label: 'Referral decision - pending',
          value: 'RPEN',
          systemLabel: 'Referral Decision - Pending',
        },
        RRJT: {
          label: 'Rejected - remain at level 1',
          value: 'RRJT',
          systemLabel: 'Rejected - Remain at Level 1',
        },
      },
    },
    ACOM1: {
      code: 'ACOM1',
      description: 'Accommodation evidence',
      categories: {
        'Non-compliance and enforcement': '',
      },
      sensitive: false,
      relatesTo: ['Person'],
    },
    BRED: {
      code: 'BRED',
      description: 'Other enforcement action',
      categories: {
        'Non-compliance and enforcement': '',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CSNR: {
      code: 'CSNR',
      description: 'Sick note received',
      categories: {
        'Non-compliance and enforcement': '',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      defaultHeading:
        'Before saving please check the "Sensitive" flag - these contacts should normally be marked as sensitive.',
    },
    C115: {
      code: 'C115',
      description: 'Health and well being referral',
      categories: {
        Referrals: '',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    CGRF: {
      code: 'CGRF',
      description: 'Referral',
      categories: {
        Referrals: '',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        RACC: {
          label: 'Referral decision - accepted',
          value: 'RACC',
          systemLabel: 'Referral Decision - Accepted',
        },
        RPEN: {
          label: 'Referral decision - pending',
          value: 'RPEN',
          systemLabel: 'Referral Decision - Pending',
        },
        RRJT: {
          label: 'Rejected - remain at level 1',
          value: 'RRJT',
          systemLabel: 'Rejected - Remain at Level 1',
        },
      },
    },
    C507: {
      code: 'C507',
      description: 'Referral - children and families of person on probation',
      categories: {
        Referrals: '',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        RACC: {
          label: 'Referral decision - accepted',
          value: 'RACC',
          systemLabel: 'Referral Decision - Accepted',
        },
        RPEN: {
          label: 'Referral decision - pending',
          value: 'RPEN',
          systemLabel: 'Referral Decision - Pending',
        },
        RRJT: {
          label: 'Rejected - remain at level 1',
          value: 'RRJT',
          systemLabel: 'Rejected - Remain at Level 1',
        },
      },
    },
    C347: {
      code: 'C347',
      description: 'Referral - finance, benefits or debt',
      categories: {
        Referrals: '',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        RACC: {
          label: 'Referral decision - accepted',
          value: 'RACC',
          systemLabel: 'Referral Decision - Accepted',
        },
        RPEN: {
          label: 'Referral decision - pending',
          value: 'RPEN',
          systemLabel: 'Referral Decision - Pending',
        },
        RRJT: {
          label: 'Rejected - remain at level 1',
          value: 'RRJT',
          systemLabel: 'Rejected - Remain at Level 1',
        },
      },
    },
    DAD1: {
      code: 'DAD1',
      description: 'Disclosure considered',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        DAD7: {
          label: 'Disclosure not required',
          value: 'DAD7',
          systemLabel: 'Disclosure not required',
        },
        DAD4: {
          label: "Liaison with children's services",
          value: 'DAD4',
          systemLabel: "Liaison with Children's Services",
        },
        DAD5: {
          label: 'MAPPA - other',
          value: 'DAD5',
          systemLabel: 'MAPPA - Other',
        },
        DAD12: {
          label: 'MAPPA or probation disclosure - child sex offences',
          value: 'DAD12',
          systemLabel: 'MAPPA / Probation disclosure: Child Sex Offences',
        },
        DAD13: {
          label: 'Other (provide detail in notes)',
          value: 'DAD13',
          systemLabel: 'Other (provide detail in notes)',
        },
        DAD3: {
          label: 'Referral to DVDS',
          value: 'DAD3',
          systemLabel: 'Referral to DVDS',
        },
        DAD6: {
          label: 'Referral to MARAC for further information sharing',
          value: 'DAD6',
          systemLabel: 'Referral to MARAC for further information sharing',
        },
      },
    },
    DAD2: {
      code: 'DAD2',
      description: 'Disclosure response or completion',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        DAD10: {
          label: 'Other disclosure completed',
          value: 'DAD10',
          systemLabel: 'Disclosure completed (other)',
        },
        DAD11: {
          label: 'Other disclosure refused',
          value: 'DAD11',
          systemLabel: 'Disclosure refused (other)',
        },
        DAD9: {
          label: 'DVDS disclosure complete',
          value: 'DAD9',
          systemLabel: 'DVDS Disclosure complete',
        },
        DAD8: {
          label: 'DVDS referral refused',
          value: 'DAD8',
          systemLabel: 'DVDS Referral refused',
        },
        DAD13: {
          label: 'Other - provide details in notes',
          value: 'DAD13',
          systemLabel: 'Other (provide detail in notes)',
        },
      },
    },
    C159: {
      code: 'C159',
      description: 'Safeguarding - child protection core group meeting',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C078: {
      code: 'C078',
      description: 'Safeguarding - child protection meeting',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    C157: {
      code: 'C157',
      description: 'Safeguarding - child related contact',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    C161: {
      code: 'C161',
      description: 'Safeguarding - vulnerable adult contact',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    C160: {
      code: 'C160',
      description: 'Safeguarding - vulnerable adult strategy meeting',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    EASS: {
      code: 'EASS',
      description: 'Safeguarding assessment',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    CCCP: {
      code: 'CCCP',
      description: 'Safeguarding case conference',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
    },
    SFRR: {
      code: 'SFRR',
      description: 'Safeguarding enquiries - response received',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: true,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: false,
      showOutcomeBanner: true,
      outcomes: {
        SFG1: {
          label: 'Response received - known to social services',
          value: 'SFG1',
          systemLabel: 'Response Received - Known to Social Services',
        },
        SFG2: {
          label: 'Response received - not known to social services',
          value: 'SFG2',
          systemLabel: 'Response Received - Not Known to Social Services',
        },
      },
    },
    SFGC: {
      code: 'SFGC',
      description: 'Safeguarding enquiries requested',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: true,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        SFG3: {
          label: "Enquiry sent to local authority children's service",
          value: 'SFG3',
          systemLabel: "Enquiry sent to local authority children's service",
        },
        PIDN: {
          label: 'Request not sent - up to date information already',
          value: 'PIDN',
          systemLabel: 'Request Not Sent - up to date information already',
        },
      },
    },
    C280: {
      code: 'C280',
      description: 'Suicide or self harm information',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      defaultHeading: 'Has a safety plan been completed?',
      guidance: "You should complete a safety plan, and record that you've done this.",
    },
    CVIC: {
      code: 'CVIC',
      description: 'Victim liaison contact',
      categories: {
        'Safeguarding and victim liaison': '',
      },
      sensitive: true,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      defaultHeading:
        'Before saving please check the "Sensitive" flag - these contacts should normally be marked as sensitive. PP/VLO Contact Type: Sub Category: PP Actions:',
      guidance:
        'Victim liaison contacts should normally be marked as sensitive. You should include these headings in the details: Probation practitioner and VLO contact type Sub category Probation practitioner actions',
    },
    DUS01: {
      code: 'DUS01',
      description: 'Death under supervision category and notification',
      categories: {
        'Sentence management': '',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        DUS3A: {
          label: 'Alcohol poisoning',
          value: 'DUS3A',
          systemLabel: 'Alcohol poisoning',
        },
        DUS1A: {
          label: 'Awaiting further information',
          value: 'DUS1A',
          systemLabel: 'Awaiting Further Information',
        },
        DUS3B: {
          label: "Coroner's conclusion - cause unascertained",
          value: 'DUS3B',
          systemLabel: "Coroner's conclusion of: cause unascertained",
        },
        DUS3E: {
          label: 'Drug poisoning - intent unknown',
          value: 'DUS3E',
          systemLabel: 'Drug poisoning: Intent undetermined',
        },
        DUS3C: {
          label: 'Drug poisoning - intentional',
          value: 'DUS3C',
          systemLabel: 'Drug poisoning: Intentional',
        },
        DUS3D: {
          label: 'Drug poisoning - unintentional',
          value: 'DUS3D',
          systemLabel: 'Drug poisoning: Unintentional',
        },
        DUS3H: {
          label: 'Fall from height - intent unknown',
          value: 'DUS3H',
          systemLabel: 'Fall from height: Intent undetermined',
        },
        DUS3F: {
          label: 'Fall from height - intentional',
          value: 'DUS3F',
          systemLabel: 'Fall from height: Intentional',
        },
        DUS3G: {
          label: 'Fall from height - unintentional',
          value: 'DUS3G',
          systemLabel: 'Fall from height: Unintentional',
        },
        DUS1D: {
          label: 'Homicide - other',
          value: 'DUS1D',
          systemLabel: 'Homicide: Other',
        },
        DUS1F: {
          label: 'Homicide - shooting',
          value: 'DUS1F',
          systemLabel: 'Homicide: Shooting',
        },
        DUS1G: {
          label: 'Homicide - stabbing',
          value: 'DUS1G',
          systemLabel: 'Homicide: Stabbing',
        },
        DUS1N: {
          label: 'Natural causes - cancer related',
          value: 'DUS1N',
          systemLabel: 'Natural Causes: Cancer Related',
        },
        DUS1O: {
          label: 'Natural causes - heart related',
          value: 'DUS1O',
          systemLabel: 'Natural Causes: Heart Related',
        },
        DUS1B: {
          label: 'Natural causes - other',
          value: 'DUS1B',
          systemLabel: 'Natural Causes: Other',
        },
        DUS3I: {
          label: 'Unnatural - accident or other',
          value: 'DUS3I',
          systemLabel: 'Non-natural: Accident / other',
        },
        DUS3J: {
          label: 'Unnatural - road traffic accident',
          value: 'DUS3J',
          systemLabel: 'Non-natural: Road Traffic Accident',
        },
        DUS1R: {
          label: 'Self-inflicted - hanging',
          value: 'DUS1R',
          systemLabel: 'Self-inflicted: Hanging',
        },
        DUS1C: {
          label: 'Self-inflicted - other',
          value: 'DUS1C',
          systemLabel: 'Self-inflicted: Other',
        },
      },
    },
    CTPJ: {
      code: 'CTPJ',
      description: 'Professional judgement',
      categories: {
        'Sentence management': '',
      },
      sensitive: false,
      relatesTo: ['Person', 'Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        CO28: {
          label: 'Enforcement action consideration',
          value: 'CO28',
          systemLabel: 'Enforcement Action Consideration',
        },
        PJAS: {
          label: 'Reviewed assessment frequency',
          value: 'PJAS',
          systemLabel: 'Reviewed Assessment Frequency',
        },
        PJAT: {
          label: 'Reviewed attendance frequency',
          value: 'PJAT',
          systemLabel: 'Reviewed Attendance Frequency',
        },
      },
    },
    ROTL: {
      code: 'ROTL',
      description: 'ROTL - release',
      categories: {
        'Sentence management': '',
      },
      sensitive: false,
      relatesTo: ['Person'],
    },
    ROTR: {
      code: 'ROTR',
      description: 'ROTL - return',
      categories: {
        'Sentence management': '',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    DRAT: {
      code: 'DRAT',
      description: 'Substance misuse screening tool',
      categories: {
        'Sentence management': '',
      },
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
    },
    ...(flags.enableEarlyTermination20261103Squad3
      ? {
          ETRP: {
            code: 'ETRP',
            description: 'Early termination request',
            isFrequentlyUsed: true,
            categories: {
              'Sentence management': '',
            },
            sensitive: false,
            relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
            mandatoryOutcome: true,
            outcomes: {
              ET01: {
                label: 'Checklist in progress',
                value: 'ET01',
                systemLabel: 'Checklist in progress',
              },
              ET02: {
                label: 'Referred to panel',
                value: 'ET02',
                systemLabel: 'Referred to panel',
              },
              ET07: {
                label: 'Deferred by Practitioner',
                value: 'ET07',
                systemLabel: 'Deferred by Practitioner',
              },
            },
          },
        }
      : {}),
    AAM1: {
      code: 'AAM1',
      description: 'Alcohol consumption',
      categories: {},
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        AAM01: {
          label: 'Acceptable - Alcohol consumption but no breach',
          value: 'AAM01',
          systemLabel: 'Acceptable - Alcohol consumption no breach',
        },
        AAM13: {
          label: 'Acceptable - Monitoring only',
          value: 'AAM13',
          systemLabel: 'Acceptable - Monitoring only',
        },
        AAM02: {
          label: 'Unacceptable alcohol consumption',
          value: 'AAM02',
          systemLabel: 'Unacceptable Alcohol Consumption',
        },
      },
    },
    AAM10: {
      code: 'AAM10',
      description: 'Critical communications',
      categories: {},
      sensitive: false,
      relatesTo: ['Pre-CJA Events', 'CJA/ORA Events'],
      mandatoryOutcome: true,
      outcomes: {
        AAM11: {
          label: 'Acceptable critical communications - no breach',
          value: 'AAM11',
          systemLabel: 'Acceptable - Critical Communications - no breach',
        },
        AAM12: {
          label: 'Unacceptable critical communications',
          value: 'AAM12',
          systemLabel: 'Unacceptable Critical Communications',
        },
      },
    },
  }
}
