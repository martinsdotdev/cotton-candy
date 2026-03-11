"use client"

import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { $getRoot, type EditorState } from "lexical"

import { cn } from "@/lib/utils"

const theme = {
  paragraph: "mb-1",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
  },
}

type EditorProps = {
  placeholder?: string
  onChange?: (state: EditorState) => void
  onTextChange?: (text: string) => void
  className?: string
  editable?: boolean
}

export function Editor({
  placeholder = "Start typing...",
  onChange,
  onTextChange,
  className,
  editable = true,
}: EditorProps) {
  const initialConfig = {
    namespace: "CottonCandyEditor",
    theme,
    onError: (error: Error) => console.error(error),
    editable,
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={cn(
          "relative rounded-lg border border-border bg-card text-card-foreground",
          className
        )}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="min-h-[200px] px-4 py-3 text-sm leading-relaxed outline-none"
              aria-placeholder={placeholder}
              placeholder={
                <div className="pointer-events-none absolute top-3 left-4 text-sm text-muted-foreground">
                  {placeholder}
                </div>
              }
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <OnChangePlugin
          onChange={(state) => {
            onChange?.(state)
            if (onTextChange) {
              state.read(() => {
                onTextChange($getRoot().getTextContent())
              })
            }
          }}
        />
      </div>
    </LexicalComposer>
  )
}
