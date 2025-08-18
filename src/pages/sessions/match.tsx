"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { getAllProfiles, isProfileComplete, getProfileCompletionPercentage } from "../../lib/profileUtils";
import { checkExistingMatchOnDate } from "../../lib/matchAlgorithm";
import { Profile, Session } from "../../types";
import {
  Users,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  Video,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";
import AuthGuard from "../../components/AuthGuard";
import Navbar from "../../components/Navbar";

export default function MatchPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicatePartner, setDuplicatePartner] = useState<Profile | null>(
    null
  );
  const [profileComplete, setProfileComplete] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Get current user's profile
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setCurrentUser(currentProfile);
        
        // Check if profile is complete
        const isComplete = isProfileComplete(currentProfile);
        const completion = getProfileCompletionPercentage(currentProfile);
        setProfileComplete(isComplete);
        setCompletionPercentage(completion);

        // Only load other profiles if current user's profile is complete
        if (isComplete) {
          // Get all other profiles (excluding current user)
          const allProfiles = await getAllProfiles();
          const otherProfiles = allProfiles.filter((p) => p.id !== user.id);
          setProfiles(otherProfiles);

          // Get user's sessions
          const { data: userSessions } = await supabase
            .from("sessions")
            .select("*")
            .or(`participant1.eq.${user.id},participant2.eq.${user.id}`)
            .order("date", { ascending: false })
            .order("time", { ascending: false });

          setSessions(userSessions || []);
        }
      }
    } catch (error) {
      console.error("Error loading match data:", error);
      setError("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (partnerId: string) => {
    try {
      //console.log(partnerId, "partnerId");
      setMatching(true);
      setError("");
      setShowDuplicateAlert(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to create a match");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const partner = profiles.find((p) => p.id === partnerId);

      // console.log(partner, 'partner')// Check for existing match on the same day with this specific partner
      const hasExistingMatch = checkExistingMatchOnDate(
        sessions,
        user.id,
        partnerId,
        today
      );
      // console.log(hasExistingMatch, "hasExistingMatch");
      /*if (hasExistingMatch && partner) {
        setDuplicatePartner(partner);
        setShowDuplicateAlert(true);
        setMatching(false);
        return;
      }*/

      // Instead of creating session immediately, redirect to session creation with partner info
      if (partner) {
        // Store partner info in sessionStorage for the session creation form
        sessionStorage.setItem(
          "selectedPartner",
          JSON.stringify({
            id: partner.id,
            name: `${partner.first_name || "Student"} ${
              partner.last_name || ""
            }`,
            email: partner.email,
            phone: partner.phone_number,
          })
        );

        // Redirect to session creation with partner pre-filled
        router.push("/sessions/create-with-partner");
      }
    } catch (err) {
      setError("Failed to process match");
    } finally {
      setMatching(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId);

      if (error) {
        setError("Failed to delete session");
      } else {
        setSuccess("Session deleted successfully!");
        await loadData();
      }
    } catch (err) {
      setError("Failed to delete session");
    }
  };

  const getCompatibilityScore = (profile: Profile) => {
    if (!currentUser) return 0;

    let score = 0;

    // Level compatibility
    if (currentUser.level && profile.level) {
      if (currentUser.level === profile.level) score += 2;
      else if (
        (currentUser.level === "Beginner" && profile.level === "Medium") ||
        (currentUser.level === "Medium" && profile.level === "Advanced") ||
        (currentUser.level === "Advanced" && profile.level === "Medium")
      )
        score += 1;
    }

    // Interest compatibility
    if (currentUser.consulting && profile.consulting) score += 1;
    if (currentUser.mna && profile.mna) score += 1;
    if (currentUser.quant && profile.quant) score += 1;

    return score;
  };

  const sortedProfiles = profiles.sort(
    (a, b) => getCompatibilityScore(b) - getCompatibilityScore(a)
  );

  // Check if a session is completed (past date)
  const isSessionCompleted = (sessionDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    return sessionDate < today;
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

  // Show profile completion requirement if profile is incomplete
  if (!profileComplete) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Navbar />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="card text-center py-12">
              <div className="mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Complete Your Profile First
                </h1>
                <p className="text-gray-600 mb-6">
                  To find study partners, you need to complete your profile with your skills and interests.
                </p>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                  <span className="text-sm text-gray-500">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {currentUser && (
                <div className="mb-8 text-left max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Missing Information:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {!currentUser.first_name && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        First Name
                      </li>
                    )}
                    {!currentUser.last_name && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        Last Name
                      </li>
                    )}
                    {!currentUser.level && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        Skill Level
                      </li>
                    )}
                    {!currentUser.consulting && !currentUser.mna && !currentUser.quant && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        At least one interest area
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                <a href="/profile" className="btn-primary inline-block">
                  Complete Profile
                </a>
                <div>
                  <a href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                    ← Back to Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Study Partners
            </h1>
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

          {showDuplicateAlert && duplicatePartner && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Already matched today!
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    You already have a session scheduled with{" "}
                    {duplicatePartner.first_name || "this student"} today. You
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

          {!currentUser ? (
            <div className="card text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Complete Your Profile
              </h2>
              <p className="text-gray-600 mb-4">
                Please complete your profile to find study partners
              </p>
              <a href="/profile" className="btn-primary">
                Set Up Profile
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Available Partners */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Available Partners
                </h2>

                {profiles.length === 0 ? (
                  <div className="card text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Partners Available
                    </h3>
                    <p className="text-gray-600">
                      No other students have completed their profiles yet
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedProfiles.map((profile) => {
                      const compatibilityScore = getCompatibilityScore(profile);
                      const interests = [];
                      if (profile.consulting) interests.push("Consulting");
                      if (profile.mna) interests.push("M&A");
                      if (profile.quant) interests.push("Quantitative");

                      return (
                        <div
                          key={profile.id}
                          className="card hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {profile.first_name || "Student"}{" "}
                                {profile.last_name || ""}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {profile.email}
                              </p>
                              {profile.phone_number && (
                                <p className="text-sm text-gray-500">
                                  {profile.phone_number}
                                </p>
                              )}
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
                                <span className="font-medium">Level:</span>{" "}
                                {profile.level}
                              </div>
                            )}

                            {interests.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium">Interests:</span>{" "}
                                {interests.join(", ")}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleMatch(profile.id)}
                            disabled={matching}
                            className="w-full btn-primary disabled:opacity-50 flex items-center justify-center"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {matching
                              ? "Processing..."
                              : "Match & Create Session"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Your Sessions */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Your Sessions
                </h2>

                {sessions.length === 0 ? (
                  <div className="card text-center py-6">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No sessions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session) => {
                      const isCompleted = isSessionCompleted(session.date);
                      return (
                        <div 
                          key={session.id} 
                          className={`card p-4 ${isCompleted ? 'bg-gray-50 border-gray-200' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              {session.date}
                              {isCompleted && (
                                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <a
                                href={`/sessions/${session.id}`}
                                className={`${isCompleted ? 'text-gray-500 hover:text-gray-700' : 'text-blue-600 hover:text-blue-800'}`}
                              >
                                <Edit className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => handleDeleteSession(session.id)}
                                className={`${isCompleted ? 'text-gray-500 hover:text-gray-700' : 'text-red-600 hover:text-red-800'}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className={`flex items-center text-sm mb-1 ${isCompleted ? 'text-gray-500' : 'text-gray-600'}`}>
                            <Clock className="h-4 w-4 mr-1" />
                            {session.time}
                          </div>

                          <div className={`flex items-center text-sm mb-2 ${isCompleted ? 'text-gray-500' : 'text-gray-600'}`}>
                            {session.format === "Video Call" ? (
                              <Video className="h-4 w-4 mr-1" />
                            ) : (
                              <MapPin className="h-4 w-4 mr-1" />
                            )}
                            {session.format}
                          </div>

                          {session.topic && (
                            <p className={`text-sm ${isCompleted ? 'text-gray-500' : 'text-gray-700'}`}>
                              {session.topic}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {sessions.length > 5 && (
                      <a
                        href="/sessions"
                        className="block text-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        View all {sessions.length} sessions →
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
