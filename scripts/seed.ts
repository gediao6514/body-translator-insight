import { getDb } from '../lib/db'

async function main() {
  const db = await getDb()
  const col = db.collection('knowledge_blocks')
  const docs = [
    {
      id: 'S001',
      category: '结构层_深前线',
      keywords: ['颈椎痛', '颈痛', '深前线', 'SCM', '胸廓入口'],
      content_cn:
        '侦察：评估深前线与胸廓入口的张力不均；观察颅颈交界、颈深屈肌与胸锁乳突。策略：先释放胸廓入口与颈深屈肌协同，重建颈部张拉平衡，优先处理远端牵引。',
    },
    {
      id: 'N002',
      category: '神经层_迷走神经调节',
      keywords: ['迷走神经', '自主神经', '呼吸节律', '吞咽反射'],
      content_cn:
        '侦察：心率变异、呼吸节律与吞咽反射耦合情况。策略：低强度节律性呼吸与颈部轻牵引，提高副交感主导以降低痛觉敏感。',
    },
    {
      id: 'B003',
      category: '生化层_炎症与节律',
      keywords: ['炎症', '代谢', '睡眠'],
      content_cn:
        '侦察：睡眠质量与餐后炎症反应。策略：优化作息与微量运动窗口，降低代谢负荷峰值，联合结构/神经层策略促进节律恢复。',
    },
  ]
  for (const d of docs) {
    await col.updateOne({ id: d.id }, { $set: d }, { upsert: true })
  }
  process.stdout.write('Seed completed\n')
  process.exit(0)
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n')
  process.exit(1)
})