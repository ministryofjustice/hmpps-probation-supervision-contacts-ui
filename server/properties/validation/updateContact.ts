import {
  isNotEmpty,
  isValidDate,
  isValidDateFormat,
  timeIsValid24HourFormat,
  dateTimeIsNotInFuture,
  dateIsTodayOrPast,
} from '../../utils/validationUtils'

import { ValidationSpec } from '../../models/Errors'

export const updateContactValidation = (outcomeRequired: boolean): ValidationSpec => ({
  date: {
    optional: false,
    checks: [
      {
        validator: isNotEmpty,
        msg: 'Enter or select a date',
        log: 'Contact date not entered',
      },
      {
        validator: isValidDateFormat,
        msg: 'Enter a date in the correct format, for example 17/5/2024',
        log: 'Contact date format invalid',
      },
      {
        validator: isValidDate,
        msg: 'Enter a date in the correct format, for example 17/5/2024',
        log: 'Contact date invalid',
      },
      {
        validator: dateIsTodayOrPast,
        msg: 'The date of the contact must be today or in the past',
        log: 'Contact date in future',
      },
    ],
  },

  time: {
    optional: false,
    checks: [
      {
        validator: isNotEmpty,
        msg: 'Enter a time',
        log: 'Appointment time not entered',
      },
      {
        validator: timeIsValid24HourFormat,
        msg: 'Enter a time in the 24-hour format, for example 16:30',
        log: 'Appointment time format invalid',
        crossField: 'date',
      },
      {
        validator: dateTimeIsNotInFuture,
        msg: 'The time of the contact must be the current time or in the past',
        log: 'Contact date and time in future',
        crossField: 'date',
      },
    ],
  },
  outcomeCode: {
    optional: !outcomeRequired,
    checks: [
      {
        validator: isNotEmpty,
        msg: 'Select an outcome',
        log: 'Outcome not selected',
      },
    ],
  },

  sensitivity: {
    optional: true,
    checks: [
      {
        validator: isNotEmpty,
        msg: 'Select if the contact contains sensitive information',
        log: 'Sensitivity selection not made',
      },
    ],
  },
  alertResponsibleOfficer: {
    optional: false,
    checks: [
      {
        validator: isNotEmpty,
        msg: 'Select if you want to alert the responsible officer',
        log: 'Select if you want to alert the responsible officer',
      },
    ],
  },
})
