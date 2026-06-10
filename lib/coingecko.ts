// Shared CoinGecko helpers: maps onboarding asset names to CoinGecko coin ids
// and fetches live prices with 24h change. Used by both the Coin Prices section
// and the AI Insight prompt (so the insight is grounded in today's real numbers).

export const COINGECKO_IDS: Record<string, string> = {
  Bitcoin: 'bitcoin',
  Ethereum: 'ethereum',
  Solana: 'solana',
  Cardano: 'cardano',
  Dogecoin: 'dogecoin',
  XRP: 'ripple',
}

export type PriceData = Record<string, { usd: number; usd_24h_change: number }>

export async function fetchPrices(assets: string[]): Promise<PriceData | null> {
  const ids = assets.map((a) => COINGECKO_IDS[a]).filter(Boolean)
  if (ids.length === 0) return null

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } } // cache for 60s to respect rate limits
    )
    if (!res.ok) {
      console.error(`CoinGecko responded ${res.status}`)
      return null
    }
    return await res.json()
  } catch (err) {
    console.error('CoinGecko request failed', err)
    return null
  }
}
