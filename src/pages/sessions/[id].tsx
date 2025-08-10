"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabaseClient";
import { SessionWithParticipants } from "../../types";
import { formatDate, formatTime } from "../../lib/dateUtils";
import { Save, Link as LinkIcon } from "lucide-react";
import AuthGuard from "../../components/AuthGuard";
import Navbar from "../../components/Navbar";

export default function SessionDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState<SessionWithParticipants | null>(null);
  const [meetLink, setMeetLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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

    setSession((data as any) || null);
    setMeetLink(data?.meet_link || "");
    setLoading(false);
  };

  const saveMeetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase
      .from("sessions")
      .update({ meet_link: meetLink || null })
      .eq("id", id);
    setSaving(false);
    await load();
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
            <div className="text-gray-700">
              <div><strong>Date:</strong> {formatDate(session.date)}</div>
              <div><strong>Time:</strong> {formatTime(session.time)}</div>
              <div><strong>Format:</strong> {session.format}</div>
              {session.topic && <div><strong>Topic:</strong> {session.topic}</div>}
            </div>

            <form onSubmit={saveMeetLink} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Meet Link (paste manually)</label>
              <input
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                className="input-field"
                placeholder="https://meet.google.com/..."
              />
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Link'}
              </button>
            </form>

            {session.meet_link && (
              <a href={session.meet_link} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center">
                <LinkIcon className="h-4 w-4 mr-2" />
                Open Meet
              </a>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
