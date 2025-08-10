import { Profile } from '../types'

export function pairParticipants(profiles: Profile[]): [Profile, Profile][] {
  const shuffled = profiles.sort(() => 0.5 - Math.random())
  const pairs: [Profile, Profile][] = []

  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i + 1]) {
      pairs.push([shuffled[i], shuffled[i + 1]])
    }
  }
  return pairs
}

export function findUnmatchedParticipants(profiles: Profile[], sessions: any[]): Profile[] {
  const matchedIds = new Set()

  sessions.forEach(session => {
    if (session.participant1) matchedIds.add(session.participant1)
    if (session.participant2) matchedIds.add(session.participant2)
  })

  return profiles.filter(profile => !matchedIds.has(profile.id))
}

export function validateEmail(email: string): boolean {
  const hecRegex = /^[a-zA-Z0-9._%+-]+@hec\.edu$/
  return hecRegex.test(email)
}

export function checkExistingMatchOnDate(
  sessions: any[],
  userId1: string,
  userId2: string,
  date: string
): boolean {
  return sessions.some(session => {
    const isSameDate = session.date === date
    const isParticipant1 = session.participant1 === userId1 || session.participant1 === userId2
    const isParticipant2 = session.participant2 === userId1 || session.participant2 === userId2

    return isSameDate && (isParticipant1 || isParticipant2)
  })
}
