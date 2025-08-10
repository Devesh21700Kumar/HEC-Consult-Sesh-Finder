'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'
import { getNextAvailableDate, getAvailableTimeSlots } from '../../lib/dateUtils'
import { Calendar, Clock, Video, MapPin, Save, ArrowLeft, Link as LinkIcon } from 'lucide-react'
import AuthGuard from '../../components/AuthGuard'
import Navbar from '../../components/Navbar'

export default function CreateSessionPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    date: getNextAvailableDate(),
    time: '18:00',
    format: 'Video Call' as 'Video Call' | 'In-person',
    topic: '',
    meet_link: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to create a session')
        return
      }

      const { error } = await supabase
        .from('sessions')
        .insert([{
          date: form.date,
          time: form.time,
          format: form.format,
          topic: form.topic || null,
          participant1: user.id,
          participant2: null,
          meet_link: form.format === 'Video Call' && form.meet_link ? form.meet_link : null
        }])

      if (error) {
        setError(error.message)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError('An error occurred while creating the session')
    } finally {
      setLoading(false)
    }
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
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Session</h1>
            <p className="text-gray-600 mt-2">Schedule a case study session</p>
          </div>

          <div className="card">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-700">{error}</span>
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
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
