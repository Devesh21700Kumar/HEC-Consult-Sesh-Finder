'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { getAllProfiles } from '../../lib/profileUtils'
import { Profile } from '../../types'
import { Users, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'
import AuthGuard from '../../components/AuthGuard'
import Navbar from '../../components/Navbar'

export default function MatchPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get current user's profile
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setCurrentUser(currentProfile)

        // Get all other profiles (excluding current user)
        const allProfiles = await getAllProfiles()
        const otherProfiles = allProfiles.filter(p => p.id !== user.id)
        setProfiles(otherProfiles)
      }
    } catch (error) {
      console.error('Error loading match data:', error)
      setError('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  const handleMatch = async (partnerId: string) => {
    try {
      setMatching(true)
      setError('')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to create a match')
        return
      }

      // Create a new session with both participants
      const { error } = await supabase
        .from('sessions')
        .insert([{
          date: new Date().toISOString().split('T')[0], // Today
          time: '18:00',
          format: 'Video Call',
          topic: 'Case Study Session',
          participant1: user.id,
          participant2: partnerId,
          meet_link: null // Will be generated later
        }])

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Match created successfully! Check your sessions.')
        // Reload data
        await loadData()
      }
    } catch (err) {
      setError('Failed to create match')
    } finally {
      setMatching(false)
    }
  }

  const getCompatibilityScore = (profile: Profile) => {
    if (!currentUser) return 0
    
    let score = 0
    
    // Level compatibility
    if (currentUser.level && profile.level) {
      if (currentUser.level === profile.level) score += 2
      else if (
        (currentUser.level === 'Beginner' && profile.level === 'Medium') ||
        (currentUser.level === 'Medium' && profile.level === 'Advanced') ||
        (currentUser.level === 'Advanced' && profile.level === 'Medium')
      ) score += 1
    }
    
    // Interest compatibility
    if (currentUser.consulting && profile.consulting) score += 1
    if (currentUser.mna && profile.mna) score += 1
    if (currentUser.quant && profile.quant) score += 1
    
    return score
  }

  const sortedProfiles = profiles.sort((a, b) => getCompatibilityScore(b) - getCompatibilityScore(a))

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Study Partners</h1>
            <p className="text-gray-600">
              Match with other HEC students for case study sessions
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {!currentUser ? (
            <div className="card text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
              <p className="text-gray-600 mb-4">
                Please complete your profile to find study partners
              </p>
              <a href="/profile" className="btn-primary">
                Set Up Profile
              </a>
            </div>
          ) : profiles.length === 0 ? (
            <div className="card text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Partners Available</h2>
              <p className="text-gray-600">
                No other students have completed their profiles yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProfiles.map((profile) => {
                const compatibilityScore = getCompatibilityScore(profile)
                const interests = []
                if (profile.consulting) interests.push('Consulting')
                if (profile.mna) interests.push('M&A')
                if (profile.quant) interests.push('Quantitative')

                return (
                  <div key={profile.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {profile.first_name || 'Student'} {profile.last_name || ''}
                        </h3>
                        <p className="text-sm text-gray-600">{profile.email}</p>
                      </div>
                      {compatibilityScore > 0 && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {compatibilityScore} match
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {profile.level && (
                        <div className="text-sm">
                          <span className="font-medium">Level:</span> {profile.level}
                        </div>
                      )}
                      
                      {interests.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium">Interests:</span> {interests.join(', ')}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleMatch(profile.id)}
                      disabled={matching}
                      className="w-full btn-primary disabled:opacity-50 flex items-center justify-center"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {matching ? 'Creating Match...' : 'Match & Create Session'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
