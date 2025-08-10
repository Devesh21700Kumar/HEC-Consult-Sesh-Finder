export interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone_number: string | null
  level: 'Beginner' | 'Medium' | 'Advanced' | null
  consulting: boolean
  mna: boolean
  quant: boolean
  created_at: string
}

export interface Session {
  id: string
  date: string
  time: string
  format: 'Video Call' | 'In-person'
  topic: string | null
  participant1: string | null
  participant2: string | null
  meet_link: string | null
  created_at: string
}

export interface SessionWithParticipants extends Session {
  participant1_profile?: Profile
  participant2_profile?: Profile
}

export interface User {
  id: string
  email: string
  created_at: string
}
