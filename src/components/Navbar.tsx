'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { User, LogOut, Calendar, Users, Settings } from 'lucide-react'
import Image from 'next/image'

export default function Navbar() {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center">
                <Image
                  src="/assets/HEC.png"
                  alt="MBB Logo"
                  width={38}
                  height={38}
                  className="w-8 h-8"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">HEC Sessions</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Calendar className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/sessions" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Users className="h-4 w-4" />
                <span>Sessions</span>
              </Link>
              <Link href="/sessions/match" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Users className="h-4 w-4" />
                <span>Match</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/profile" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <User className="h-4 w-4" />
              <span className="hidden md:block">Profile</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:block">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
