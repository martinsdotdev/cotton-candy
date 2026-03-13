"use client"

import { useRef, useEffect } from "react"
import type { Identifica } from "@/app/api/parser"

const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 200
const SIZE = 28

function rand(min: number, max: number) {
	return Math.floor(Math.random() * (max - min) + min)
}

function drawSquare(ctx: CanvasRenderingContext2D, x: number, y: number) {
	ctx.fillRect(x - SIZE / 2, y - SIZE / 2, SIZE, SIZE)
}

function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number) {
	ctx.fillRect(x - SIZE / 2, y - SIZE / 4, SIZE, SIZE / 2)
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number) {
	ctx.beginPath()
	ctx.arc(x, y, SIZE / 2, 0, 2 * Math.PI)
	ctx.fill()
}

function drawEllipse(ctx: CanvasRenderingContext2D, x: number, y: number) {
	ctx.beginPath()
	ctx.ellipse(x, y, SIZE / 2, SIZE / 3, 0, 0, 2 * Math.PI)
	ctx.fill()
}

function drawPolygon(ctx: CanvasRenderingContext2D, x: number, y: number, sides: number) {
	ctx.beginPath()
	for (let i = 0; i < sides; i++) {
		const angle = (2 * Math.PI * i / sides) - Math.PI / 2
		const px = x + (SIZE / 2) * Math.cos(angle)
		const py = y + (SIZE / 2) * Math.sin(angle)
		if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
	}
	ctx.closePath()
	ctx.fill()
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number) {
	const outer = SIZE / 2
	const inner = SIZE / 4
	ctx.beginPath()
	for (let i = 0; i < 10; i++) {
		const r = i % 2 === 0 ? outer : inner
		const angle = (Math.PI * i / 5) - Math.PI / 2
		const px = x + r * Math.cos(angle)
		const py = y + r * Math.sin(angle)
		if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
	}
	ctx.closePath()
	ctx.fill()
}

const FORM_DRAW: Record<string, (ctx: CanvasRenderingContext2D, x: number, y: number) => void> = {
	quadrado: drawSquare,
	retangulo: drawRect,
	circulo: drawCircle,
	elipse: drawEllipse,
	triangulo: (ctx, x, y) => drawPolygon(ctx, x, y, 3),
	pentagono: (ctx, x, y) => drawPolygon(ctx, x, y, 5),
	hexagono: (ctx, x, y) => drawPolygon(ctx, x, y, 6),
	estrela: drawStar,
}

type Props = { user: Identifica }

export function CottonCanvas({ user }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const colorRef = useRef(`hsl(${rand(0, 360)}, 70%, 55%)`)

	useEffect(() => {
		const canvas = canvasRef.current!
		const ctx = canvas.getContext('2d')!
		ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
		ctx.fillStyle = colorRef.current
		ctx.font = '13px monospace'

		const NAME_H = 24
		ctx.fillText(user.nome, 8, 16)

		const n = user.instrucao.length
		const cols = Math.max(1, Math.ceil(Math.sqrt(n)))
		const rows = Math.max(1, Math.ceil(n / cols))
		const cellW = CANVAS_WIDTH / cols
		const cellH = (CANVAS_HEIGHT - NAME_H) / rows

		user.instrucao.forEach((form, i) => {
			const col = i % cols
			const row = Math.floor(i / cols)
			const x = col * cellW + cellW / 2
			const y = NAME_H + row * cellH + cellH / 2
			FORM_DRAW[form]?.(ctx, x, y)
		})
	}, [user.nome, user.instrucao])

	return (
		<canvas
			ref={canvasRef}
			width={CANVAS_WIDTH}
			height={CANVAS_HEIGHT}
			className="rounded border border-border"
		/>
	)
}
