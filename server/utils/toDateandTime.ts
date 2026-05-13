export const toIsoDateTime = (date: string, time: string): string => {
  const [day, month, year] = date.split('/').map(Number)
  const [hours, minutes] = time.split(':').map(Number)

  return new Date(year, month - 1, day, hours, minutes).toISOString()
}
