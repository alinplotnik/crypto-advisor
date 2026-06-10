import { createClient } from '@/lib/supabase/server'
import VoteButtons from './VoteButtons'
import { COINGECKO_IDS, fetchPrices, type PriceData } from '@/lib/coingecko'

// This component generates and displays a personalized "AI Insight of the Day" for the user based on their investor type and selected assets. It uses the Gemini API (free tier) to generate the insight, caches it in the database to avoid regenerating multiple times a day, and allows users to upvote or downvote the insight for feedback.
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const MAX_RETRIES = 3

// Builds a prompt grounded in today's date and live CoinGecko numbers, so the
// insight changes every day and reflects real market moves instead of generic
// evergreen advice (the model has no web access, so we feed it the facts).
function buildPrompt(investorType: string, assets: string[], prices: PriceData | null) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const snapshot = prices
    ? assets
        .map((asset) => {
          const data = prices[COINGECKO_IDS[asset]]
          if (!data) return null
          const change = data.usd_24h_change
          return `- ${asset}: $${data.usd.toLocaleString()} (${change >= 0 ? '+' : ''}${change.toFixed(2)}% in the last 24h)`
        })
        .filter(Boolean)
        .join('\n')
    : null

  return [
    `Today is ${today}.`,
    '',
    'You are a crypto market educator writing a short "insight of the day" for an investor with this profile:',
    `- Investor type: ${investorType}`,
    `- Assets they follow: ${assets.join(', ')}`,
    ...(snapshot ? ['', 'Live market snapshot (CoinGecko, last 24 hours):', snapshot] : []),
    '',
    "Write today's insight in 2-4 sentences:",
    snapshot
      ? '- Ground it in the actual numbers above: mention at least one concrete price or percentage move and what it could mean for this investor.'
      : '- Make it relevant to current market dynamics for these assets.',
    `- Tailor the takeaway to how a ${investorType} thinks and acts (their time horizon, habits and risks).`,
    '- Make it specific to today, not generic advice that could apply to any day.',
    '- Be practical and educational. Do not give direct financial advice or price predictions. Do not use markdown.',
  ].join('\n')
}

async function generateInsight(investorType: string, assets: string[]) {
  // Fail fast with a clear log instead of getting an opaque 403 from Gemini
  if (!process.env.GEMINI_API_KEY) {
    console.error('AiInsight: GEMINI_API_KEY is not set')
    return null
  }

  // Live prices make the insight fact-based and different each day.
  // Non-fatal if CoinGecko is down: we fall back to a profile-only prompt.
  const prices = await fetchPrices(assets)
  const prompt = buildPrompt(investorType, assets, prices)

  // Retry on 503 (model overloaded), same approach as the email-scorer lambda
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        // Give up after 20 seconds instead of hanging forever
        signal: AbortSignal.timeout(20000),
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      })

      if (res.status === 503 && attempt < MAX_RETRIES - 1) {
        // Model temporarily overloaded — wait 2 seconds and retry
        await new Promise((resolve) => setTimeout(resolve, 2000))
        continue
      }

      if (!res.ok) {
        // Surface the status and body so rate limits (429) vs auth errors (403) are diagnosable in logs
        const body = await res.text().catch(() => '')
        console.error(`AiInsight: Gemini responded ${res.status}: ${body.slice(0, 300)}`)
        return null
      }

      const data = await res.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      if (!content) {
        console.error('AiInsight: Gemini returned no content', JSON.stringify(data).slice(0, 300))
        return null
      }
      return content
    } catch (err) {
      // Timeout, network failure, or invalid JSON
      console.error(`AiInsight: Gemini request failed (attempt ${attempt + 1}/${MAX_RETRIES})`, err)
      if (attempt === MAX_RETRIES - 1) return null
    }
  }
  return null
}

export default async function AiInsight({
  userId,
  investorType,
  assets,
}: {
  userId: string
  investorType: string
  assets: string[]
}) {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  // Reuse today's insight if it already exists.
  // maybeSingle() so "no row yet" (the normal first visit of the day) isn't treated as an error.
  const { data: existing, error: readError } = await supabase
    .from('insights')
    .select('content')
    .eq('user_id', userId)
    .eq('insight_date', today)
    .maybeSingle()

  if (readError) {
    // Not fatal: fall through and try to generate a fresh insight anyway
    console.error('AiInsight: failed to read cached insight', readError)
  }

  let insight = existing?.content ?? null

  // Otherwise generate a new one and store it
  if (!insight) {
    insight = await generateInsight(investorType, assets)
    if (insight) {
      // Upsert: two concurrent page loads can both generate before either has saved,
      // and a plain insert would violate the unique (user_id, insight_date) constraint
      const { error: writeError } = await supabase
        .from('insights')
        .upsert(
          { user_id: userId, insight_date: today, content: insight },
          { onConflict: 'user_id,insight_date', ignoreDuplicates: true }
        )
      if (writeError) {
        // Still show the generated insight; it just won't be cached for the next load
        console.error('AiInsight: failed to cache insight', writeError)
      }
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-card-foreground">🤖 AI Insight of the Day</h2>
        <VoteButtons section="insight" contentId={`insight-${today}`} />
      </div>

      {insight ? (
        <>
          <p className="text-foreground">{insight}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Generated by AI for educational purposes — not financial advice.
          </p>
        </>
      ) : (
        <p className="text-muted-foreground">
          Couldn&apos;t generate today&apos;s insight. Check back soon.
        </p>
      )}
    </section>
  )
}