import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CoinPrices from '@/components/CoinPrices'
import MarketNews from '@/components/MarketNews'

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
        <CoinPrices assets={prefs.assets} />
        <MarketNews assets={prefs.assets} />
        {/* TODO: AiInsight section */}
        {/* TODO: CryptoMeme section */}
      </div>
    </main>
  )
}