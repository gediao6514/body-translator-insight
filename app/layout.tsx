import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '身体翻译官',
  description: '基于张拉整体观的全链路生物力学解局轻应用',
  openGraph: {
    title: '身体翻译官 | 全链路生物力学解局',
    description: '结构→神经→生化三层推理，输出“解局思路”，而非泛化诊断',
    siteName: 'Body Translator Insight',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '身体翻译官' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '身体翻译官 | 全链路生物力学解局',
    description: '结构→神经→生化分层输出“解局思路”',
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}