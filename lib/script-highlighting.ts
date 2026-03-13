const validTagNames = new Set(["identifica", "instrucao"])

const dslTokenPattern =
  /'(?:\\.|[^'\\])*'|\b(?:true|false|null|draw|identifica|instrucao)\b|\b\d+\b|[()[\]{},;:]/g
const taggedTokenPattern = /#\{[^}\n]*\}|\{[^}\n]*\}#/g

export type HighlightToken = {
  value: string
  type:
    | "plain"
    | "function"
    | "identifier"
    | "string"
    | "number"
    | "keyword"
    | "tag"
    | "error"
    | "punctuation"
}

function classifyDslToken(token: string): HighlightToken["type"] {
  if (token === "draw") return "function"
  if (token === "identifica" || token === "instrucao") return "identifier"
  if (token === "true" || token === "false" || token === "null") return "keyword"
  if (/^\d+$/.test(token)) return "number"
  if (token.startsWith("'")) return "string"
  return "punctuation"
}

function buildTokenizeLine(
  pattern: RegExp,
  matchToTokens: (match: string, line: string, endIndex: number) => HighlightToken[]
): (line: string) => HighlightToken[] {
  return (line) => {
    const tokens: HighlightToken[] = []
    let lastIndex = 0

    for (const match of line.matchAll(pattern)) {
      const value = match[0]
      const startIndex = match.index ?? 0

      if (startIndex > lastIndex) {
        tokens.push({ value: line.slice(lastIndex, startIndex), type: "plain" })
      }

      tokens.push(...matchToTokens(value, line, startIndex + value.length))
      lastIndex = startIndex + value.length
    }

    if (lastIndex < line.length) {
      tokens.push({ value: line.slice(lastIndex), type: "plain" })
    }

    return tokens
  }
}

export const tokenizeDslLine = buildTokenizeLine(
  dslTokenPattern,
  (value) => [{ value, type: classifyDslToken(value) }]
)

export const tokenizeTaggedLine = buildTokenizeLine(
  taggedTokenPattern,
  (value) => {
    const isClosingTag = value.startsWith("{")
    const prefix = isClosingTag ? "{" : "#{"
    const suffix = isClosingTag ? "}#" : "}"
    const tagName = value.slice(prefix.length, value.length - suffix.length)
    return [
      { value: prefix, type: "tag" },
      { value: tagName, type: validTagNames.has(tagName) ? "identifier" : "error" },
      { value: suffix, type: "tag" },
    ]
  }
)
