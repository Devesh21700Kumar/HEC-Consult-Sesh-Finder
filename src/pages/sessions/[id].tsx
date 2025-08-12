"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { SessionWithParticipants } from "../../types";
import { formatDate, formatTime, getAvailableTimeSlots } from "../../lib/dateUtils";
import { Save, Link as LinkIcon, Calendar, Clock, Video, MapPin, Users, Phone, Edit, Trash2, ArrowLeft } from "lucide-react";
import AuthGuard from "../../components/AuthGuard";
import Navbar from "../../components/Navbar";

export default function SessionDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState<SessionWithParticipants | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    date: "",
    time: "",
    format: "" as 'Video Call' | 'In-person',
    topic: "",
    meet_link: ""
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("sessions")
      .select(`
        *,
        participant1_profile:profiles!participant1(*),
        participant2_profile:profiles!participant2(*)
      `)
      .eq("id", id)
      .single();

    if (data) {
      setSession((data as any) || null);
      setForm({
        date: data.date,
        time: data.time,
        format: data.format,
        topic: data.topic || "",
        meet_link: data.meet_link || ""
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase
        .from("sessions")
        .update({
          date: form.date,
          time: form.time,
          format: form.format,
          topic: form.topic || null,
          meet_link: form.meet_link || null
        })
        .eq("id", id);

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Session updated successfully!");
        setEditing(false);
        await load();
      }
    } catch (err) {
      setError("Failed to update session");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", id);

      if (error) {
        setError(error.message);
      } else {
        router.push("/sessions");
      }
    } catch (err) {
      setError("Failed to delete session");
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </AuthGuard>
    );
  }

  if (!session) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="card">Session not found.</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </button>
            
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Session Details</h1>
              <div className="flex space-x-2">
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-secondary flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="btn-secondary text-red-600 hover:text-red-700 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-700">{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Session Details */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Information</h2>
              
              {editing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="input-field bg-gray-100 cursor-not-allowed"
                      required
                      disabled
                      title="Session date cannot be changed after creation"
                    />
                    <p className="text-xs text-gray-500 mt-1">Session date cannot be modified after creation</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                    <select
                      value={form.format}
                      onChange={(e) => setForm({ ...form, format: e.target.value as 'Video Call' | 'In-person' })}
                      className="input-field"
                      required
                    >
                      <option value="Video Call">Video Call</option>
                      <option value="In-person">In-person</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                    <input
                      type="text"
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      className="input-field"
                      placeholder="Case study topic or description"
                    />
                  </div>

                  {form.format === 'Video Call' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meet Link</label>
                      <input
                        type="url"
                        value={form.meet_link}
                        onChange={(e) => setForm({ ...form, meet_link: e.target.value })}
                        className="input-field"
                        placeholder="https://meet.google.com/..."
                      />
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="btn-primary flex items-center"
                      disabled={saving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setForm({
                          date: session.date,
                          time: session.time,
                          format: session.format,
                          topic: session.topic || "",
                          meet_link: session.meet_link || ""
                        });
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                    <span><strong>Date:</strong> {formatDate(session.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-gray-500" />
                    <span><strong>Time:</strong> {formatTime(session.time)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    {session.format === 'Video Call' ? (
                      <Video className="h-5 w-5 mr-3 text-blue-500" />
                    ) : (
                      <MapPin className="h-5 w-5 mr-3 text-green-500" />
                    )}
                    <span><strong>Format:</strong> {session.format}</span>
                  </div>
                  
                  {session.topic && (
                    <div className="text-gray-700">
                      <strong>Topic:</strong> {session.topic}
                    </div>
                  )}

                  {session.meet_link && (
                    <div className="pt-2">
                      <a
                        href={session.meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Participants</h2>
              
              <div className="space-y-4">
                {session.participant1_profile && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="font-medium">Participant 1</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">
                          {session.participant1_profile.first_name || 'Student'} {session.participant1_profile.last_name || ''}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{session.participant1_profile.email}</div>
                      {session.participant1_profile.phone_number && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-1" />
                          {session.participant1_profile.phone_number}
                        </div>
                      )}
                      {session.participant1_profile.level && (
                        <div className="text-sm text-gray-600">
                          Level: {session.participant1_profile.level}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {session.participant2_profile && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="font-medium">Participant 2</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">
                          {session.participant2_profile.first_name || 'Student'} {session.participant2_profile.last_name || ''}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{session.participant2_profile.email}</div>
                      {session.participant2_profile.phone_number && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-1" />
                          {session.participant2_profile.phone_number}
                        </div>
                      )}
                      {session.participant2_profile.level && (
                        <div className="text-sm text-gray-600">
                          Level: {session.participant2_profile.level}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
