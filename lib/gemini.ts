import { GoogleGenerativeAI } from '@google/generative-ai'
import { SYSTEM_PROMPT } from './systemPrompt'

const apiKey = process.env.GOOGLE_API_KEY || ''

export async function generateWithGemini(ragContext: string, question: string) {
  if (!apiKey) {
    const header = '模型未配置，以下为基于 RAG 的解局草案\n'
    const body = `结构层：结合检索来源，优先评估远端结构负荷与筋膜张力分布。\n神经层：关注自主神经（如迷走神经）调控与痛觉敏感。\n生化层：考虑炎症因子与能量代谢对恢复节律的影响。\n\nRAG来源：\n${ragContext}`
    return header + body
  }
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: SYSTEM_PROMPT })
  const prompt = `上下文：\n${ragContext}\n\n用户问题：${question}\n\n请依据身份与方法论，只输出“解局思路”，并按结构层->神经层->生化层分段，明确侦察点位与作战策略，给出优先级。`
  const resp = await model.generateContent(prompt)
  const out = resp.response.text()
  return out
}