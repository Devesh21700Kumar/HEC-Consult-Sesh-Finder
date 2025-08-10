'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { SessionWithParticipants } from '../../types'
import { formatDate, formatTime } from '../../lib/dateUtils'
import { Calendar, Plus, Video, MapPin, Users, Edit, Trash2, Phone, Clock } from 'lucide-react'
import AuthGuard from '../../components/AuthGuard'
import Navbar from '../../components/Navbar'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionWithParticipants[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

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

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return
    }

    try {
      setDeleting(sessionId)
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)

      if (error) {
        console.error('Error deleting session:', error)
        alert('Failed to delete session')
      } else {
        // Remove from local state
        setSessions(sessions.filter(s => s.id !== sessionId))
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session')
    } finally {
      setDeleting(null)
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
            <div className="flex space-x-3">
              <Link href="/sessions/match" className="btn-secondary flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Find Partners
              </Link>
              <Link href="/sessions/create" className="btn-primary flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Link>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No sessions yet</h2>
              <p className="text-gray-600 mb-6">Create your first case study session to get started</p>
              <div className="flex justify-center space-x-3">
                <Link href="/sessions/match" className="btn-secondary">
                  Find Study Partners
                </Link>
                <Link href="/sessions/create" className="btn-primary">
                  Create Your First Session
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <div key={session.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
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
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(session.date)}</span>
                        <Clock className="h-4 w-4 ml-3 mr-1" />
                        <span>{formatTime(session.time)}</span>
                      </div>

                      {session.participant1_profile && session.participant2_profile && (
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            <span className="font-medium">Participants:</span>
                          </div>
                          <div className="ml-5 space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">
                                {session.participant1_profile.first_name || 'Student'} {session.participant1_profile.last_name || ''}
                              </span>
                              {session.participant1_profile.phone_number && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {session.participant1_profile.phone_number}
                                </div>
                              )}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">
                                {session.participant2_profile.first_name || 'Student'} {session.participant2_profile.last_name || ''}
                              </span>
                              {session.participant2_profile.phone_number && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {session.participant2_profile.phone_number}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
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
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit session"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        disabled={deleting === session.id}
                        className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                        title="Delete session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
