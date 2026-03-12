"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import { Editor } from "@/components/editor/editor"
import { Script } from "@/components/script"
import { Output } from "@/components/output"

const tabs = ["Input", "Script", "Output"] as const
type Tab = (typeof tabs)[number]

export function Workspace() {
  const [tab, setTab] = useState<Tab>("Input")
  const [tagged, setTagged] = useState("")
  const [dsl, setDsl] = useState("")
  const [results, setResults] = useState<string[]>([])

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
            placeholder="Eu sou o Pedro, gostaria de desenhar um quadrado e depois um círculo."
            onTextChange={async (text) => {
              setTagged(text)
              const res = await fetch("/api", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
              })
              const data = await res.json()
              setResults(data.result.users.map((u: { nome: string; instrucao: string[] }) => `[${u.nome}] ${u.instrucao.join(", ")}`))
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
