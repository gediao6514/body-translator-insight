import { NextResponse } from 'next/server'
import { retrieveBlocks, formatRagContext } from '@/lib/rag'
import { generateWithGemini } from '@/lib/gemini'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const started = Date.now()
    let ip = req.headers.get('x-forwarded-for') || ''
    if (ip.includes(',')) ip = ip.split(',')[0].trim()

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m') })
      const { success, remaining, reset } = await ratelimit.limit(ip || 'anon')
      if (!success) {
        return NextResponse.json(
          { result: '请求过于频繁，请稍后再试', sources: [] },
          { status: 429, headers: { 'x-ratelimit-remaining': String(remaining), 'x-ratelimit-reset': String(reset) } },
        )
      }
      await redis.incr(`metrics:translate:requests:${new Date().toISOString().slice(0, 10)}`)
    }
    const { question } = await req.json()
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ result: '请输入有效问题', sources: [] }, { status: 400 })
    }
    const blocks = await retrieveBlocks(question, 5)
    const ragContext = formatRagContext(blocks)
    const text = await generateWithGemini(ragContext, question)
    const sources = blocks.map(b => ({ id: b.id, category: b.category }))
    const duration = Date.now() - started
    return NextResponse.json({ result: text, sources }, { headers: { 'x-duration-ms': String(duration) } })
  } catch (e) {
    return NextResponse.json({ result: '服务暂不可用，请稍后重试', sources: [] }, { status: 500 })
  }
}