"use client"

import { useEffect, useRef, type MutableRefObject } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type EditorState,
} from "lexical"

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
  value?: string
  placeholder?: string
  onChange?: (state: EditorState) => void
  onTextChange?: (text: string) => void
  className?: string
  editable?: boolean
}

function normalizeValue(value: string): string {
  return value.replace(/\r\n?/g, "\n")
}

function readPlainText(): string {
  const root = $getRoot()
  return root
    .getChildren()
    .map((node) => node.getTextContent())
    .join("\n")
}

function SyncTextPlugin({
  value,
  isSyncingRef,
}: {
  value: string
  isSyncingRef: MutableRefObject<boolean>
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const normalizedValue = normalizeValue(value)
    let didSync = false

    editor.update(() => {
      const root = $getRoot()

      if (readPlainText() === normalizedValue) {
        return
      }

      didSync = true
      isSyncingRef.current = true
      root.clear()

      const lines = normalizedValue === "" ? [""] : normalizedValue.split("\n")
      for (const line of lines) {
        const paragraph = $createParagraphNode()
        if (line !== "") {
          paragraph.append($createTextNode(line))
        }
        root.append(paragraph)
      }
    })

    if (didSync) {
      queueMicrotask(() => {
        isSyncingRef.current = false
      })
    }
  }, [editor, isSyncingRef, value])

  return null
}

export function Editor({
  value = "",
  placeholder = "Start typing...",
  onChange,
  onTextChange,
  className,
  editable = true,
}: EditorProps) {
  const isSyncingRef = useRef(false)

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
        <SyncTextPlugin value={value} isSyncingRef={isSyncingRef} />
        <OnChangePlugin
          onChange={(state) => {
            onChange?.(state)
            if (onTextChange) {
              if (isSyncingRef.current) {
                return
              }

              state.read(() => {
                onTextChange(readPlainText())
              })
            }
          }}
        />
      </div>
    </LexicalComposer>
  )
}
