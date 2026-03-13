type TaggedPiece = {
  tagName: string | null
  text: string
}

function hasTags(text: string): boolean {
  return /[#$]\{[^}]+\}/.test(text)
}

function mergeTaggedPieces(pieces: TaggedPiece[]): TaggedPiece[] {
  const merged: TaggedPiece[] = []

  for (const piece of pieces) {
    if (piece.text === "" && piece.tagName == null) {
      continue
    }

    const lastPiece = merged.at(-1)
    if (lastPiece != null && lastPiece.tagName === piece.tagName) {
      lastPiece.text += piece.text
      continue
    }

    merged.push({ ...piece })
  }

  return merged
}

function parseTaggedPieces(text: string): TaggedPiece[] | null {
  const pieces: TaggedPiece[] = []
  let position = 0

  while (position < text.length) {
    const openIndex = text.indexOf("#{", position)
    const orphanCloseIndex = text.indexOf("}#", position)

    if (
      orphanCloseIndex !== -1 &&
      (openIndex === -1 || orphanCloseIndex < openIndex)
    ) {
      return null
    }

    if (openIndex === -1) {
      pieces.push({
        tagName: null,
        text: text.slice(position),
      })
      break
    }

    if (openIndex > position) {
      pieces.push({
        tagName: null,
        text: text.slice(position, openIndex),
      })
    }

    const tagEnd = text.indexOf("}", openIndex + 2)
    if (tagEnd === -1) {
      return null
    }

    const tagName = text.slice(openIndex + 2, tagEnd)
    const closeToken = `{${tagName}}#`
    const contentStart = tagEnd + 1
    const closeIndex = text.indexOf(closeToken, contentStart)

    if (closeIndex === -1) {
      return null
    }

    pieces.push({
      tagName,
      text: text.slice(contentStart, closeIndex),
    })

    position = closeIndex + closeToken.length
  }

  return mergeTaggedPieces(pieces)
}

function getEditRange(previousText: string, nextText: string) {
  let start = 0

  while (
    start < previousText.length &&
    start < nextText.length &&
    previousText[start] === nextText[start]
  ) {
    start += 1
  }

  let previousEnd = previousText.length
  let nextEnd = nextText.length

  while (
    previousEnd > start &&
    nextEnd > start &&
    previousText[previousEnd - 1] === nextText[nextEnd - 1]
  ) {
    previousEnd -= 1
    nextEnd -= 1
  }

  return {
    start,
    previousEnd,
    insertedText: nextText.slice(start, nextEnd),
  }
}

function slicePieces(
  pieces: TaggedPiece[],
  start: number,
  end: number
) {
  const left: TaggedPiece[] = []
  const middle: TaggedPiece[] = []
  const right: TaggedPiece[] = []
  let offset = 0

  for (const piece of pieces) {
    const pieceStart = offset
    const pieceEnd = pieceStart + piece.text.length

    if (pieceEnd <= start) {
      left.push(piece)
      offset = pieceEnd
      continue
    }

    if (pieceStart >= end) {
      right.push(piece)
      offset = pieceEnd
      continue
    }

    const leftLength = Math.max(0, start - pieceStart)
    const rightLength = Math.max(0, pieceEnd - end)
    const middleStart = leftLength
    const middleEnd = piece.text.length - rightLength

    if (leftLength > 0) {
      left.push({
        tagName: piece.tagName,
        text: piece.text.slice(0, leftLength),
      })
    }

    if (middleEnd > middleStart) {
      middle.push({
        tagName: piece.tagName,
        text: piece.text.slice(middleStart, middleEnd),
      })
    }

    if (rightLength > 0) {
      right.push({
        tagName: piece.tagName,
        text: piece.text.slice(piece.text.length - rightLength),
      })
    }

    offset = pieceEnd
  }

  return {
    left: mergeTaggedPieces(left),
    middle: mergeTaggedPieces(middle),
    right: mergeTaggedPieces(right),
  }
}

function inferTagName(
  left: TaggedPiece[],
  middle: TaggedPiece[],
  right: TaggedPiece[],
  isInsertion: boolean
): string | null {
  const touchedTagNames = new Set(middle.map((piece) => piece.tagName))

  if (touchedTagNames.size === 1) {
    return middle[0]?.tagName ?? null
  }

  if (isInsertion) {
    const leftTagName = left.at(-1)?.tagName ?? null
    const rightTagName = right[0]?.tagName ?? null

    if (leftTagName != null) {
      return leftTagName
    }

    if (rightTagName != null) {
      return rightTagName
    }
  }

  return null
}

function buildTaggedText(pieces: TaggedPiece[]): string {
  return pieces
    .map((piece) =>
      piece.tagName == null
        ? piece.text
        : `#{${piece.tagName}}${piece.text}{${piece.tagName}}#`
    )
    .join("")
}

export function stripTags(text: string): string {
  return text
    .replace(/#\{[^}]+\}/g, "")
    .replace(/\{[^}]+\}#/g, "")
    .replace(/\$\{[^}]+\}/g, "")
}

export function syncTaggedText(
  currentTagged: string,
  nextNaturalText: string
): string {
  if (!hasTags(currentTagged)) {
    return nextNaturalText
  }

  const parsedPieces = parseTaggedPieces(currentTagged)
  if (parsedPieces == null) {
    return nextNaturalText
  }

  const previousNaturalText = parsedPieces.map((piece) => piece.text).join("")
  const { start, previousEnd, insertedText } = getEditRange(
    previousNaturalText,
    nextNaturalText
  )

  const { left, middle, right } = slicePieces(
    parsedPieces,
    start,
    previousEnd
  )

  const insertedTagName = inferTagName(
    left,
    middle,
    right,
    start === previousEnd
  )

  const nextPieces = mergeTaggedPieces([
    ...left,
    ...(insertedText !== "" || insertedTagName != null
      ? [{ tagName: insertedTagName, text: insertedText }]
      : []),
    ...right,
  ])

  return buildTaggedText(nextPieces)
}
