'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// This is the signup page where new users can create an account. It includes a form for entering name, email, and password, and handles the signup process using Supabase authentication.
export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      // Stored in user metadata; the DB trigger copies it to profiles
      options: { data: { name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // New users always go through onboarding first
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-gray-900 p-8 shadow-xl"
      >
        <h1 className="text-2xl font-bold text-white">Create account</h1>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg bg-gray-800 p-3 text-white placeholder-gray-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg bg-gray-800 p-3 text-white placeholder-gray-500"
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-lg bg-gray-800 p-3 text-white placeholder-gray-500"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 p-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Sign up'}
        </button>

        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  )
}