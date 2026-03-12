import { NextRequest, NextResponse } from 'next/server'
import {parse} from './parser'

export async function POST(req: NextRequest) {
	const { text } = await req.json()
	const result = parse(text)
	return NextResponse.json({result})
}