"use client"

const textareaClass =
  "flex-1 resize-none rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/50"

type ScriptProps = {
  tagged: string
  dsl: string
  onTaggedChange: (text: string) => void
  onDslChange: (code: string) => void
}

export function Script({
  tagged,
  dsl,
  onTaggedChange,
  onDslChange,
}: ScriptProps) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tagged text
          </label>
          <textarea
            value={tagged}
            onChange={(e) => onTaggedChange(e.target.value)}
            className={textareaClass}
            placeholder="I am ~identifica[0]~Pedro~identifica~, I would like to ~instrucao[0]~draw a square~instrucao~."
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Script DSL
          </label>
          <textarea
            value={dsl}
            onChange={(e) => onDslChange(e.target.value)}
            className={textareaClass}
            placeholder={"draw(instrucao[0],identifica[0],'square');"}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}
