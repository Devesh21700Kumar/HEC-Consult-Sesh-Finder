import type { NextApiRequest, NextApiResponse } from 'next'
import { getExistingMeetLink } from '../../../lib/meetLinkGenerator'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    const meetLink = await getExistingMeetLink(sessionId)

    res.json({ success: !!meetLink, meetLink, message: meetLink ? 'Meet link found' : 'No meet link set. Edit the session to add one.' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meet link' })
  }
}
