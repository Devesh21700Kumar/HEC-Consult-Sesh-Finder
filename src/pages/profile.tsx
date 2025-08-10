'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getProfile, createOrUpdateProfile } from '../lib/profileUtils'
import { Profile } from '../types'
import { User, Save, AlertCircle, CheckCircle } from 'lucide-react'
import AuthGuard from '../components/AuthGuard'
import Navbar from '../components/Navbar'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    level: '' as 'Beginner' | 'Medium' | 'Advanced' | '',
    consulting: false,
    mna: false,
    quant: false
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const profileData = await getProfile(user.id)
        if (profileData) {
          setProfile(profileData)
          setForm({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            phone_number: profileData.phone_number || '',
            level: profileData.level || '',
            consulting: profileData.consulting,
            mna: profileData.mna,
            quant: profileData.quant
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to update your profile')
        return
      }

      await createOrUpdateProfile(user.id, {
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        phone_number: form.phone_number || null,
        level: form.level || null,
        consulting: form.consulting,
        mna: form.mna,
        quant: form.quant
      })

      setSuccess('Profile updated successfully!')
      await loadProfile() // Reload profile data
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
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
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
            <p className="text-gray-600">Update your profile information</p>
          </div>

          <div className="card">
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="input-field"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="input-field"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  className="input-field"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value as 'Beginner' | 'Medium' | 'Advanced' | '' })}
                  className="input-field"
                >
                  <option value="">Select your level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Medium">Medium</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Areas of Interest
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.consulting}
                      onChange={(e) => setForm({ ...form, consulting: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Consulting</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.mna}
                      onChange={(e) => setForm({ ...form, mna: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">M&A</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.quant}
                      onChange={(e) => setForm({ ...form, quant: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Quantitative</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary disabled:opacity-50 flex items-center justify-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
