// Brand block from the CryptoPulse design: square neon-green badge with a
// Bitcoin sign, monospace uppercase wordmark, and a green underline accent.
export default function Brand() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary font-mono text-lg font-bold text-primary-foreground">
          ₿
        </span>
        <span className="font-mono text-sm font-semibold tracking-[0.2em] text-primary">
          CRYPTOPULSE.AI
        </span>
      </div>
      <div className="mt-3 h-0.5 w-24 bg-primary" />
    </div>
  )
}
