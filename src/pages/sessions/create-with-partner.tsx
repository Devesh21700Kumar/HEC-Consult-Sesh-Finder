'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { getNextAvailableDate, getAvailableTimeSlots } from '../../lib/dateUtils'
import { checkExistingMatchOnDate } from '../../lib/matchAlgorithm'
import { Calendar, Clock, Video, MapPin, Save, ArrowLeft, Link as LinkIcon, Mail, Users, AlertCircle } from 'lucide-react'
import AuthGuard from '../../components/AuthGuard'
import Navbar from '../../components/Navbar'

interface SelectedPartner {
  id: string
  name: string
  email: string
  phone?: string
}

export default function CreateSessionWithPartnerPage() {
  const router = useRouter()
  const [selectedPartner, setSelectedPartner] = useState<SelectedPartner | null>(null)
  const [form, setForm] = useState({
    date: getNextAvailableDate(),
    time: '18:00',
    format: 'Video Call' as 'Video Call' | 'In-person',
    topic: '',
    meet_link: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false)
  const [hasExistingMatch, setHasExistingMatch] = useState(false)

  useEffect(() => {
    // Get partner info from sessionStorage
    const partnerData = sessionStorage.getItem('selectedPartner')
    if (partnerData) {
      try {
        const partner = JSON.parse(partnerData)
        setSelectedPartner(partner)
      } catch (err) {
        setError('Invalid partner data')
        router.push('/sessions/match')
      }
    } else {
      setError('No partner selected')
      router.push('/sessions/match')
    }
  }, [router])

  useEffect(() => {
    // Load user's sessions for duplicate checking
    const loadSessions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: userSessions } = await supabase
            .from('sessions')
            .select('*')
            .or(`participant1.eq.${user.id},participant2.eq.${user.id}`)
            .order('date', { ascending: true })

          setSessions(userSessions || [])
        }
      } catch (error) {
        console.error('Error loading sessions:', error)
      }
    }

    loadSessions()
  }, [])

  useEffect(() => {
    // Check for duplicate sessions when date changes
    const checkDuplicate = async () => {
      if (selectedPartner && form.date) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const existingMatch = checkExistingMatchOnDate(
            sessions,
            user.id,
            selectedPartner.id,
            form.date
          )
          setHasExistingMatch(existingMatch)
          setShowDuplicateAlert(false) // Reset alert when date changes
        }
      }
    }

    checkDuplicate()
  }, [form.date, selectedPartner, sessions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShowDuplicateAlert(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !selectedPartner) {
        setError('You must be logged in and have a partner selected')
        return
      }

      // Check for existing match on the selected date
      const existingMatch = checkExistingMatchOnDate(
        sessions,
        user.id,
        selectedPartner.id,
        form.date
      )

      if (existingMatch) {
        setShowDuplicateAlert(true)
        setLoading(false)
        return
      }

      const { data: newSession, error } = await supabase
        .from('sessions')
        .insert([{
          date: form.date,
          time: form.time,
          format: form.format,
          topic: form.topic || null,
          participant1: user.id,
          participant2: selectedPartner.id,
          meet_link: form.format === 'Video Call' && form.meet_link ? form.meet_link : null
        }])
        .select()
        .single()

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Session created successfully!')
        setSessionId(newSession.id)
        // Clear partner data from sessionStorage
        sessionStorage.removeItem('selectedPartner')
      }
    } catch (err) {
      setError('An error occurred while creating the session')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = () => {
    if (!selectedPartner || !sessionId) return

    const sessionDate = new Date(form.date).toLocaleDateString()
    const sessionTime = form.time
    
    const subject = `Case Study Session Invitation - ${sessionDate} at ${sessionTime}`
    
    const body = `Hi ${selectedPartner.name},

I'd like to invite you to a case study session on ${sessionDate} at ${sessionTime}.

Session Details:
- Date: ${sessionDate}
- Time: ${sessionTime}
- Format: ${form.format}
${form.topic ? `- Topic: ${form.topic}` : ''}
${form.meet_link ? `- Meeting Link: ${form.meet_link}` : ''}

Please let me know if this works for you or if you'd like to suggest any changes.

Best regards,
[Your Name]`

    // Create mailto link
    const mailtoLink = `mailto:${selectedPartner.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Open default email client
    window.open(mailtoLink)
  }

  if (!selectedPartner) {
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
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Partners
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create Session with Partner</h1>
            <p className="text-gray-600 mt-2">Schedule a case study session with your matched partner</p>
          </div>

          {/* Partner Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Users className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Session Partner
                </h3>
                <div className="text-sm text-blue-700 mt-1">
                  <p><strong>Name:</strong> {selectedPartner.name}</p>
                  <p><strong>Email:</strong> {selectedPartner.email}</p>
                  {selectedPartner.phone && (
                    <p><strong>Phone:</strong> {selectedPartner.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {showDuplicateAlert && selectedPartner && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">
                      Already matched on this date!
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      You already have a session scheduled with{" "}
                      {selectedPartner.name} on {form.date}. You
                      can edit or delete the existing session in your sessions
                      list.
                    </p>
                    <div className="mt-3 flex space-x-3">
                      <button
                        onClick={() => setShowDuplicateAlert(false)}
                        className="text-sm text-yellow-800 underline"
                      >
                        Dismiss
                      </button>
                      <a
                        href="/sessions"
                        className="text-sm text-yellow-800 underline"
                      >
                        View Sessions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Session Created Successfully!
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      {success}
                    </p>
                    <div className="mt-3 flex space-x-3">
                      <button
                        onClick={handleSendEmail}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email Invitation
                      </button>
                      <a
                        href={`/sessions/${sessionId}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Session Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-2" />
                  Time
                </label>
                <select
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="input-field"
                  required
                >
                  {getAvailableTimeSlots().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="Video Call"
                      checked={form.format === 'Video Call'}
                      onChange={(e) => setForm({ ...form, format: e.target.value as 'Video Call' | 'In-person' })}
                      className="mr-2"
                    />
                    <Video className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Video Call</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="In-person"
                      checked={form.format === 'In-person'}
                      onChange={(e) => setForm({ ...form, format: e.target.value as 'Video Call' | 'In-person' })}
                      className="mr-2"
                    />
                    <MapPin className="h-4 w-4 text-green-500 mr-2" />
                    <span>In-person</span>
                  </label>
                </div>
              </div>

              {form.format === 'Video Call' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <LinkIcon className="h-4 w-4 inline mr-2" />
                    Google Meet link (paste manually)
                  </label>
                  <input
                    type="url"
                    value={form.meet_link}
                    onChange={(e) => setForm({ ...form, meet_link: e.target.value })}
                    className="input-field"
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic (Optional)
                </label>
                <textarea
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="e.g., Consulting case study, M&A analysis, etc."
                />
              </div>

              <button
                type="submit"
                disabled={loading || hasExistingMatch}
                className="w-full btn-primary disabled:opacity-50 flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating Session...' : hasExistingMatch ? 'Already matched on this date' : 'Create Session with Partner'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
