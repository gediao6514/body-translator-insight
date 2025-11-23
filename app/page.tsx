'use client'
import { useActionState } from 'react'

async function submit(_: any, formData: FormData) {
  const question = String(formData.get('question') || '')
  if (!question.trim()) {
    return { result: '请输入症状或问题', sources: [] }
  }
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
    const data = await res.json()
    return data
  } catch (e) {
    return { result: '服务暂不可用，请稍后重试', sources: [] }
  }
}

export default function Page() {
  const [state, action, isPending] = useActionState(submit, { result: '', sources: [] })
  return (
    <div className="container">
      <div className="title">身体翻译官</div>
      <div className="desc">基于“张拉整体观”的全链路生物力学解局。请输入你的症状或困扰。</div>
      <form action={action} className="row">
        <input name="question" className="input" placeholder="例如：长时间伏案后颈椎痛并伴随头痛" />
        <button className="button" disabled={isPending}>{isPending ? '分析中…' : '开始解局'}</button>
      </form>
      {state.result && (
        <div className="result">
          {state.result}
          {Array.isArray(state.sources) && state.sources.length > 0 && (
            <div className="sources">来源：{state.sources.map((s: any) => `${s.id}(${s.category})`).join('，')}</div>
          )}
        </div>
      )}
    </div>
  )
}