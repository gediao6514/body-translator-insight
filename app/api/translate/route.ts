import { NextResponse } from 'next/server'
import { retrieveBlocks, formatRagContext } from '@/lib/rag'
import { generateWithGemini } from '@/lib/gemini'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { question } = await req.json()
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ result: '请输入有效问题', sources: [] }, { status: 400 })
    }
    const blocks = await retrieveBlocks(question, 5)
    const ragContext = formatRagContext(blocks)
    const text = await generateWithGemini(ragContext, question)
    const sources = blocks.map(b => ({ id: b.id, category: b.category }))
    return NextResponse.json({ result: text, sources })
  } catch (e) {
    return NextResponse.json({ result: '服务暂不可用，请稍后重试', sources: [] }, { status: 500 })
  }
}