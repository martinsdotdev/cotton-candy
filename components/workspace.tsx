"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { Editor } from "@/components/editor/editor"
import { Script } from "@/components/script"
import { Output } from "@/components/output"
import type { ParseResult } from "@/app/api/parser"

function formatDsl(result: ParseResult): string {
  const lines: string[] = []
  result.users.forEach((user, i) => {
    user.instrucao.forEach((shape, j) => {
      lines.push(`draw(identifica[${i}],instrucao[${j}],'${shape}');`)
    })
  })
  lines.push("", JSON.stringify(result, null, 2))
  return lines.join("\n")
}

function stripTags(text: string): string {
  return text
    .replace(/#\{[^}]+\}/g, "")
    .replace(/\{[^}]+\}#/g, "")
    .replace(/\$\{[^}]+\}/g, "")
}

function containsTags(text: string): boolean {
  return /[#$]\{[^}]+\}/.test(text)
}

const tabs = ["Input", "Script", "Output"] as const
type Tab = (typeof tabs)[number]

export function Workspace() {
  const [tab, setTab] = useState<Tab>("Input")
  const [naturalText, setNaturalText] = useState("")
  const [tagged, setTagged] = useState("")
  const [dsl, setDsl] = useState("")
  const [results, setResults] = useState<ParseResult | null>(null)

  useEffect(() => {
    setNaturalText(stripTags(tagged))
  }, [tagged])

  useEffect(() => {
    const trimmed = tagged.trim()

    if (trimmed === "") {
      setDsl("")
      setResults(null)
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      try {
        const res = await fetch("/api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: tagged }),
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(`Falha ao gerar script: ${res.status}`)
        }

        const data = await res.json()
        setResults(data.result)
        setDsl(formatDsl(data.result))
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error)
        }
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [tagged])

  return (
    <div className="flex h-full flex-col gap-4">
      <nav className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1">
        {tab === "Input" && (
          <Editor
            className="h-full"
            value={naturalText}
            placeholder="Eu sou o Pedro, gostaria de desenhar um quadrado e depois um círculo."
            onTextChange={(text) => {
              setNaturalText(text)
              setTagged((currentTagged) =>
                containsTags(currentTagged) ? currentTagged : text
              )
            }}
          />
        )}

        {tab === "Script" && (
          <Script
            tagged={tagged}
            dsl={dsl}
            onTaggedChange={setTagged}
            onDslChange={setDsl}
          />
        )}

        {tab === "Output" && <Output results={results} />}
      </div>
    </div>
  )
}
