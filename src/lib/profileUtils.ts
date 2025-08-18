import { supabase } from './supabaseClient'
import { Profile } from '../types'

export async function createOrUpdateProfile(userId: string, profileData: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...profileData,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating/updating profile:', error)
    throw error
  }

  return data
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  return data || []
}

export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false
  
  // Check if essential fields are filled
  const hasName = !!(profile.first_name && profile.last_name)
  const hasLevel = !!profile.level
  const hasInterests = !!(profile.consulting || profile.mna || profile.quant)
  
  return hasName && hasLevel && hasInterests
}

export function getProfileCompletionPercentage(profile: Profile | null): number {
  if (!profile) return 0
  
  const fields = [
    profile.first_name,
    profile.last_name,
    profile.level,
    profile.consulting || profile.mna || profile.quant
  ]
  
  const completedFields = fields.filter(Boolean).length
  return Math.round((completedFields / fields.length) * 100)
}
