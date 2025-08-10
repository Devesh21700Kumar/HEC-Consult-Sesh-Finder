import { google } from 'googleapis'

export async function createMeetLink(
  summary: string, 
  start: string, 
  end: string, 
  attendees: string[]
) {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/calendar']
  )

  const calendar = google.calendar({ version: 'v3', auth })

  const event = {
    summary,
    start: { dateTime: start, timeZone: 'Europe/Paris' },
    end: { dateTime: end, timeZone: 'Europe/Paris' },
    attendees: attendees.map(email => ({ email })),
    conferenceData: {
      createRequest: { requestId: Math.random().toString(36).substring(2) }
    }
  }

  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    })

    return res.data.hangoutLink // Real Google Meet link
  } catch (error) {
    console.error('Error creating Meet link:', error)
    throw error
  }
}
