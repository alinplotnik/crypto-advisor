import VoteButtons from './VoteButtons'

// This component shows a fun crypto meme that changes on every dashboard load.
// Primary source is meme-api.com (a free wrapper around Reddit — direct Reddit
// scraping returns 403 from server IPs). If it's down or returns nothing usable,
// we fall back to memes bundled in /public/memes so the section never breaks.

type Meme = {
  title: string
  url: string
  postLink: string | null
}

type MemeApiPost = {
  title: string
  url: string
  postLink: string
  nsfw: boolean
  spoiler: boolean
}

const FALLBACK_MEMES: Meme[] = [
  { title: 'how it feels rn:', url: '/memes/fallback-1.png', postLink: null },
  {
    title: 'Banks really said "that\'ll be 5 business days" with a straight face',
    url: '/memes/fallback-2.png',
    postLink: null,
  },
  { title: "I don't check prices, prices check me.", url: '/memes/fallback-3.png', postLink: null },
]

function randomFallback(): Meme {
  return FALLBACK_MEMES[Math.floor(Math.random() * FALLBACK_MEMES.length)]
}

async function fetchMeme(): Promise<Meme> {
  try {
    // Ask for a small batch so we can skip NSFW and non-image posts
    const res = await fetch('https://meme-api.com/gimme/cryptocurrencymemes/5', {
      cache: 'no-store', // a fresh meme on every dashboard load
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      console.error(`CryptoMeme: meme-api responded ${res.status}`)
      return randomFallback()
    }

    const data = await res.json()
    const meme = (data.memes as MemeApiPost[] | undefined)?.find(
      (m) => !m.nsfw && !m.spoiler && /\.(jpg|jpeg|png|gif)$/i.test(m.url)
    )
    if (!meme) {
      console.error('CryptoMeme: no usable meme in API response')
      return randomFallback()
    }

    return { title: meme.title, url: meme.url, postLink: meme.postLink }
  } catch (err) {
    // Timeout, network failure, or invalid JSON
    console.error('CryptoMeme: request failed', err)
    return randomFallback()
  }
}

export default async function CryptoMeme() {
  const meme = await fetchMeme()

  return (
    <section className="rounded-2xl bg-gray-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">😂 Fun Crypto Meme</h2>
        {/* Vote on the specific meme, so feedback maps to exact content */}
        <VoteButtons section="meme" contentId={meme.postLink ?? meme.url} />
      </div>

      <p className="mb-3 text-gray-200">{meme.title}</p>
      {/* Plain <img>: meme dimensions are unknown ahead of time and the domain
          varies, so next/image's required sizing/remotePatterns don't fit here */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={meme.url}
        alt={meme.title}
        loading="lazy"
        className="max-h-96 w-full rounded-lg object-contain"
      />
      {meme.postLink && (
        <a
          href={meme.postLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-gray-500 hover:text-gray-300"
        >
          View on Reddit ↗
        </a>
      )}
    </section>
  )
}
