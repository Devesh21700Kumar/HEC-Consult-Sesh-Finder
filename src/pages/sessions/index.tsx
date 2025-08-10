'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { SessionWithParticipants } from '../../types'
import { formatDate, formatTime } from '../../lib/dateUtils'
import { Calendar, Plus, Video, MapPin, Users } from 'lucide-react'
import AuthGuard from '../../components/AuthGuard'
import Navbar from '../../components/Navbar'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionWithParticipants[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
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
      console.error('Error loading sessions:', error)
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
              <p className="text-gray-600 mt-2">View and manage your case study sessions</p>
            </div>
            <Link href="/sessions/create" className="btn-primary flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No sessions yet</h2>
              <p className="text-gray-600 mb-6">Create your first case study session to get started</p>
              <Link href="/sessions/create" className="btn-primary">
                Create Your First Session
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.topic || 'Case Study Session'}
                        </h3>
                        <div className="ml-3 flex items-center">
                          {session.format === 'Video Call' ? (
                            <Video className="h-4 w-4 text-blue-500 mr-1" />
                          ) : (
                            <MapPin className="h-4 w-4 text-green-500 mr-1" />
                          )}
                          <span className="text-sm text-gray-600">{session.format}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {formatDate(session.date)} at {formatTime(session.time)}
                      </p>

                      {session.participant1_profile && session.participant2_profile && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          <span>
                            {session.participant1_profile.first_name || 'Student'} & {session.participant2_profile.first_name || 'Student'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
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
                      <Link
                        href={`/sessions/${session.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
