import { format, parseISO, addDays, startOfDay } from 'date-fns'

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMM dd, yyyy')
}

export function formatTime(time: string): string {
  return time
}

export function formatDateTime(date: string, time: string): string {
  const dateTime = `${date}T${time}`
  return format(parseISO(dateTime), 'MMM dd, yyyy HH:mm')
}

export function getNextAvailableDate(): string {
  const today = new Date()
  const nextDay = addDays(today, 1)
  return format(nextDay, 'yyyy-MM-dd')
}

export function getAvailableTimeSlots(): string[] {
  return [
    '09:00',
    '10:00', 
    '11:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00'
  ]
}
