type OutputProps = {
  results: string[]
}

export function Output({ results }: OutputProps) {
  if (results.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-sm text-muted-foreground italic">
          No results yet.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {results.map((result, i) => (
        <li
          key={i}
          className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm"
        >
          {result}
        </li>
      ))}
    </ul>
  )
}
