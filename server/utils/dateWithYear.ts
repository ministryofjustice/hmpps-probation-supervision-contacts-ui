import { DateTime } from 'luxon'
import { isBlank } from './isBlank'
import { govukTime } from './govukTime'

export const dateWithYear = (datetimeString: string, showTime = false): string | null => {
  if (!datetimeString || isBlank(datetimeString)) return ''
  const formattedDate = DateTime.fromISO(datetimeString).toFormat('d MMMM yyyy')
  const timeSuffix = showTime ? ` at ${govukTime(datetimeString)}` : ''
  return `${formattedDate}${timeSuffix}`
}
