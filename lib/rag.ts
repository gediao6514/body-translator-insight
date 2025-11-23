import { getDb } from './db'

export type KnowledgeBlock = {
  id: string
  category: string
  keywords: string[]
  content_cn: string
}

const COLLECTION = process.env.MONGODB_COLLECTION || 'knowledge_blocks'

const synonyms: Record<string, string[]> = {
  颈椎痛: ['颈痛', '颈部疼痛', '颈椎不适'],
  头痛: ['偏头痛', '头部疼痛', '紧张性头痛'],
  迷走神经: ['Vagus', '副交感'],
  深前线: ['Deep Front Line', '深前方线', 'DFL'],
  高低肩: ['肩不平', '斜方肌代偿'],
  伏案: ['低头', '颈前伸'],
  失眠: ['睡眠障碍', '睡眠质量差'],
}

function expandKeywords(input: string) {
  const base = Array.from(new Set(input.split(/[^\p{Script=Han}\w]+/u).filter(Boolean)))
  const expanded = new Set<string>(base)
  for (const k of base) {
    for (const s of synonyms[k] || []) expanded.add(s)
  }
  return Array.from(expanded)
}

export async function retrieveBlocks(question: string, limit = 5): Promise<KnowledgeBlock[]> {
  if (!process.env.MONGODB_URI) {
    const sample: KnowledgeBlock[] = [
      {
        id: 'S001',
        category: '结构层_深前线',
        keywords: ['颈椎痛', '深前线', 'SCM'],
        content_cn:
          '侦察：评估深前线（舌骨上肌群、膈肌、髂腰肌）与胸锁乳突张力不均；观察颅颈交界与胸廓入口。策略：先行释放胸廓入口与颈深屈肌的协同，重建颈部屈曲-伸展的张拉平衡。',
      },
      {
        id: 'N002',
        category: '神经层_迷走神经调节',
        keywords: ['迷走神经', '自主神经'],
        content_cn:
          '侦察：心率变异、呼吸节律与吞咽反射的耦合。策略：低强度节律性呼吸与颈部轻柔牵引，提升副交感主导，降低痛觉敏感。',
      },
      {
        id: 'B003',
        category: '生化层_炎症与节律',
        keywords: ['炎症', '代谢'],
        content_cn:
          '侦察：睡眠质量与餐后炎症反应。策略：调整作息与微量运动窗口，降低代谢负荷峰值，配合结构/神经层策略促进节律恢复。',
      },
    ]
    return sample.slice(0, limit)
  }
  const db = await getDb()
  const col = db.collection<KnowledgeBlock>(COLLECTION)
  const kws = expandKeywords(question)
  const cursor = col
    .find({ keywords: { $in: kws } })
    .project({ id: 1, category: 1, keywords: 1, content_cn: 1 })
    .limit(limit)
  const results = await cursor.toArray()
  if (results.length > 0) {
    const weightByCategory: Record<string, number> = {
      结构层_深前线: 3,
      结构层_地基: 3,
      神经层_迷走神经调节: 2,
      神经层: 2,
      生化层_炎症与节律: 1,
      生化层: 1,
    }
    const scored = results.map((b) => {
      const matchCount = (b.keywords || []).filter((k) => kws.includes(k)).length
      const base = weightByCategory[b.category] || 1
      const score = base * 10 + matchCount
      return { b, score }
    })
    scored.sort((a, c) => c.score - a.score)
    return scored.map((x) => x.b).slice(0, limit)
  }
  const fallback = await col.find({}).limit(limit).toArray()
  return fallback
}

export function formatRagContext(blocks: KnowledgeBlock[]) {
  const lines = blocks.map((b, i) => `【来源${i + 1}】${b.id}(${b.category})\n${b.content_cn}`)
  return lines.join('\n\n')
}