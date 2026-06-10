'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Signs the user out via Supabase and sends them back to the login page.
export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-accent disabled:opacity-50"
    >
      {loading ? 'Logging out...' : 'Log out'}
    </button>
  )
}
