import { DateTime } from 'luxon'
import { isBlank } from './isBlank'

export const dateWithDayAndWithYear = (datetimeString: string): string | null => {
  if (!datetimeString || isBlank(datetimeString)) return null
  const dateTime = DateTime.fromISO(datetimeString)
  if (!dateTime.isValid) return null
  return dateTime.toFormat('cccc d MMMM yyyy')
}
