import { CottonCanvas } from "@/components/cottonCanvas"


type OutputProps = {
  results: string[]
}

export function Output({ results }: OutputProps) {
    console.log(results)
  if (results.users == null || results.users === 0) {
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
