import { isNotEmpty, isValidDate, isValidDateFormat, timeIsValid24HourFormat } from '../../utils/validationUtils'

import { ValidationSpec } from '../../models/Errors'

export const updateContactValidation = (): ValidationSpec => ({
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
})
