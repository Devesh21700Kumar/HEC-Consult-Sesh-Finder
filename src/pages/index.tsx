'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { getProfile, createOrUpdateProfile } from '../lib/profileUtils'
import { SessionWithParticipants, Profile } from '../types'
import { formatDate, formatTime } from '../lib/dateUtils'
import { Calendar, Users, Plus, Video, MapPin } from 'lucide-react'
import AuthGuard from '../components/AuthGuard'
import Navbar from '../components/Navbar'

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionWithParticipants[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileSetup, setShowProfileSetup] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        let profileData = await getProfile(user.id)
        
        // If no profile exists, create a basic one
        if (!profileData) {
          try {
            profileData = await createOrUpdateProfile(user.id, {
              email: user.email || '',
              first_name: null,
              last_name: null,
              level: null,
              consulting: false,
              mna: false,
              quant: false
            })
            setShowProfileSetup(true)
          } catch (error) {
            console.error('Error creating profile:', error)
          }
        }
        
        setProfile(profileData)
      }

      // Get user's sessions
      if (user) {
        const { data: sessionsData } = await supabase
          .from('sessions')
          .select(`
            *,
            participant1_profile:profiles!participant1(*),
            participant2_profile:profiles!participant2(*)
          `)
          .or(`participant1.eq.${user.id},participant2.eq.${user.id}`)
          .order('date', { ascending: true })
          .order('time', { ascending: true })

        setSessions(sessionsData || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

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
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.first_name || 'Student'}!
            </h1>
            <p className="text-gray-600">
              Manage your case study sessions and find study partners
            </p>
            {showProfileSetup && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700">
                  Complete your profile to get better session matches!{' '}
                  <Link href="/profile" className="font-medium underline">
                    Set up profile
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/sessions/create" className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-primary-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create Session</h3>
                  <p className="text-gray-600">Schedule a new case study session</p>
                </div>
              </div>
            </Link>

            <Link href="/sessions/match" className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-primary-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Find Partner</h3>
                  <p className="text-gray-600">Match with other students</p>
                </div>
              </div>
            </Link>

            <Link href="/sessions" className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-primary-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">View All</h3>
                  <p className="text-gray-600">See all your sessions</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Upcoming Sessions */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
              <Link href="/sessions" className="text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
                <p className="text-gray-600 mb-4">Create your first session to get started</p>
                <Link href="/sessions/create" className="btn-primary">
                  Create Session
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {session.topic || 'Case Study Session'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(session.date)} at {formatTime(session.time)}
                        </p>
                        <div className="flex items-center mt-2">
                          {session.format === 'Video Call' ? (
                            <Video className="h-4 w-4 text-blue-500 mr-1" />
                          ) : (
                            <MapPin className="h-4 w-4 text-green-500 mr-1" />
                          )}
                          <span className="text-sm text-gray-600">{session.format}</span>
                        </div>
                      </div>
                      
                      {session.meet_link && (
                        <a
                          href={session.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm"
                        >
                          Join Meeting
                        </a>
                      )}
                    </div>
                    
                    {session.participant1_profile && session.participant2_profile && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span>With: </span>
                        <span className="font-medium">
                          {session.participant1_profile.first_name || 'Student'} & {session.participant2_profile.first_name || 'Student'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
