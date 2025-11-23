import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '身体翻译官',
  description: '基于张拉整体观的全链路生物力学解局轻应用',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}