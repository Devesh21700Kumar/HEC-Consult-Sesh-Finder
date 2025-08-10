import { supabase } from './supabaseClient'

export async function getExistingMeetLink(sessionId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('meet_link')
    .eq('id', sessionId)
    .single()

  if (error) return null
  return data?.meet_link || null
}
