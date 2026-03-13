"use client"

import { Fragment, useRef, type UIEvent } from "react"

import type { HighlightToken } from "@/lib/script-highlighting"

const highlightedTextareaClass =
  "absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent px-4 py-3 font-mono text-xs leading-relaxed text-transparent caret-foreground outline-none placeholder:text-muted-foreground selection:bg-accent/20 selection:text-transparent"

const tokenClassNames: Record<HighlightToken["type"], string> = {
  plain: "text-foreground",
  function: "text-primary font-semibold",
  identifier: "text-chart-4",
  string: "text-chart-2",
  number: "text-chart-3",
  keyword: "text-chart-1 font-medium",
  tag: "text-primary font-medium",
  error: "text-destructive font-medium",
  punctuation: "text-muted-foreground",
}

type HighlightedTextareaProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  tokenizeLine: (line: string) => HighlightToken[]
}

export function HighlightedTextarea({
  value,
  onChange,
  placeholder,
  tokenizeLine,
}: HighlightedTextareaProps) {
  const overlayRef = useRef<HTMLPreElement>(null)

  const handleScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    const highlightedCode = overlayRef.current
    if (!highlightedCode) {
      return
    }

    const { scrollLeft, scrollTop } = event.currentTarget
    highlightedCode.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`
  }

  const lines = value.split("\n")

  return (
    <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-card focus-within:ring-2 focus-within:ring-ring/50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
      >
        <pre
          ref={overlayRef}
          className="min-h-full min-w-full px-4 py-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words"
        >
          {value === "" ? (
            <span className="text-transparent"> </span>
          ) : (
            lines.map((line, lineIndex) => (
              <Fragment key={`${lineIndex}-${line.length}`}>
                {tokenizeLine(line).map((token, tokenIndex) => (
                  <span
                    key={`${lineIndex}-${tokenIndex}-${token.value}`}
                    className={tokenClassNames[token.type]}
                  >
                    {token.value}
                  </span>
                ))}
                {lineIndex < lines.length - 1 ? "\n" : null}
              </Fragment>
            ))
          )}
        </pre>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={handleScroll}
        className={highlightedTextareaClass}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  )
}
