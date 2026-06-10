import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CoinPrices from '@/components/CoinPrices'
import MarketNews from '@/components/MarketNews'
import AiInsight from '@/components/AiInsight'
import CryptoMeme from '@/components/CryptoMeme'
import { Suspense } from 'react'


// This is the main dashboard page that users see after logging in and completing onboarding. It checks for user authentication and preferences, and displays personalized content based on the user's selected interests and investor type.
export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load the user's preferences; force onboarding if missing
  const { data: prefs } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!prefs) redirect('/onboarding')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen bg-gray-950 p-4 md:p-8">
      <header className="mx-auto mb-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-white">
          Hey {profile?.name || 'there'} 👋
        </h1>
        <p className="text-gray-400">
          Your daily crypto briefing, tailored for a {prefs.investor_type}
        </p>
      </header>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            <Suspense fallback={<SectionSkeleton title="💰 Coin Prices" />}>
                <CoinPrices assets={prefs.assets} />
            </Suspense>
            <Suspense fallback={<SectionSkeleton title="📰 Market News" />}>
                <MarketNews assets={prefs.assets} />
            </Suspense>
            <Suspense
                fallback={
                    <SectionSkeleton
                        title="🤖 AI Insight of the Day"
                        message="Our AI is writing today's insight for you — this can take a few seconds…"
                    />
                }
            >
                <AiInsight userId={user.id} investorType={prefs.investor_type} assets={prefs.assets} />
            </Suspense>
            <Suspense fallback={<SectionSkeleton title="😂 Fun Crypto Meme" />}>
                <CryptoMeme />
            </Suspense>
        </div>
    </main>
  )
}

// Gray placeholder shown while a section is still loading.
// Optional message tells the user what's happening (e.g. AI generation takes a few seconds).
function SectionSkeleton({ title, message }: { title: string; message?: string }) {
  return (
    <section className="rounded-2xl bg-gray-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
      {message && <p className="mb-3 text-sm text-gray-400">{message}</p>}
      <div className="space-y-3">
        <div className="h-4 animate-pulse rounded bg-gray-800" />
        <div className="h-4 animate-pulse rounded bg-gray-800" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-800" />
      </div>
    </section>
  )
}