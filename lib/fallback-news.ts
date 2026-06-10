// Evergreen educational fallback content, shown when the live feed is unavailable.
// One real, verified article per asset — links checked and working (June 2026).
// Items are filtered by the user's selected assets, so the fallback
// stays personalized just like the live feed.

export type FallbackItem = {
  id: string
  title: string
  url: string
  source: string
  topic: string // matches the asset names used in onboarding
}

const FALLBACK_LIBRARY: FallbackItem[] = [
  {
    id: 'fallback-bitcoin',
    title: 'How does Bitcoin work? The official explainer',
    url: 'https://bitcoin.org/en/how-it-works',
    source: 'Bitcoin.org · Evergreen read',
    topic: 'Bitcoin',
  },
  {
    id: 'fallback-ethereum',
    title: 'What is Ethereum? A complete guide',
    url: 'https://ethereum.org/what-is-ethereum/',
    source: 'Ethereum.org · Evergreen read',
    topic: 'Ethereum',
  },
  {
    id: 'fallback-solana',
    title: 'What is Solana? An introduction to the network',
    url: 'https://solana.com/learn/what-is-solana',
    source: 'Solana.com · Evergreen read',
    topic: 'Solana',
  },
  {
    id: 'fallback-cardano',
    title: 'What is Cardano (ADA)? A guide for beginners',
    url: 'https://blog.binance.us/what-is-ada/',
    source: 'Binance.US · Evergreen read',
    topic: 'Cardano',
  },
  {
    id: 'fallback-dogecoin',
    title: "What is Dogecoin and how does it work? A beginner's guide",
    url: 'https://www.theblock.co/learn/249526/what-is-dogecoin-and-how-does-it-work-a-beginners-guide-to-doge-cryptocurrency',
    source: 'The Block · Evergreen read',
    topic: 'Dogecoin',
  },
  {
    id: 'fallback-xrp',
    title: 'What is XRP (Ripple)? A beginner-friendly guide',
    url: 'https://www.coingecko.com/learn/what-is-xrp-ripple',
    source: 'CoinGecko · Evergreen read',
    topic: 'XRP',
  },
]

// Returns fallback items matching the user's assets.
// If somehow nothing matches, returns the full library so the section is never empty.
export function getFallbackNews(assets: string[]) {
  const matching = FALLBACK_LIBRARY.filter((item) => assets.includes(item.topic))
  return matching.length > 0 ? matching : FALLBACK_LIBRARY
}