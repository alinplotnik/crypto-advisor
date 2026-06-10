'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'

// Catches uncaught exceptions thrown while rendering the dashboard
// (e.g. an unexpected Supabase failure) and shows a recoverable fallback
// instead of the default Next.js error screen.
export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('Dashboard render failed', error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <section className="max-w-md rounded-2xl bg-gray-900 p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold text-white">
          Something went wrong
        </h2>
        <p className="mb-4 text-gray-400">
          We couldn&apos;t load your dashboard. Please try again.
        </p>
        <button
          onClick={() => unstable_retry()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
        >
          Try again
        </button>
      </section>
    </main>
  )
}
