import { CottonCanvas } from "@/components/cottonCanvas"
import type { ParseResult } from "@/app/api/parser"


type OutputProps = {
  results: ParseResult | null
}

export function Output({ results }: OutputProps) {
  if (results == null || results.users.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-sm text-muted-foreground italic">
          No results yet.
        </p>
      </div>
    )
  }

    return (
	<>
	    {results.users.map((user, i) => <CottonCanvas key={i} user={user}/>)}
	</>
    )
}
