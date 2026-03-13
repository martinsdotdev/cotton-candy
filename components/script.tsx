"use client"

import { HighlightedTextarea } from "@/components/highlighted-textarea"
import {
  tokenizeDslLine,
  tokenizeTaggedLine,
} from "@/lib/script-highlighting"

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
          <HighlightedTextarea
            value={tagged}
            onChange={onTaggedChange}
            placeholder="I am #{identifica}Pedro{identifica}#, I would like to #{instrucao}draw a square{instrucao}#."
            tokenizeLine={tokenizeTaggedLine}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Script DSL
          </label>
          <HighlightedTextarea
            value={dsl}
            onChange={onDslChange}
            placeholder="draw(instrucao[0],identifica[0],'square');"
            tokenizeLine={tokenizeDslLine}
          />
        </div>
      </div>
    </div>
  )
}
