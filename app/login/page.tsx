'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// This is the login page where existing users can enter their email and password to log in. It handles the login process using Supabase authentication and redirects users to the dashboard upon successful login.
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-gray-900 p-8 shadow-xl"
      >
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>

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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg bg-gray-800 p-3 text-white placeholder-gray-500"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 p-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-sm text-gray-400">
          New here?{' '}
          <Link href="/signup" className="text-emerald-400 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </main>
  )
}